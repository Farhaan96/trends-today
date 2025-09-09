#!/usr/bin/env python3
"""
Runner Module - Main pipeline orchestrator with scheduling
Publishes 15 posts/day with jitter to avoid exact intervals
"""

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
from publish import Publisher

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ContentPipeline:
    """Main content generation pipeline"""
    
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.topic_discovery = TopicDiscovery()
        self.retrieval = ContentRetrieval()
        self.drafter = ArticleDrafter()
        self.qa = QualityAssurance()
        self.image_finder = ImageFinder()
        self.seo_optimizer = SEOOptimizer()
        self.publisher = Publisher('mdx_static')
        
        # Stats
        self.stats = {
            'started': datetime.now().isoformat(),
            'topics_found': 0,
            'articles_generated': 0,
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
            
            # 6. Publish (unless dry run)
            if not self.dry_run:
                success = self.publisher.publish(article, seo, image)
                if success:
                    self.stats['articles_published'] += 1
                    logger.info(f"Published: {seo['slug']}")
                    
                    # Log to pipeline.log
                    self._log_publication(topic_title, sources_data, article, seo, image)
                    
                return success
            else:
                logger.info(f"[DRY RUN] Would publish: {seo['slug']}")
                print(f"\n=== Article Preview ===")
                print(f"Title: {article['title']}")
                print(f"Slug: {seo['slug']}")
                print(f"Tags: {', '.join(article.get('tags', []))}")
                print(f"Image: {image['path']}")
                print(f"Words: {len(article['body_mdx'].split())}")
                print(f"======================\n")
                return True
                
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
            'published_path': f"apps/web/content/posts/{seo['slug']}.mdx",
            'word_count': len(article['body_mdx'].split())
        }
        
        logger.info(f"Publication log: {json.dumps(log_entry)}")
    
    def run(self, limit: int = 15, batch_size: int = 5):
        """Run the pipeline for specified number of articles"""
        logger.info(f"Starting pipeline: {limit} articles in batches of {batch_size}")
        
        # Discover topics
        topics = self.topic_discovery.discover(limit * 3)  # Get extra for fallbacks
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
                    
                # Add jitter between articles (30-90 seconds)
                if not self.dry_run and published < limit:
                    delay = random.randint(30, 90)
                    logger.info(f"Waiting {delay}s before next article...")
                    time.sleep(delay)
            
            batch_num += 1
            
            # Longer break between batches (3-5 minutes)
            if not self.dry_run and published < limit:
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

def schedule_daily_runs(posts_per_day: int = 15, active_hours: str = "08-23"):
    """Calculate when to run batches throughout the day"""
    start_hour, end_hour = map(int, active_hours.split('-'))
    active_minutes = (end_hour - start_hour) * 60
    
    # 3 batches per day
    batches = [
        {'hour': 9, 'minute': 0, 'size': 5},   # Morning
        {'hour': 13, 'minute': 0, 'size': 5},  # Midday
        {'hour': 17, 'minute': 0, 'size': 5},  # Evening
    ]
    
    return batches

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Content Pipeline Runner')
    parser.add_argument('--limit', type=int, default=15, help='Number of articles to generate')
    parser.add_argument('--batch-size', type=int, default=5, help='Articles per batch')
    parser.add_argument('--dry-run', action='store_true', help='Test without publishing')
    parser.add_argument('--publish', action='store_true', help='Publish articles (opposite of dry-run)')
    parser.add_argument('--schedule', action='store_true', help='Show daily schedule')
    
    args = parser.parse_args()
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    if args.schedule:
        posts_per_day = int(os.getenv('POSTS_PER_DAY', '15'))
        active_hours = os.getenv('ACTIVE_HOURS', '08-23')
        batches = schedule_daily_runs(posts_per_day, active_hours)
        
        print("\n=== Daily Publishing Schedule ===")
        for i, batch in enumerate(batches, 1):
            print(f"Batch {i}: {batch['hour']:02d}:{batch['minute']:02d} - {batch['size']} articles")
        print(f"Total: {posts_per_day} articles/day")
        print(f"Active hours: {active_hours}")
        print("\nCron example:")
        for batch in batches:
            print(f"{batch['minute']} {batch['hour']} * * * cd /path/to/blog && python apps/pipeline/runner.py --limit {batch['size']} --publish")
        return
    
    # Determine dry run mode
    dry_run = args.dry_run and not args.publish
    
    # Run pipeline
    pipeline = ContentPipeline(dry_run=dry_run)
    pipeline.run(limit=args.limit, batch_size=args.batch_size)

if __name__ == '__main__':
    main()