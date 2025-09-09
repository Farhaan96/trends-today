#!/usr/bin/env python3
"""
Publish Module - Write MDX files with frontmatter
Supports multiple publisher adapters
"""

import os
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict
from abc import ABC, abstractmethod

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

class PublisherAdapter(ABC):
    """Base publisher adapter interface"""
    
    @abstractmethod
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Publish article to target platform"""
        pass

class MDXStaticPublisher(PublisherAdapter):
    """Publisher for static MDX files"""
    
    def __init__(self):
        self.posts_dir = Path('apps/web/content/posts')
        self.posts_dir.mkdir(parents=True, exist_ok=True)
        
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Write MDX file with frontmatter"""
        try:
            slug = seo['slug']
            filepath = self.posts_dir / f"{slug}.mdx"
            
            # Build frontmatter
            frontmatter = {
                'title': article['title'],
                'subtitle': article.get('subtitle', ''),
                'description': seo['meta_description'],
                'date': datetime.now().isoformat(),
                'image': image['path'],
                'imageAlt': image['alt'],
                'imageAttribution': image.get('attribution', ''),
                'tags': article.get('tags', ['technology']),
                'category': article.get('tags', ['technology'])[0],
                'author': 'Trends Today Team',
                'readingTime': f"{len(article['body_mdx'].split()) // 200} min read",
                'slug': slug
            }
            
            # Process body to replace internal link placeholders
            body = article['body_mdx']
            for link in seo.get('internal_links', []):
                # For now, just remove the placeholders
                # In production, would link to actual posts
                body = body.replace(link['placeholder'], link['keyword'])
            
            # Write MDX file
            content = "---\n"
            for key, value in frontmatter.items():
                if isinstance(value, list):
                    content += f"{key}:\n"
                    for item in value:
                        content += f"  - {item}\n"
                else:
                    content += f"{key}: {json.dumps(value) if isinstance(value, (dict, bool)) else value}\n"
            content += "---\n\n"
            content += body
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Published: {slug}")
            return True
            
        except Exception as e:
            logger.error(f"Publish error: {e}")
            return False

class WordPressPublisher(PublisherAdapter):
    """Stub for WordPress API publishing"""
    
    def __init__(self):
        self.api_url = os.getenv('WORDPRESS_API_URL')
        self.api_key = os.getenv('WORDPRESS_API_KEY')
        
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Publish to WordPress via REST API"""
        logger.info("WordPress publisher not implemented (stub)")
        # Would implement WordPress REST API calls here
        return False

class HeadlessCMSPublisher(PublisherAdapter):
    """Stub for headless CMS publishing"""
    
    def __init__(self):
        self.cms_url = os.getenv('CMS_API_URL')
        self.cms_key = os.getenv('CMS_API_KEY')
        
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Publish to headless CMS"""
        logger.info("Headless CMS publisher not implemented (stub)")
        # Would implement CMS API calls here
        return False

class Publisher:
    """Main publisher with adapter selection"""
    
    def __init__(self, adapter: str = 'mdx_static'):
        self.adapters = {
            'mdx_static': MDXStaticPublisher,
            'wordpress': WordPressPublisher,
            'headless_cms': HeadlessCMSPublisher
        }
        
        adapter_class = self.adapters.get(adapter, MDXStaticPublisher)
        self.adapter = adapter_class()
        
        # Update index file
        self.index_file = Path('apps/web/content/posts/index.json')
        
    def publish(self, article: Dict, seo: Dict, image: Dict) -> bool:
        """Publish article using selected adapter"""
        success = self.adapter.publish(article, seo, image)
        
        if success:
            self._update_index(article, seo)
        
        return success
    
    def _update_index(self, article: Dict, seo: Dict):
        """Update posts index for homepage"""
        try:
            # Load existing index
            if self.index_file.exists():
                with open(self.index_file, 'r') as f:
                    index = json.load(f)
            else:
                index = []
            
            # Add new post
            index.insert(0, {
                'slug': seo['slug'],
                'title': article['title'],
                'subtitle': article['subtitle'],
                'date': datetime.now().isoformat(),
                'category': article.get('tags', ['technology'])[0],
                'image': article.get('image', {}).get('path', '/images/placeholder.jpg')
            })
            
            # Keep only recent 100 posts in index
            index = index[:100]
            
            # Save index
            self.index_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.index_file, 'w') as f:
                json.dump(index, f, indent=2)
                
        except Exception as e:
            logger.error(f"Index update error: {e}")

if __name__ == '__main__':
    publisher = Publisher('mdx_static')
    
    test_article = {
        'title': 'Test Article',
        'subtitle': 'Testing the publisher',
        'body_mdx': '## Test Content\n\nThis is a test.',
        'tags': ['test']
    }
    
    test_seo = {
        'slug': 'test-article',
        'meta_description': 'Test description',
        'internal_links': []
    }
    
    test_image = {
        'path': '/images/test.jpg',
        'alt': 'Test image',
        'attribution': 'Test attribution'
    }
    
    success = publisher.publish(test_article, test_seo, test_image)
    print(f"Publish {'succeeded' if success else 'failed'}")