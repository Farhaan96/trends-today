#!/usr/bin/env python3
"""
Topic Discovery Module - Find 40-60 candidate topics daily
Priority: Perplexity → Google News → RSS feeds
"""

import os
import json
import hashlib
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import requests
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

class TopicDiscovery:
    def __init__(self):
        self.perplexity_key = os.getenv('PERPLEXITY_API_KEY')
        self.google_key = os.getenv('GOOGLE_API_KEY')
        self.cache_dir = Path('.cache/topics')
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.recent_posts = self._load_recent_posts()
        
    def _load_recent_posts(self, days=7) -> set:
        """Load recent post slugs to avoid duplicates"""
        posts_dir = Path('apps/web/content/posts')
        if not posts_dir.exists():
            return set()
        
        recent = set()
        cutoff = datetime.now() - timedelta(days=days)
        
        for mdx_file in posts_dir.glob('*.mdx'):
            if mdx_file.stat().st_mtime > cutoff.timestamp():
                recent.add(mdx_file.stem)
        
        return recent
    
    def _is_duplicate(self, topic: str) -> bool:
        """Check if topic is too similar to recent posts"""
        topic_slug = topic.lower().replace(' ', '-')[:50]
        return any(slug in topic_slug or topic_slug in slug for slug in self.recent_posts)
    
    def discover_perplexity(self, count: int = 20) -> List[Dict]:
        """Get trending tech topics from Perplexity"""
        if not self.perplexity_key:
            logger.warning("No Perplexity API key, skipping")
            return []
        
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
                        'content': f'List {count} trending tech topics today. Focus on: AI, gadgets, science, space, how-to guides. Return only topic titles, one per line.'
                    }],
                    'temperature': 0.7,
                    'max_tokens': 500
                },
                timeout=30
            )
            
            if response.status_code == 200:
                content = response.json()['choices'][0]['message']['content']
                topics = []
                for line in content.strip().split('\n'):
                    line = line.strip().lstrip('0123456789.-) ')
                    if line and not self._is_duplicate(line):
                        topics.append({
                            'title': line,
                            'source': 'perplexity',
                            'discovered_at': datetime.now().isoformat()
                        })
                
                logger.info(f"Found {len(topics)} topics from Perplexity")
                return topics[:count]
                
        except Exception as e:
            logger.error(f"Perplexity error: {e}")
        
        return []
    
    def discover_google_news(self, count: int = 20) -> List[Dict]:
        """Fallback to Google News for topics"""
        if not self.google_key:
            logger.warning("No Google API key, skipping")
            return []
        
        try:
            # Use Google Custom Search API for tech news
            categories = ['AI news', 'gadget reviews', 'space exploration', 'tech tutorials', 'science breakthroughs']
            topics = []
            
            for category in categories:
                response = requests.get(
                    'https://www.googleapis.com/customsearch/v1',
                    params={
                        'key': self.google_key,
                        'cx': '017576662512468239146:omuauf_lfve',  # Google's news search engine
                        'q': f'{category} {datetime.now().strftime("%Y-%m")}',
                        'num': 5,
                        'sort': 'date'
                    },
                    timeout=15
                )
                
                if response.status_code == 200:
                    items = response.json().get('items', [])
                    for item in items:
                        title = item.get('title', '')
                        if title and not self._is_duplicate(title):
                            topics.append({
                                'title': title,
                                'source': 'google_news',
                                'url': item.get('link'),
                                'discovered_at': datetime.now().isoformat()
                            })
            
            logger.info(f"Found {len(topics)} topics from Google News")
            return topics[:count]
            
        except Exception as e:
            logger.error(f"Google News error: {e}")
        
        return []
    
    def discover_feeds(self, count: int = 20) -> List[Dict]:
        """Fallback to RSS feeds"""
        feeds = [
            'https://techcrunch.com/feed/',
            'https://www.theverge.com/rss/index.xml',
            'https://arstechnica.com/feed/',
            'https://www.wired.com/feed/rss'
        ]
        
        topics = []
        try:
            for feed_url in feeds:
                response = requests.get(feed_url, timeout=10)
                if response.status_code == 200:
                    # Simple RSS parsing without dependencies
                    import re
                    titles = re.findall(r'<title><!\[CDATA\[(.*?)\]\]></title>', response.text)
                    if not titles:
                        titles = re.findall(r'<title>(.*?)</title>', response.text)
                    
                    for title in titles[:5]:
                        if title and not self._is_duplicate(title):
                            topics.append({
                                'title': title,
                                'source': 'rss_feed',
                                'discovered_at': datetime.now().isoformat()
                            })
        
        except Exception as e:
            logger.error(f"RSS feed error: {e}")
        
        logger.info(f"Found {len(topics)} topics from RSS feeds")
        return topics[:count]
    
    def discover(self, target: int = 50) -> List[Dict]:
        """Main discovery method with fallbacks"""
        all_topics = []
        
        # Try each source in priority order
        all_topics.extend(self.discover_perplexity(20))
        
        if len(all_topics) < target:
            all_topics.extend(self.discover_google_news(20))
        
        if len(all_topics) < target:
            all_topics.extend(self.discover_feeds(20))
        
        # Deduplicate by title similarity
        seen = set()
        unique_topics = []
        for topic in all_topics:
            key = topic['title'].lower()[:30]
            if key not in seen:
                seen.add(key)
                unique_topics.append(topic)
        
        # Save to cache
        cache_file = self.cache_dir / f"topics_{datetime.now().strftime('%Y%m%d')}.json"
        with open(cache_file, 'w') as f:
            json.dump(unique_topics[:target], f, indent=2)
        
        logger.info(f"Discovered {len(unique_topics)} unique topics")
        return unique_topics[:target]

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    
    discoverer = TopicDiscovery()
    topics = discoverer.discover(50)
    
    print(f"\nDiscovered {len(topics)} topics:")
    for i, topic in enumerate(topics[:10], 1):
        print(f"{i}. {topic['title']} (via {topic['source']})")