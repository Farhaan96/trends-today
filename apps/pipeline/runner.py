#!/usr/bin/env python3
"""Research, stage, and explicitly promote Trends Today content."""

import os
import sys
import json
import time
import random
import logging
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from topics import TopicDiscovery
from retrieve import ContentRetrieval
from draft import ArticleDrafter
from qa import QualityAssurance
from image import ImageFinder
from seo import SEOOptimizer
from publish import Publisher, promote_candidate
from strategy import build_research_queue
from validation import validate_release_candidate

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

VALID_CATEGORIES = {'science', 'technology', 'space', 'health', 'psychology', 'culture'}


def resolve_category(topic: Dict, article: Dict) -> str:
    """Choose one category from explicit research first, then narrow keywords."""
    explicit = str(topic.get('category', '')).lower()
    if explicit in VALID_CATEGORIES:
        return explicit
    tags = {str(tag).lower() for tag in article.get('tags', [])}
    direct = tags & VALID_CATEGORIES
    if direct:
        return sorted(direct)[0]
    text = f"{topic.get('title', '')} {article.get('title', '')}".lower()
    keyword_map = {
        'space': ('space', 'nasa', 'planet', 'moon', 'mars', 'asteroid', 'telescope'),
        'health': ('health', 'medical', 'disease', 'patient', 'drug', 'cancer', 'clinical'),
        'psychology': ('psychology', 'brain', 'behavior', 'mental', 'emotion', 'cognitive'),
        'science': ('science', 'study', 'researcher', 'physics', 'biology', 'chemistry'),
        'culture': ('culture', 'media', 'art', 'music', 'creator', 'social'),
    }
    for category, keywords in keyword_map.items():
        if any(keyword in text for keyword in keywords):
            return category
    return 'technology'


def eligible_candidates_from_payload(payload: object) -> List[Dict]:
    """Return only fully scored candidates approved for briefing."""
    ranked = payload.get('results', payload) if isinstance(payload, dict) else payload
    if not isinstance(ranked, list):
        raise ValueError('candidate file must contain a results array')
    eligible = []
    for result in ranked:
        if not isinstance(result, dict) or result.get('decision') != 'brief':
            continue
        candidate = dict(result.get('candidate') or {})
        candidate['title'] = result.get('title') or candidate.get('title')
        if candidate.get('title'):
            eligible.append(candidate)
    return eligible

class ContentPipeline:
    """Main content generation pipeline"""
    
    def __init__(self, mode: str = 'candidate', approved_by: str = None):
        if mode not in {'candidate', 'production'}:
            raise ValueError("mode must be 'candidate' or 'production'")
        self.mode = mode
        self.topic_discovery = TopicDiscovery()
        self.retrieval = ContentRetrieval()
        self.drafter = ArticleDrafter()
        self.qa = QualityAssurance()
        self.image_finder = ImageFinder()
        self.seo_optimizer = SEOOptimizer()
        self.publisher = Publisher(
            'mdx_static',
            mode=mode,
            approved_by=approved_by,
        )
        
        # Stats
        self.stats = {
            'started': datetime.now().isoformat(),
            'topics_found': 0,
            'articles_generated': 0,
            'articles_staged': 0,
            'articles_published': 0,
            'errors': []
        }
    
    def process_topic(self, topic: Dict) -> bool:
        """Process a single topic through the pipeline"""
        topic_title = topic['title']
        logger.info(f"Processing: {topic_title}")
        
        try:
            # 1. Retrieve sources
            sources_data = self.retrieval.retrieve(topic_title)
            sources = sources_data.get('sources', [])
            
            if not sources:
                logger.warning(f"No sources found for: {topic_title}")
                return False
            
            # 2. Draft article
            article = self.drafter.draft(topic_title, sources)
            
            if not article:
                logger.warning(f"Failed to draft: {topic_title}")
                return False

            article['category'] = resolve_category(topic, article)
            
            self.stats['articles_generated'] += 1
            
            # 3. Quality assurance
            article = self.qa.qa_check(article, sources)
            
            # 4. SEO optimization
            seo = self.seo_optimizer.optimize(article)
            
            # 5. Find image
            image = self.image_finder.find_image(
                article['title'],
                seo['slug'],
                article.get('tags', [])
            )
            
            # Add image to article for publisher
            article['image'] = image
            
            # 6. Deterministic release gate
            validation = validate_release_candidate(article, sources, seo, image)
            if not validation.passed:
                logger.warning(
                    "Candidate blocked for '%s': %s",
                    topic_title,
                    '; '.join(validation.errors),
                )
                self.stats['errors'].append({
                    'topic': topic_title,
                    'error': 'release validation failed',
                    'details': validation.errors,
                    'time': datetime.now().isoformat(),
                })
                return False

            # 7. Stage by default; write to the live tree only in approved production mode.
            success = self.publisher.publish(article, seo, image)
            if success:
                if self.mode == 'production':
                    self.stats['articles_published'] += 1
                else:
                    self.stats['articles_staged'] += 1
                self._log_publication(topic_title, sources_data, article, seo, image)
            return success
                
        except Exception as e:
            logger.error(f"Pipeline error for '{topic_title}': {e}")
            self.stats['errors'].append({
                'topic': topic_title,
                'error': str(e),
                'time': datetime.now().isoformat()
            })
            return False
    
    def _log_publication(self, topic: str, sources: Dict, article: Dict, seo: Dict, image: Dict):
        """Log publication details"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'topic': topic,
            'sources': sources.get('method', 'unknown'),
            'model': os.getenv('PRIMARY_LLM', 'claude'),
            'image_url': image['path'],
            'mode': self.mode,
            'output_path': (
                f"content/{article.get('category', article.get('tags', ['technology'])[0])}/{seo['slug']}.mdx"
                if self.mode == 'production'
                else f"artifacts/editorial/release-candidates/{article.get('category', article.get('tags', ['technology'])[0])}/{seo['slug']}.mdx"
            ),
            'word_count': len(article['body_mdx'].split())
        }
        
        logger.info(f"Publication log: {json.dumps(log_entry)}")
    
    def run(self, limit: int = 3, batch_size: int = 1, topics: List[Dict] = None):
        """Run the pipeline for specified number of articles"""
        logger.info(f"Starting pipeline: {limit} articles in batches of {batch_size}")
        
        # Discover topics
        topics = topics or self.topic_discovery.discover(limit * 3)
        self.stats['topics_found'] = len(topics)
        
        if not topics:
            logger.error("No topics discovered")
            return
        
        # Process in batches
        published = 0
        batch_num = 1
        
        for i in range(0, len(topics), batch_size):
            if published >= limit:
                break
            
            batch = topics[i:i+batch_size]
            logger.info(f"Processing batch {batch_num} ({len(batch)} topics)")
            
            for topic in batch:
                if published >= limit:
                    break
                
                if self.process_topic(topic):
                    published += 1
                    
                # Only live production needs pacing. Candidate work should finish promptly.
                if self.mode == 'production' and published < limit:
                    delay = random.randint(30, 90)
                    logger.info(f"Waiting {delay}s before next article...")
                    time.sleep(delay)
            
            batch_num += 1
            
            # Longer break between batches (3-5 minutes)
            if self.mode == 'production' and published < limit:
                batch_delay = random.randint(180, 300)
                logger.info(f"Batch complete. Waiting {batch_delay}s before next batch...")
                time.sleep(batch_delay)
        
        # Final stats
        self.stats['completed'] = datetime.now().isoformat()
        logger.info(f"Pipeline complete: {json.dumps(self.stats, indent=2)}")
        
        # Save stats
        stats_file = Path('reports') / f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        stats_file.parent.mkdir(exist_ok=True)
        with open(stats_file, 'w') as f:
            json.dump(self.stats, f, indent=2)

def main():
    """Research by default; candidate and production modes require a scored queue."""
    parser = argparse.ArgumentParser(description='Trends Today content operator')
    parser.add_argument(
        'mode',
        nargs='?',
        choices=['research', 'candidate', 'promote'],
        default='research',
    )
    parser.add_argument('--limit', type=int, default=3, help='Maximum topics to process')
    parser.add_argument('--batch-size', type=int, default=1, help='Topics per batch')
    parser.add_argument('--candidate-file', type=Path, help='Ranked JSON from strategy.py')
    parser.add_argument('--release-candidate', type=Path, help='Exact staged MDX file to promote')
    parser.add_argument('--approved-by', help='Named human authorization for promotion')
    parser.add_argument('--output', type=Path, help='Research queue output path')
    args = parser.parse_args()

    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    if args.mode == 'research':
        discovery = TopicDiscovery()
        topics = discovery.discover(args.limit)
        payload = {
            'generatedAt': datetime.now().isoformat(),
            'status': 'needs-research',
            'topics': build_research_queue(topics),
        }
        output = args.output or Path('reports') / 'editorial' / f"research_queue_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(payload, indent=2) + '\n', encoding='utf-8')
        print(f"Wrote {len(payload['topics'])} research opportunities to {output}")
        return

    if args.mode == 'promote':
        if not args.release_candidate:
            parser.error('promote mode requires --release-candidate')
        if not (args.approved_by or '').strip():
            parser.error('promote mode requires --approved-by')
        destination = promote_candidate(args.release_candidate, args.approved_by)
        print(f'Promoted reviewed candidate to {destination}')
        return

    if not args.candidate_file:
        parser.error('candidate mode requires --candidate-file from strategy.py')

    ranked_payload = json.loads(args.candidate_file.read_text(encoding='utf-8'))
    try:
        eligible = eligible_candidates_from_payload(ranked_payload)
    except ValueError as exc:
        parser.error(str(exc))
    if not eligible:
        parser.error('candidate file contains no topics with decision=brief')

    pipeline = ContentPipeline(mode='candidate')
    pipeline.run(
        limit=min(args.limit, len(eligible)),
        batch_size=args.batch_size,
        topics=eligible[:args.limit],
    )

if __name__ == '__main__':
    main()
