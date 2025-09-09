#!/usr/bin/env python3
"""
Retrieval Module - Fetch 1-3 source snippets per topic
Priority: Firecrawl → Perplexity search → Google search
"""

import os
import json
import logging
from typing import List, Dict, Optional
import requests
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

class ContentRetrieval:
    def __init__(self):
        self.firecrawl_key = os.getenv('FIRECRAWL_API_KEY')
        self.perplexity_key = os.getenv('PERPLEXITY_API_KEY')
        self.google_key = os.getenv('GOOGLE_API_KEY')
        self.cache_dir = Path('.cache/sources')
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
    def retrieve_firecrawl(self, topic: str, urls: List[str] = None) -> Dict:
        """Scrape content from URLs using Firecrawl"""
        if not self.firecrawl_key:
            return {}
        
        try:
            # If no URLs provided, search first
            if not urls:
                search_response = requests.post(
                    'https://api.firecrawl.dev/v1/search',
                    headers={'Authorization': f'Bearer {self.firecrawl_key}'},
                    json={'query': topic, 'limit': 3},
                    timeout=30
                )
                if search_response.status_code == 200:
                    results = search_response.json().get('data', [])
                    urls = [r['url'] for r in results[:3]]
            
            sources = []
            for url in urls[:3]:
                response = requests.post(
                    'https://api.firecrawl.dev/v1/scrape',
                    headers={'Authorization': f'Bearer {self.firecrawl_key}'},
                    json={'url': url, 'formats': ['markdown']},
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json().get('data', {})
                    content = data.get('markdown', '')[:1000]  # First 1000 chars
                    sources.append({
                        'url': url,
                        'snippet': content,
                        'title': data.get('metadata', {}).get('title', '')
                    })
            
            return {'sources': sources, 'method': 'firecrawl'}
            
        except Exception as e:
            logger.error(f"Firecrawl error: {e}")
        
        return {}
    
    def retrieve_perplexity(self, topic: str) -> Dict:
        """Get sources via Perplexity search"""
        if not self.perplexity_key:
            return {}
        
        try:
            response = requests.post(
                'https://api.perplexity.ai/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.perplexity_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'llama-3.1-sonar-small-128k-online',
                    'messages': [{
                        'role': 'user',
                        'content': f'Find 3 authoritative sources about: {topic}. Include URL and key facts.'
                    }],
                    'temperature': 0.3,
                    'max_tokens': 800
                },
                timeout=30
            )
            
            if response.status_code == 200:
                content = response.json()['choices'][0]['message']['content']
                # Parse response for URLs and snippets
                sources = []
                lines = content.split('\n')
                for i in range(0, len(lines), 2):
                    if i+1 < len(lines):
                        sources.append({
                            'url': lines[i].strip(),
                            'snippet': lines[i+1].strip()[:500]
                        })
                
                return {'sources': sources[:3], 'method': 'perplexity'}
                
        except Exception as e:
            logger.error(f"Perplexity retrieval error: {e}")
        
        return {}
    
    def retrieve_google(self, topic: str) -> Dict:
        """Fallback to Google search for sources"""
        if not self.google_key:
            return {}
        
        try:
            response = requests.get(
                'https://www.googleapis.com/customsearch/v1',
                params={
                    'key': self.google_key,
                    'cx': '017576662512468239146:omuauf_lfve',
                    'q': topic,
                    'num': 3
                },
                timeout=15
            )
            
            if response.status_code == 200:
                items = response.json().get('items', [])
                sources = []
                for item in items:
                    sources.append({
                        'url': item.get('link'),
                        'snippet': item.get('snippet', '')[:500],
                        'title': item.get('title')
                    })
                
                return {'sources': sources, 'method': 'google'}
                
        except Exception as e:
            logger.error(f"Google search error: {e}")
        
        return {}
    
    def retrieve(self, topic: str) -> Dict:
        """Main retrieval with fallbacks"""
        # Try each method in order
        result = self.retrieve_firecrawl(topic)
        
        if not result or not result.get('sources'):
            result = self.retrieve_perplexity(topic)
        
        if not result or not result.get('sources'):
            result = self.retrieve_google(topic)
        
        # Cache the result
        if result and result.get('sources'):
            cache_key = topic.lower().replace(' ', '_')[:50]
            cache_file = self.cache_dir / f"{cache_key}.json"
            with open(cache_file, 'w') as f:
                json.dump(result, f, indent=2)
            
            logger.info(f"Retrieved {len(result.get('sources', []))} sources for: {topic}")
        
        return result

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    
    retriever = ContentRetrieval()
    result = retriever.retrieve("Best AI tools 2024")
    
    if result.get('sources'):
        print(f"\nRetrieved via {result['method']}:")
        for i, source in enumerate(result['sources'], 1):
            print(f"\n{i}. {source.get('title', source['url'])}")
            print(f"   {source['snippet'][:200]}...")