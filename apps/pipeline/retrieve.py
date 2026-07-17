#!/usr/bin/env python3
"""
Retrieval Module - Fetch 1-3 source snippets per topic
Priority: Firecrawl → Perplexity search → Google search
"""

import os
import json
import logging
import re
from html.parser import HTMLParser
from typing import List, Dict, Optional
import requests
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)


class VisibleTextParser(HTMLParser):
    """Extract enough readable page text for a fail-safe direct-source fallback."""

    def __init__(self):
        super().__init__()
        self.text = []
        self.title = []
        self.description = ''
        self._ignored_depth = 0
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in {'script', 'style', 'noscript'}:
            self._ignored_depth += 1
        elif tag == 'title':
            self._in_title = True
        elif tag == 'meta':
            attributes = {key.lower(): value for key, value in attrs if value}
            if attributes.get('name', '').lower() == 'description':
                self.description = attributes.get('content', '')

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in {'script', 'style', 'noscript'} and self._ignored_depth:
            self._ignored_depth -= 1
        elif tag == 'title':
            self._in_title = False

    def handle_data(self, data):
        if self._ignored_depth:
            return
        normalized = re.sub(r'\s+', ' ', data).strip()
        if not normalized:
            return
        if self._in_title:
            self.title.append(normalized)
        else:
            self.text.append(normalized)

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

    def retrieve_direct_urls(self, urls: List[str]) -> Dict:
        """Read reviewed URLs directly when Firecrawl is unavailable."""
        sources = []
        for url in (urls or [])[:3]:
            try:
                response = requests.get(
                    url,
                    timeout=20,
                    headers={'User-Agent': 'TrendsTodayLocalDesk/1.0'},
                )
                if response.status_code != 200:
                    continue
                response.encoding = response.apparent_encoding
                parser = VisibleTextParser()
                parser.feed(response.text)
                snippet = re.sub(
                    r'\s+',
                    ' ',
                    ' '.join([parser.description, *parser.text]),
                ).strip()
                if len(snippet) < 80:
                    continue
                sources.append({
                    'url': url,
                    'snippet': snippet[:2000],
                    'title': ' '.join(parser.title)[:200],
                })
            except Exception as exc:
                logger.warning('Direct retrieval failed for %s: %s', url, exc)
        return {'sources': sources, 'method': 'direct'} if sources else {}

    @staticmethod
    def _merge_sources(*results: Dict) -> Dict:
        sources = []
        methods = []
        seen = set()
        for result in results:
            if not result:
                continue
            if result.get('method'):
                methods.append(result['method'])
            for source in result.get('sources', []):
                url = str(source.get('url', '')).strip()
                if not url or url in seen:
                    continue
                seen.add(url)
                sources.append(source)
                if len(sources) >= 3:
                    return {'sources': sources, 'method': '+'.join(dict.fromkeys(methods))}
        return {
            'sources': sources,
            'method': '+'.join(dict.fromkeys(methods)) or 'unknown',
        }
    
    def retrieve(self, topic: str, urls: List[str] = None) -> Dict:
        """Retrieve reviewed URLs first, then fill the source contract by search."""
        results = [self.retrieve_firecrawl(topic, urls=urls)]
        current = self._merge_sources(*results)

        if urls and len(current.get('sources', [])) < 3:
            results.append(self.retrieve_direct_urls(urls))
            current = self._merge_sources(*results)

        if len(current.get('sources', [])) < 3:
            results.append(self.retrieve_perplexity(topic))
            current = self._merge_sources(*results)

        if len(current.get('sources', [])) < 3:
            results.append(self.retrieve_google(topic))

        result = self._merge_sources(*results)
        
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
