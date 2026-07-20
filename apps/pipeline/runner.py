#!/usr/bin/env python3
"""Research, stage, and promote independently reviewed Trends Today content."""

import os
import hmac
import sys
import json
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

VALID_CATEGORIES = {
    'science', 'technology', 'space', 'health', 'psychology', 'culture',
    'local-news', 'transit', 'things-to-do', 'food-drink', 'housing', 'sports',
}


def seed_urls_for_topic(topic: Dict) -> List[str]:
    """Preserve the reviewed research URLs when retrieving candidate sources."""
    evidence = topic.get('evidence') or {}
    urls = [topic.get('url'), topic.get('sourceUrl')]
    urls.extend(evidence.get('primarySourceUrls') or [])
    urls.extend(evidence.get('sourceUrls') or [])
    return list(dict.fromkeys(str(url).strip() for url in urls if str(url or '').strip()))


def primary_source_urls_for_topic(topic: Dict) -> set:
    """Return URLs explicitly established as primary during discovery or research."""
    evidence = topic.get('evidence') or {}
    primary_urls = list(evidence.get('primarySourceUrls') or [])
    if topic.get('sourceTier') == 'primary':
        primary_urls.extend([topic.get('url'), topic.get('sourceUrl')])
    return {str(url).strip() for url in primary_urls if str(url or '').strip()}


def requires_manual_approval(topic: Dict, article: Dict, source_config: Dict) -> bool:
    """Fail closed on common sensitive local-news signals."""
    if topic.get('manualApprovalRequired') or article.get('manualApprovalRequired'):
        return True
    text = ' '.join(
        str(value or '')
        for value in (
            topic.get('title'),
            article.get('title'),
            article.get('subtitle'),
            article.get('meta_description'),
            article.get('body_mdx'),
        )
    ).lower()
    keywords = (
        source_config.get('automaticPublishing', {})
        .get('manualApprovalKeywords', [])
    )
    return any(str(keyword).lower() in text for keyword in keywords)


def has_manual_approval(topic: Dict) -> bool:
    """Accept sensitive-story approval only through an operator-provided secret."""
    expected = os.getenv('TRENDS_TODAY_SENSITIVE_APPROVAL_TOKEN', '').strip()
    supplied = str(topic.get('manualApprovalToken', '')).strip()
    return bool(expected and supplied and hmac.compare_digest(expected, supplied))


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
        'transit': ('translink', 'skytrain', 'bus route', 'seabus', 'road closure', 'traffic'),
        'things-to-do': ('event', 'festival', 'concert', 'weekend', 'things to do'),
        'food-drink': ('restaurant', 'bakery', 'cafe', 'bar', 'opening', 'closing'),
        'housing': ('housing', 'rent', 'development', 'rezoning', 'condo'),
        'sports': ('canucks', 'whitecaps', 'bc lions', 'giants', 'game'),
        'space': ('space', 'nasa', 'planet', 'moon', 'mars', 'asteroid', 'telescope'),
        'health': ('health', 'medical', 'disease', 'patient', 'drug', 'cancer', 'clinical'),
        'psychology': ('psychology', 'brain', 'behavior', 'mental', 'emotion', 'cognitive'),
        'science': ('science', 'study', 'researcher', 'physics', 'biology', 'chemistry'),
        'culture': ('culture', 'media', 'art', 'music', 'creator', 'social'),
    }
    for category, keywords in keyword_map.items():
        if any(keyword in text for keyword in keywords):
            return category
    return 'local-news'


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
    
    def __init__(self, mode: str = 'candidate'):
        if mode != 'candidate':
            raise PermissionError('Direct production mode is disabled; promote a reviewed candidate')
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
            seed_urls = seed_urls_for_topic(topic) or None
            sources_data = self.retrieval.retrieve(topic_title, urls=seed_urls)
            sources = sources_data.get('sources', [])
            primary_urls = primary_source_urls_for_topic(topic)
            for source in sources:
                if source.get('url') in primary_urls:
                    source['tier'] = 'primary'
            
            if not sources:
                logger.warning(f"No sources found for: {topic_title}")
                return False
            
            # 2. Draft article
            draft_topic = (
                f"{topic_title}\nLocality: {topic.get('locality', 'Lower Mainland')}\n"
                f"Story type: {topic.get('storyType', 'reported-update')}"
            )
            article = self.drafter.draft(draft_topic, sources)
            
            if not article:
                logger.warning(f"Failed to draft: {topic_title}")
                return False

            article['category'] = resolve_category(topic, article)
            article['locality'] = topic.get('locality', '')
            article['storyType'] = topic.get('storyType', 'reported-update')
            article['readerImpact'] = (topic.get('evidence') or {}).get('readerImpact', '')
            article['lengthRationale'] = topic.get(
                'lengthRationale',
                f"Use the {article['storyType']} prior because it matches the reader job.",
            )
            article['commercialIntent'] = topic.get('commercialIntent', 'none')
            article['commercialFitReason'] = topic.get(
                'commercialFitReason',
                'No commercial fit is asserted; editorial utility leads.',
            )
            article['sponsorshipStatus'] = topic.get('sponsorshipStatus', 'editorial')
            article['commercialApprovalRecorded'] = False
            article['manualApprovalRequired'] = requires_manual_approval(
                topic,
                article,
                self.topic_discovery.source_config,
            )
            article['brandSafety'] = (
                'sensitive-owner-review'
                if article['manualApprovalRequired']
                else 'standard'
            )
            # A discovered topic cannot self-assert human approval. The token is
            # supplied interactively and is intentionally absent from automation.
            article['manualApprovalRecorded'] = has_manual_approval(topic)
            
            self.stats['articles_generated'] += 1
            
            # 3. Quality assurance
            article = self.qa.qa_check(article, sources)
            article['manualApprovalRequired'] = requires_manual_approval(
                topic,
                article,
                self.topic_discovery.source_config,
            )
            article['brandSafety'] = (
                'sensitive-owner-review'
                if article['manualApprovalRequired']
                else 'standard'
            )
            
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
            sensitive_keywords = (
                self.topic_discovery.source_config
                .get('automaticPublishing', {})
                .get('manualApprovalKeywords', [])
            )
            validation = validate_release_candidate(
                article,
                sources,
                seo,
                image,
                sensitive_keywords=sensitive_keywords,
            )
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

            # 7. Stage the exact candidate for an independent Claude review.
            success = self.publisher.publish(article, seo, image)
            if success:
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
            'output_path': f"artifacts/editorial/release-candidates/{article.get('category', article.get('tags', ['technology'])[0])}/{seo['slug']}.mdx",
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
                    
            batch_num += 1
        
        # Final stats
        self.stats['completed'] = datetime.now().isoformat()
        logger.info(f"Pipeline complete: {json.dumps(self.stats, indent=2)}")
        
        # Save stats
        stats_file = Path('reports') / f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        stats_file.parent.mkdir(exist_ok=True)
        with open(stats_file, 'w') as f:
            json.dump(self.stats, f, indent=2)

def main():
    """Research by default; candidate generation requires a scored queue."""
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
    parser.add_argument('--review-file', type=Path, help='Accepted Claude review JSON for the exact candidate')
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
        if not args.review_file:
            parser.error('promote mode requires --review-file')
        destination = promote_candidate(args.release_candidate, args.review_file)
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
