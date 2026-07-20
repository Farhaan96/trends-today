#!/usr/bin/env python3
"""
Draft Module - Generate 600-900 word articles
Uses Claude (Opus 4.8) → OpenAI → Gemini with fallbacks
"""

import os
import json
import logging
from typing import Dict, List, Optional
import requests
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

STYLE_GUIDE = """
- Fast, useful local-news tone; write for Lower Mainland residents first
- State the affected municipality and practical reader impact near the top
- Lead with the verified change, not a generic summary or manufactured curiosity
- Put a concrete, source-supported detail and the resident consequence in the first 80 words
- Use active verbs, varied sentence openings, and a mix of short and medium sentences
- Make every section answer a practical reader question; cut throat-clearing and filler
- Sentence-case titles, 45-75 chars, no clickbait that the body cannot deliver
- Use the requested contract: bulletin 250-450 words, reported update 450-800,
  or guide/explainer 700-1200; use 2-4 H2 (##) sections and short paragraphs
- Open with the confirmed news and who it affects
- Bold only the numbers, dates, institutions, and details that matter
- Use periods and commas for rhythm; do not use em dashes
- Ground every claim in the provided sources; do not invent statistics
- Include one [[INTERNAL: keyword]] placeholder for internal linking
- End with what residents should watch or do next
- Leave readers with a specific next step, date, decision, or unanswered local question
- End with a ## Sources section containing every provided source URL
"""

class ArticleDrafter:
    def __init__(self):
        self.anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.gemini_key = os.getenv('GOOGLE_GEMINI_API_KEY')
        self.primary_llm = os.getenv('PRIMARY_LLM', 'claude')
        
    def _build_prompt(self, topic: str, sources: List[Dict]) -> str:
        """Build the article generation prompt"""
        source_text = "\n".join([
            f"- {s.get('title', 'Source')} ({s.get('url', 'URL unavailable')}): {s['snippet'][:300]}"
            for s in sources[:5]
        ])

        return f"""You are writing for Trends Today, a Lower Mainland local-news publication.
Write an original, practical update on:
{topic}

Use only the angle and details the sources support. Do not pad a short update into a long
article. Do not copy source phrasing. Make the locality and resident impact explicit.

Sources (ground every factual claim in these — do not fabricate stats):
{source_text}

Style Guide:
{STYLE_GUIDE}

Return ONLY a JSON object with these keys:
- title: sentence case, 50-70 chars, specific and curiosity-driven (no clickbait)
- subtitle: one-sentence hook that promises a concrete payoff
- body_mdx: the word range required by the supplied story type, 2-4 ## H2 sections,
  bold key details, zero em dashes, one [[INTERNAL: keyword]] placeholder, and a ## Sources section
- meta_description: ≤155 chars, includes the primary search phrase naturally
- tags: 3-5 specific, relevant tags (lowercase)"""

    def _claude_cli(self, system: str, user_prompt: str) -> Optional[str]:
        """Generate via the local Claude Code CLI (uses the logged-in Max
        subscription — no API key / no per-token billing). Returns raw text,
        or None if the CLI is unavailable or errors so callers can fall back."""
        import shutil, subprocess
        claude_bin = os.getenv('CLAUDE_BIN') or shutil.which('claude')
        if not claude_bin:
            return None
        full = f"{system}\n\n{user_prompt}\n\nReturn ONLY the JSON object, nothing else."
        # Strip CLAUDECODE so this still works if ever invoked from inside a
        # Claude Code session (which otherwise blocks nested CLI launches).
        env = {k: v for k, v in os.environ.items() if k != 'CLAUDECODE'}
        try:
            proc = subprocess.run(
                [claude_bin, '-p', '--model', 'claude-opus-4-8', '--output-format', 'text'],
                input=full, capture_output=True, text=True, timeout=240, env=env
            )
            if proc.returncode == 0 and proc.stdout.strip():
                return proc.stdout.strip()
            logger.error(f"claude CLI rc={proc.returncode}: {(proc.stderr or '')[:200]}")
        except Exception as e:
            logger.error(f"claude CLI error: {e}")
        return None

    def draft_claude(self, topic: str, sources: List[Dict]) -> Optional[Dict]:
        """Generate with Claude — local Claude CLI (Max subscription) first,
        Anthropic API as fallback."""
        _system = (
            'You are a sharp tech reporter. Return ONLY a single valid JSON '
            'object matching the requested schema. No prose, no markdown code '
            'fences, no commentary outside the JSON.'
        )
        _cli = self._claude_cli(_system, self._build_prompt(topic, sources))
        if _cli:
            try:
                return json.loads(self._strip_json(_cli))
            except Exception:
                return self._parse_text_response(topic, _cli)

        if not self.anthropic_key:
            return None
        
        try:
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers={
                    'x-api-key': self.anthropic_key,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                json={
                    'model': 'claude-opus-4-8',
                    'max_tokens': 3000,
                    'system': (
                        'You are a sharp tech reporter. Return ONLY a single valid JSON '
                        'object matching the requested schema. No prose, no markdown code '
                        'fences, no commentary outside the JSON.'
                    ),
                    'messages': [{
                        'role': 'user',
                        'content': self._build_prompt(topic, sources)
                    }],
                    'temperature': 0.7
                },
                timeout=60
            )
            
            if response.status_code == 200:
                content = response.json()['content'][0]['text']
                # Try to parse as JSON (tolerate code fences / surrounding prose)
                try:
                    return json.loads(self._strip_json(content))
                except Exception:
                    # Fallback: extract from text
                    return self._parse_text_response(topic, content)
            else:
                logger.error(f"Claude HTTP {response.status_code}: {response.text[:200]}")

        except Exception as e:
            logger.error(f"Claude error: {e}")
        
        return None
    
    def draft_openai(self, topic: str, sources: List[Dict]) -> Optional[Dict]:
        """Generate with OpenAI GPT"""
        if not self.openai_key:
            return None
        
        try:
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.openai_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {'role': 'system', 'content': 'You are a tech reporter. Write engaging, factual explainers.'},
                        {'role': 'user', 'content': self._build_prompt(topic, sources)}
                    ],
                    'temperature': 0.7,
                    'max_tokens': 2000,
                    'response_format': {'type': 'json_object'}
                },
                timeout=30
            )
            
            if response.status_code == 200:
                content = response.json()['choices'][0]['message']['content']
                return json.loads(content)
                
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
        
        return None
    
    def draft_gemini(self, topic: str, sources: List[Dict]) -> Optional[Dict]:
        """Generate with Google Gemini"""
        if not self.gemini_key:
            return None
        
        try:
            response = requests.post(
                f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
                params={'key': self.gemini_key},
                json={
                    'contents': [{
                        'parts': [{
                            'text': self._build_prompt(topic, sources)
                        }]
                    }],
                    'generationConfig': {
                        'temperature': 0.7,
                        'maxOutputTokens': 2000,
                        'responseMimeType': 'application/json'
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                content = response.json()['candidates'][0]['content']['parts'][0]['text']
                return json.loads(content)
                
        except Exception as e:
            logger.error(f"Gemini error: {e}")
        
        return None
    
    def _strip_json(self, text: str) -> str:
        """Strip markdown code fences / surrounding prose to expose the JSON object."""
        import re
        # Remove ```json ... ``` or ``` ... ``` fences if present
        fence = re.search(r'```(?:json)?\s*(.*?)```', text, re.DOTALL)
        if fence:
            text = fence.group(1)
        # Otherwise, grab the outermost {...} block
        else:
            brace = re.search(r'\{.*\}', text, re.DOTALL)
            if brace:
                text = brace.group(0)
        return text.strip()

    def _parse_text_response(self, topic: str, text: str) -> Dict:
        """Fallback parser for non-JSON responses"""
        import re
        
        # Extract title
        title_match = re.search(r'[Tt]itle:?\s*(.+)', text)
        title = title_match.group(1).strip() if title_match else topic[:70]
        
        # Extract body (everything after first ##)
        body_match = re.search(r'(##.+)', text, re.DOTALL)
        body = body_match.group(1) if body_match else text
        
        return {
            'title': title,
            'subtitle': 'Discover the latest insights and developments',
            'body_mdx': body[:900],
            'meta_description': title[:155],
            'tags': ['tech', 'news', 'innovation']
        }
    
    def draft(self, topic: str, sources: List[Dict]) -> Optional[Dict]:
        """Main drafting with fallbacks"""
        article = None
        
        # Try primary LLM first
        if self.primary_llm == 'claude':
            article = self.draft_claude(topic, sources)
        elif self.primary_llm == 'openai':
            article = self.draft_openai(topic, sources)
        elif self.primary_llm == 'gemini':
            article = self.draft_gemini(topic, sources)
        
        # Fallback chain
        if not article:
            article = self.draft_claude(topic, sources)
        if not article:
            article = self.draft_openai(topic, sources)
        if not article:
            article = self.draft_gemini(topic, sources)
        
        # Never convert an unavailable model into fabricated publishable copy.
        if not article:
            logger.error("All drafting models failed; no candidate was created")
            return None

        words = len(article['body_mdx'].split())
        logger.info(f"Drafted article: {article['title']} ({words} words)")
        return article

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    
    drafter = ArticleDrafter()
    article = drafter.draft(
        "AI coding assistants in 2024",
        [{'snippet': 'AI assistants are transforming software development...'}]
    )
    
    print(f"\nTitle: {article['title']}")
    print(f"Subtitle: {article['subtitle']}")
    print(f"Words: {len(article['body_mdx'].split())}")
    print(f"Tags: {', '.join(article['tags'])}")
