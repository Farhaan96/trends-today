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
- Curious, accessible explainer tone; write for humans first, search engines second
- Lead with a genuinely original angle or surprising insight — never a generic summary
- Sentence-case titles, 50-70 chars, no clickbait that the body can't deliver
- 600-900 words total, 2-4 H2 (##) sections, paragraphs ≤4 sentences
- Open with a 50-80 word hook built around a concrete, verifiable number or stark fact
- Immediately follow the hook with a 40-60 word "featured answer" paragraph that
  directly answers the title's implied question (great for featured snippets / voice search)
- Bold the specific numbers, study names, and institutions that matter (e.g. **63% faster**,
  **Nature**, **MIT**) — not random words
- Use periods and commas for rhythm; MAXIMUM 2 em-dashes (—) in the whole article
- Ground every claim in the provided sources; do not invent statistics
- Include one [[INTERNAL: keyword]] placeholder for internal linking
- End with an actionable takeaway or a single sharp question
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
            f"- {s.get('title', 'Source')}: {s['snippet'][:300]}"
            for s in sources[:5]
        ])

        return f"""You are writing for Trends Today, a general-interest publication covering
science, technology, space, health, psychology, and culture. Write a standout article on:
{topic}

Find the most interesting, non-obvious angle the sources support — the detail a curious
reader would repeat to a friend. Avoid generic "here's an overview" framing. If the sources
reveal a surprising number, a counterintuitive finding, or a "wait, really?" moment, build
the piece around it.

Sources (ground every factual claim in these — do not fabricate stats):
{source_text}

Style Guide:
{STYLE_GUIDE}

Return ONLY a JSON object with these keys:
- title: sentence case, 50-70 chars, specific and curiosity-driven (no clickbait)
- subtitle: one-sentence hook that promises a concrete payoff
- body_mdx: 600-900 words, 2-4 ## H2 sections, opening hook + featured-answer paragraph,
  bold key numbers, ≤2 em-dashes, one [[INTERNAL: keyword]] placeholder
- meta_description: ≤155 chars, includes the primary search phrase naturally
- tags: 3-5 specific, relevant tags (lowercase)"""

    def draft_claude(self, topic: str, sources: List[Dict]) -> Optional[Dict]:
        """Generate with Claude (Anthropic)"""
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
                    return self._parse_text_response(content)
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

    def _parse_text_response(self, text: str) -> Dict:
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
    
    def draft(self, topic: str, sources: List[Dict]) -> Dict:
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
        
        # Last resort: simple template
        if not article:
            logger.warning("All LLMs failed, using template")
            article = {
                'title': topic[:70],
                'subtitle': 'Exploring the latest developments',
                'body_mdx': f"""## Understanding {topic}

{topic} represents an important development in technology. Recent advances have shown significant potential for innovation and practical applications.

## Key Features

The main aspects include improved performance, better user experience, and enhanced capabilities that set new standards in the field.

## What's Next

As technology continues to evolve, we can expect further improvements and wider adoption. What aspects interest you most?""",
                'meta_description': f'Learn about {topic} - latest developments and insights',
                'tags': ['technology', 'innovation', 'news']
            }
        
        # Ensure word count
        words = len(article['body_mdx'].split())
        if words < 600:
            article['body_mdx'] += f"\n\n## Additional Insights\n\nThis technology continues to evolve rapidly, with new applications emerging regularly. Industry experts predict significant growth in adoption over the coming months, driven by improved capabilities and broader understanding of potential use cases.\n\nThe implications extend beyond immediate applications, potentially reshaping how we approach similar challenges across various sectors."
        
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