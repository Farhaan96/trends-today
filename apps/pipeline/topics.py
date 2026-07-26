#!/usr/bin/env python3
"""Discover Lower Mainland story candidates from curated evidence and lead sources."""

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
        self._title = None
        self._text = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != 'a':
            return
        attributes = dict(attrs)
        self._href = attributes.get('href')
        self._title = attributes.get('title')
        self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == 'a' and self._href is not None:
            text = self._title or ' '.join(self._text)
            text = re.sub(r'\s+', ' ', text).strip()
            if text:
                self.links.append((text, self._href))
            self._href = None
            self._title = None
            self._text = []

class TopicDiscovery:
    def __init__(self):
        self.perplexity_key = os.getenv('PERPLEXITY_API_KEY')
        self.google_key = os.getenv('GOOGLE_API_KEY')
        self.cache_dir = Path('.cache/topics')
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.recent_posts = self._load_recent_posts()
        self.source_config = self._load_source_config()
        self.last_source_scan = []

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
        """Pull candidate links directly from configured local-source listings."""
        source_batches = []
        scan_rows = []
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
                source_topics = []
                if response.status_code != 200:
                    scan_rows.append(self._source_scan_row(
                        source,
                        response.status_code,
                        0,
                        'non-200 response',
                    ))
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
                        or not self._matches_title_inclusion(source, normalized)
                        or self._matches_title_exclusion(source, normalized)
                        or self._is_duplicate(normalized)
                        or not self._matches_source_link(source, candidate_url)
                        or candidate_url in seen_urls
                    ):
                        continue
                    seen_urls.add(candidate_url)
                    discovery_role = source.get('discoveryRole', 'evidence')
                    source_topics.append({
                        'title': normalized,
                        'source': (
                            'secondary_lead_page'
                            if discovery_role == 'lead'
                            else 'primary_source_page'
                        ),
                        'sourceName': source['name'],
                        'sourceTier': source['tier'],
                        'discoveryRole': discovery_role,
                        'url': candidate_url,
                        'locality': source['locality'],
                        'category': source.get('category', source['desks'][0]),
                    'storyType': 'reported-update',
                        'sourceTopic': source.get('topicGroup', source['desks'][0]),
                        'discovered_at': datetime.now().isoformat(),
                    })
                    accepted += 1
                    if accepted >= max_per_source:
                        break
                if source_topics:
                    source_batches.append(source_topics)
                scan_rows.append(self._source_scan_row(
                    source,
                    response.status_code,
                    len(source_topics),
                    'accepted candidates' if source_topics else 'no matching candidate links',
                ))
            except Exception as exc:
                logger.warning('Source scan failed for %s: %s', source['name'], exc)
                scan_rows.append(self._source_scan_row(source, None, 0, str(exc)))
        self.last_source_scan = scan_rows

        topics = []
        max_batch_size = max((len(batch) for batch in source_batches), default=0)
        for index in range(max_batch_size):
            for batch in source_batches:
                if index < len(batch):
                    topics.append(batch[index])
                    if len(topics) >= count:
                        break
            if len(topics) >= count:
                break
        logger.info('Found %s candidates on configured source pages', len(topics))
        return topics[:count]

    @staticmethod
    def _source_scan_row(source: Dict, status_code, accepted_count: int, status: str) -> Dict:
        return {
            'sourceName': source.get('name'),
            'category': source.get('category', source.get('desks', ['unknown'])[0]),
            'sourceTopic': source.get('topicGroup', source.get('desks', ['unknown'])[0]),
            'locality': source.get('locality'),
            'url': source.get('url'),
            'httpStatus': status_code,
            'acceptedCount': accepted_count,
            'status': status,
        }

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
    def _matches_title_inclusion(source: Dict, title: str) -> bool:
        include_regex = source.get('includeTitleRegex')
        return not include_regex or bool(re.search(include_regex, title, re.IGNORECASE))

    @staticmethod
    def _matches_title_exclusion(source: Dict, title: str) -> bool:
        exclude_regex = source.get('excludeTitleRegex')
        return bool(exclude_regex and re.search(exclude_regex, title, re.IGNORECASE))

    @staticmethod
    def summarize_source_yield(topics: List[Dict], source_scan: List[Dict] = None) -> List[Dict]:
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
                    'acceptedCount': 0,
                    'includedCount': 0,
                    'sampleTitles': [],
                }
            grouped[key]['count'] += 1
            grouped[key]['includedCount'] += 1
            if len(grouped[key]['sampleTitles']) < 3:
                grouped[key]['sampleTitles'].append(topic.get('title'))

        for row in source_scan or []:
            source_name = row.get('sourceName') or 'unknown'
            category = row.get('category') or 'unknown'
            source_topic = row.get('sourceTopic') or category
            key = f'{source_name}\0{category}\0{source_topic}'
            if key not in grouped:
                grouped[key] = {
                    'sourceName': source_name,
                    'category': category,
                    'sourceTopic': source_topic,
                    'count': 0,
                    'acceptedCount': int(row.get('acceptedCount') or 0),
                    'includedCount': 0,
                    'sampleTitles': [],
                }
            else:
                grouped[key]['acceptedCount'] = int(row.get('acceptedCount') or 0)
            grouped[key]['locality'] = row.get('locality')
            grouped[key]['url'] = row.get('url')
            grouped[key]['httpStatus'] = row.get('httpStatus')
            grouped[key]['status'] = row.get('status')
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
                            'transit and roads, weather, events, restaurant changes, local retail '
                            'and business openings, closures, relocations, closing sales, major '
                            'renovations, and long-running neighbourhood institutions that are '
                            'changing, plus housing, development, and local sports. Include useful '
                            'non-event changes that residents would tell a neighbour about. Treat '
                            'local-publication coverage and community sightings as discovery leads '
                            'only; prefer items with a business announcement, official current '
                            'store page, property or lease document, municipal record, or another '
                            'primary source available for independent verification. Prefer primary '
                            'sources and '
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
                'Vancouver Surrey Burnaby Richmond events',
                'Metro Vancouver retail store local business opening closing relocation closing sale',
                'Vancouver neighbourhood business new location major renovation long-running shop',
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
