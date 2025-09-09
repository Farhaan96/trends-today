#!/usr/bin/env python3
"""
SEO Module - Finalize slug, meta tags, and structured data
"""

import re
import json
import logging
from typing import Dict
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

class SEOOptimizer:
    def __init__(self):
        self.site_url = "https://trends-today.vercel.app"
        self.site_name = "Trends Today"
        
    def generate_slug(self, title: str) -> str:
        """Generate SEO-friendly slug from title"""
        # Convert to lowercase and replace spaces with hyphens
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')
        
        # Limit length
        if len(slug) > 60:
            slug = slug[:60].rsplit('-', 1)[0]
        
        return slug
    
    def optimize_meta_title(self, title: str) -> str:
        """Optimize meta title for SEO"""
        # Ensure proper length (50-60 chars ideal)
        if len(title) > 60:
            title = title[:57] + "..."
        elif len(title) < 30:
            title = f"{title} | {self.site_name}"
        
        return title
    
    def optimize_meta_description(self, description: str, title: str = "") -> str:
        """Optimize meta description"""
        # Ensure 120-155 characters
        if len(description) < 120:
            description = f"{description} Read more about {title} on {self.site_name}."
        elif len(description) > 155:
            description = description[:152] + "..."
        
        return description
    
    def generate_json_ld(self, article: Dict, slug: str) -> Dict:
        """Generate JSON-LD structured data for Article"""
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article['title'],
            "description": article['meta_description'],
            "url": f"{self.site_url}/posts/{slug}",
            "datePublished": datetime.now().isoformat(),
            "dateModified": datetime.now().isoformat(),
            "author": {
                "@type": "Organization",
                "name": self.site_name
            },
            "publisher": {
                "@type": "Organization",
                "name": self.site_name,
                "logo": {
                    "@type": "ImageObject",
                    "url": f"{self.site_url}/logo.png"
                }
            },
            "image": article.get('image', {}).get('path', '/images/placeholder.jpg'),
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": f"{self.site_url}/posts/{slug}"
            }
        }
    
    def optimize(self, article: Dict) -> Dict:
        """Main SEO optimization"""
        # Generate slug
        slug = self.generate_slug(article['title'])
        
        # Optimize meta tags
        meta_title = self.optimize_meta_title(article['title'])
        meta_description = self.optimize_meta_description(
            article.get('meta_description', article['subtitle']), 
            article['title']
        )
        
        # Generate structured data
        json_ld = self.generate_json_ld(article, slug)
        
        # Add internal link suggestions
        internal_links = self._suggest_internal_links(article['body_mdx'])
        
        seo_data = {
            'slug': slug,
            'meta_title': meta_title,
            'meta_description': meta_description,
            'canonical': f"{self.site_url}/posts/{slug}",
            'json_ld': json_ld,
            'internal_links': internal_links
        }
        
        logger.info(f"SEO optimized: {slug}")
        return seo_data
    
    def _suggest_internal_links(self, content: str) -> list:
        """Find [[INTERNAL: keyword]] placeholders and suggest links"""
        import re
        pattern = r'\[\[INTERNAL:\s*([^\]]+)\]\]'
        matches = re.findall(pattern, content)
        
        suggestions = []
        for keyword in matches:
            suggestions.append({
                'keyword': keyword.strip(),
                'placeholder': f'[[INTERNAL: {keyword}]]'
            })
        
        return suggestions

if __name__ == '__main__':
    optimizer = SEOOptimizer()
    
    test_article = {
        'title': 'Best AI Coding Assistants in 2024: Complete Guide',
        'subtitle': 'Discover the top AI tools for programming',
        'meta_description': 'Learn about the best AI coding assistants',
        'body_mdx': 'Content with [[INTERNAL: AI tools]] link',
        'image': {'path': '/images/ai-coding.jpg'}
    }
    
    seo = optimizer.optimize(test_article)
    print(f"\nSEO Data:")
    print(f"Slug: {seo['slug']}")
    print(f"Meta Title: {seo['meta_title']}")
    print(f"Meta Description: {seo['meta_description']}")
    print(f"Internal Links: {seo['internal_links']}")