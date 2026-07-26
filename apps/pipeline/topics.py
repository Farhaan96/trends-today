#!/usr/bin/env python3
"""Discover Lower Mainland story candidates from curated primary sources."""

import os
import json
import logging
import re
from datetime import datetime, timedelta
from html.parser import HTMLParser
from typing import List, Dict
from urllib.parse import urljoin, urlparse
import requests
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_CONFIG = REPO_ROOT / 'config' / 'local-news-sources.json'


class HeadlineLinkParser(HTMLParser):
    """Collect visible link text without adding an HTML parser dependency."""

    def __init__(self):
        super().__init__()
        self.links = []
        self._href = None
        self._text = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != 'a':
            return
        self._href = dict(attrs).get('href')
        self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == 'a' and self._href is not None:
            text = re.sub(r'\s+', ' ', ' '.join(self._text)).strip()
            if text:
                self.links.append((text, self._href))
            self._href = None
            self._text = []

class TopicDiscovery:
    def __init__(self):
        self.perplexity_key = os.getenv('PERPLEXITY_API_KEY')
        self.google_key = os.getenv('GOOGLE_API_KEY')
        self.cache_dir = Path('.cache/topics')
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.recent_posts = self._load_recent_posts()
        self.source_config = self._load_source_config()

    def _load_source_config(self) -> Dict:
        with SOURCE_CONFIG.open(encoding='utf-8') as handle:
            return json.load(handle)

    @property
    def discovery_sources(self) -> List[Dict]:
        return [
            source for source in self.source_config.get('sources', [])
            if source.get('discoveryEnabled')
        ]
        
    def _load_recent_posts(self, days=7) -> set:
        """Load recent post slugs to avoid duplicates"""
        posts_dir = Path(__file__).resolve().parents[2] / 'content'
        if not posts_dir.exists():
            return set()

        recent = set()
        cutoff = datetime.now() - timedelta(days=days)
        
        for mdx_file in posts_dir.glob('*/*.mdx'):
            if mdx_file.stat().st_mtime > cutoff.timestamp():
                recent.add(mdx_file.stem)
        
        return recent
    
    def _is_duplicate(self, topic: str) -> bool:
        """Check if topic is too similar to recent posts"""
        topic_slug = topic.lower().replace(' ', '-')[:50]
        return any(slug in topic_slug or topic_slug in slug for slug in self.recent_posts)

    def discover_official_pages(self, count: int = 30) -> List[Dict]:
        """Pull candidate links directly from configured primary-source listings."""
        topics = []
        seen_urls = set()
        ignored = {
            'home', 'news', 'events', 'contact us', 'read more', 'learn more',
            'media centre', 'search', 'subscribe', 'view all', 'privacy',
        }
        for source in self.discovery_sources:
            try:
                response = requests.get(
                    source['url'],
                    timeout=12,
                    headers={'User-Agent': 'TrendsTodayLocalDesk/1.0'},
                )
                if response.status_code != 200:
                    continue
                response.encoding = response.apparent_encoding
                parser = HeadlineLinkParser()
                parser.feed(response.text)
                accepted = 0
                max_per_source = int(source.get('maxCandidatesPerSweep', 4))
                minimum_title_length = int(source.get('minimumTitleLength', 28))
                maximum_title_length = int(source.get('maximumTitleLength', 180))
                for title, href in parser.links:
                    normalized = (
                        title.strip(' -|')
                        .replace('\u2013', '-')
                        .replace('\u2014', '-')
                        .replace('\u2026', '...')
                    )
                    candidate_url = urljoin(response.url, href)
                    if (
                        len(normalized) < minimum_title_length
                        or len(normalized) > maximum_title_length
                        or normalized.startswith('/')
                        or normalized.lower() in ignored
                        or self._matches_title_exclusion(source, normalized)
                        or self._is_duplicate(normalized)
                        or not self._matches_source_link(source, candidate_url)
                        or candidate_url in seen_urls
                    ):
                        continue
                    seen_urls.add(candidate_url)
                    topics.append({
                        'title': normalized,
                        'source': 'primary_source_page',
                        'sourceName': source['name'],
                        'sourceTier': source['tier'],
                        'url': candidate_url,
                        'locality': source['locality'],
                        'category': source.get('category', source['desks'][0]),
                        'storyType': source.get('storyType', 'reported-update'),
                        'sourceTopic': source.get('topicGroup', source['desks'][0]),
                        'discovered_at': datetime.now().isoformat(),
                    })
                    accepted += 1
                    if accepted >= max_per_source or len(topics) >= count:
                        break
                if len(topics) >= count:
                    break
            except Exception as exc:
                logger.warning('Primary source scan failed for %s: %s', source['name'], exc)
        logger.info('Found %s candidates on primary source pages', len(topics))
        return topics[:count]

    @staticmethod
    def _matches_source_link(source: Dict, candidate_url: str) -> bool:
        """Accept only links that match the source's explicit article contract."""
        parsed = urlparse(candidate_url)
        hostname = parsed.hostname or ''
        source_domain = source.get('domain', '')
        if source_domain and not (
            hostname == source_domain or hostname.endswith(f'.{source_domain}')
        ):
            return False

        if candidate_url.rstrip('/') == source['url'].rstrip('/'):
            return False

        path_with_query = parsed.path
        if parsed.query:
            path_with_query += f'?{parsed.query}'

        include_patterns = source.get('includeUrlPatterns', [])
        if include_patterns and not any(
            pattern in path_with_query for pattern in include_patterns
        ):
            return False

        include_regex = source.get('includeUrlRegex')
        if include_regex and not re.search(include_regex, path_with_query):
            return False

        exclude_patterns = source.get('excludeUrlPatterns', [])
        if exclude_patterns and any(
            pattern in path_with_query for pattern in exclude_patterns
        ):
            return False

        exclude_regex = source.get('excludeUrlRegex')
        if exclude_regex and re.search(exclude_regex, path_with_query):
            return False

        return bool(include_patterns or include_regex)

    @staticmethod
    def _matches_title_exclusion(source: Dict, title: str) -> bool:
        exclude_regex = source.get('excludeTitleRegex')
        return bool(exclude_regex and re.search(exclude_regex, title, re.IGNORECASE))

    @staticmethod
    def summarize_source_yield(topics: List[Dict]) -> List[Dict]:
        """Group discovery output for audit-friendly skip and yield reporting."""
        grouped: Dict[str, Dict] = {}
        for topic in topics:
            source_name = topic.get('sourceName') or topic.get('source') or 'unknown'
            category = topic.get('category') or 'unknown'
            source_topic = topic.get('sourceTopic') or category
            key = f'{source_name}\0{category}\0{source_topic}'
            if key not in grouped:
                grouped[key] = {
                    'sourceName': source_name,
                    'category': category,
                    'sourceTopic': source_topic,
                    'count': 0,
                    'sampleTitles': [],
                }
            grouped[key]['count'] += 1
            if len(grouped[key]['sampleTitles']) < 3:
                grouped[key]['sampleTitles'].append(topic.get('title'))
        return sorted(
            grouped.values(),
            key=lambda item: (
                str(item['category']),
                str(item['sourceName']),
                str(item['sourceTopic']),
            ),
        )
    
    def discover_perplexity(self, count: int = 20) -> List[Dict]:
        """Find recent Lower Mainland updates that the primary-page scan missed."""
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
                    'model': 'sonar',
                    'messages': [{
                        'role': 'user',
                        'content': (
                            f'List {count} verifiable updates from the last 36 hours that matter '
                            'to people in Metro Vancouver or the Fraser Valley. Cover civic news, '
                            'transit and roads, weather, events, restaurant openings or closures, '
                            'housing and development, and local sports. Prefer primary sources and '
                            'name the affected municipality in every title. Exclude national stories '
                            'without a direct Lower Mainland impact and exclude rumours. '
                            'Return only sentence-case article titles, one per '
                            'line, no numbering, no commentary.'
                        )
                    }],
                    'temperature': 0.8,
                    'max_tokens': 900
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
        """Use search as a fallback for local candidates."""
        if not self.google_key:
            logger.warning("No Google API key, skipping")
            return []
        
        try:
            categories = [
                'Lower Mainland local news',
                'Metro Vancouver transit road closure weather',
                'Vancouver Surrey Burnaby Richmond events opening closing',
                'Metro Vancouver housing development council',
                'Vancouver local sports update',
            ]
            topics = []
            
            for category in categories:
                response = requests.get(
                    'https://www.googleapis.com/customsearch/v1',
                    params={
                        'key': self.google_key,
                        'cx': '017576662512468239146:omuauf_lfve',  # Google's news search engine
                        'q': f'{category} {datetime.now().strftime("%Y-%m-%d")}',
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
                                'locality': 'Lower Mainland',
                                'category': 'local-news',
                                'storyType': 'reported-update',
                                'discovered_at': datetime.now().isoformat()
                            })
            
            logger.info(f"Found {len(topics)} topics from Google News")
            return topics[:count]
            
        except Exception as e:
            logger.error(f"Google News error: {e}")
        
        return []
    
    def discover_feeds(self, count: int = 20) -> List[Dict]:
        """Backward-compatible alias for the curated local source scan."""
        return self.discover_official_pages(count)
    
    def discover(self, target: int = 50) -> List[Dict]:
        """Scan primary local sources first, then fill gaps with search."""
        all_topics = []
        
        official_limit = int(self.source_config.get('officialCandidateLimit', target))
        all_topics.extend(self.discover_official_pages(min(target, official_limit)))
        
        if len(all_topics) < target:
            all_topics.extend(
                self.discover_perplexity(min(20, target - len(all_topics)))
            )
        
        if len(all_topics) < target:
            all_topics.extend(
                self.discover_google_news(min(20, target - len(all_topics)))
            )
        
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
