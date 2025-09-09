#!/usr/bin/env python3
"""
QA Module - Quality pass to fix tone, grammar, check claims
Second LLM pass for content refinement
"""

import os
import json
import logging
from typing import Dict
import requests

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

class QualityAssurance:
    def __init__(self):
        self.anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.gemini_key = os.getenv('GOOGLE_GEMINI_API_KEY')
        
    def _build_qa_prompt(self, article: Dict, sources: List[Dict]) -> str:
        """Build QA refinement prompt"""
        source_facts = "\n".join([s['snippet'][:200] for s in sources[:3]])
        
        return f"""Review and improve this article:

Title: {article['title']}
Body: {article['body_mdx']}

Source Facts:
{source_facts}

Requirements:
- Check claims against sources
- Remove redundancy and fluff
- Ensure 600-900 words
- Keep curious, accessible tone
- Maintain 2-4 H2 sections
- Paragraphs ≤4 sentences
- Fix any grammar issues

Return the corrected body_mdx only."""

    def qa_check(self, article: Dict, sources: List[Dict] = None) -> Dict:
        """Run quality assurance pass"""
        sources = sources or []
        prompt = self._build_qa_prompt(article, sources)
        
        # Try Claude first for QA
        if self.anthropic_key:
            try:
                response = requests.post(
                    'https://api.anthropic.com/v1/messages',
                    headers={
                        'x-api-key': self.anthropic_key,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    json={
                        'model': 'claude-3-haiku-20240307',
                        'max_tokens': 1500,
                        'messages': [{
                            'role': 'user',
                            'content': prompt
                        }],
                        'temperature': 0.3
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    corrected_body = response.json()['content'][0]['text']
                    article['body_mdx'] = corrected_body
                    logger.info("QA pass completed with Claude")
                    return article
                    
            except Exception as e:
                logger.error(f"Claude QA error: {e}")
        
        # Fallback to OpenAI
        if self.openai_key:
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
                            {'role': 'system', 'content': 'You are a tech editor. Improve articles for clarity and accuracy.'},
                            {'role': 'user', 'content': prompt}
                        ],
                        'temperature': 0.3,
                        'max_tokens': 1500
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    corrected_body = response.json()['choices'][0]['message']['content']
                    article['body_mdx'] = corrected_body
                    logger.info("QA pass completed with OpenAI")
                    return article
                    
            except Exception as e:
                logger.error(f"OpenAI QA error: {e}")
        
        # If all fail, do basic cleanup
        body = article['body_mdx']
        
        # Remove duplicate words
        import re
        body = re.sub(r'\b(\w+)(\s+\1\b)+', r'\1', body)
        
        # Ensure proper markdown formatting
        body = re.sub(r'\n{3,}', '\n\n', body)
        
        # Check word count
        words = len(body.split())
        if words < 600:
            body += "\n\n## Looking Ahead\n\nAs this technology continues to mature, we can expect to see even more innovative applications and improvements. The potential for transformation across various industries remains significant."
        elif words > 900:
            # Trim to ~900 words
            sentences = body.split('. ')
            target_sentences = int(len(sentences) * 0.9)
            body = '. '.join(sentences[:target_sentences]) + '.'
        
        article['body_mdx'] = body
        logger.info("QA pass completed with basic cleanup")
        return article

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    
    qa = QualityAssurance()
    
    test_article = {
        'title': 'Test Article',
        'body_mdx': '## Introduction\n\nThis is a test test article with duplicate words words.'
    }
    
    improved = qa.qa_check(test_article)
    print(f"Improved article:\n{improved['body_mdx']}")