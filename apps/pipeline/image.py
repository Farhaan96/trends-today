#!/usr/bin/env python3
"""
Image Module - Find and download article images
Priority: Unsplash → Pexels with smart query generation
"""

import os
import json
import logging
import requests
from pathlib import Path
from typing import Dict, Optional
import hashlib

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

class ImageFinder:
    def __init__(self):
        self.unsplash_key = os.getenv('UNSPLASH_ACCESS_KEY')
        self.pexels_key = os.getenv('PEXELS_API_KEY')
        self.image_dir = Path('apps/web/public/images')
        self.image_dir.mkdir(parents=True, exist_ok=True)
        
    def _generate_query(self, title: str, tags: list) -> str:
        """Generate smart image search query from article title"""
        # Remove common words and extract key terms
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'how', 'what', 'why', 'when', 'where'}
        
        words = title.lower().split()
        keywords = [w for w in words if w not in stop_words and len(w) > 3]
        
        # Add relevant tag if available
        if tags:
            keywords.append(tags[0])
        
        return ' '.join(keywords[:3])  # Use top 3 keywords
    
    def search_unsplash(self, query: str) -> Optional[Dict]:
        """Search Unsplash for images"""
        if not self.unsplash_key:
            return None
        
        try:
            response = requests.get(
                'https://api.unsplash.com/search/photos',
                params={
                    'query': query,
                    'per_page': 1,
                    'orientation': 'landscape'
                },
                headers={'Authorization': f'Client-ID {self.unsplash_key}'},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['results']:
                    photo = data['results'][0]
                    return {
                        'url': photo['urls']['regular'],
                        'thumbnail': photo['urls']['small'],
                        'alt': photo.get('alt_description', query),
                        'attribution': f"Photo by {photo['user']['name']} on Unsplash",
                        'source': 'unsplash'
                    }
                    
        except Exception as e:
            logger.error(f"Unsplash error: {e}")
        
        return None
    
    def search_pexels(self, query: str) -> Optional[Dict]:
        """Search Pexels for images"""
        if not self.pexels_key:
            return None
        
        try:
            response = requests.get(
                'https://api.pexels.com/v1/search',
                params={
                    'query': query,
                    'per_page': 1,
                    'orientation': 'landscape'
                },
                headers={'Authorization': self.pexels_key},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['photos']:
                    photo = data['photos'][0]
                    return {
                        'url': photo['src']['large'],
                        'thumbnail': photo['src']['small'],
                        'alt': photo.get('alt', query),
                        'attribution': f"Photo by {photo['photographer']} from Pexels",
                        'source': 'pexels'
                    }
                    
        except Exception as e:
            logger.error(f"Pexels error: {e}")
        
        return None
    
    def download_image(self, url: str, slug: str) -> str:
        """Download image and save locally"""
        try:
            response = requests.get(url, timeout=30, stream=True)
            if response.status_code == 200:
                # Determine extension from content-type
                content_type = response.headers.get('content-type', 'image/jpeg')
                ext = 'jpg'
                if 'png' in content_type:
                    ext = 'png'
                elif 'webp' in content_type:
                    ext = 'webp'
                
                filename = f"{slug}.{ext}"
                filepath = self.image_dir / filename
                
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                logger.info(f"Downloaded image: {filename}")
                return f"/images/{filename}"
                
        except Exception as e:
            logger.error(f"Download error: {e}")
        
        return "/images/placeholder.jpg"
    
    def find_image(self, title: str, slug: str, tags: list = None) -> Dict:
        """Main image finding with fallbacks"""
        query = self._generate_query(title, tags or [])
        logger.info(f"Searching for image with query: {query}")
        
        # Try Unsplash first
        image_data = self.search_unsplash(query)
        
        # Fallback to Pexels
        if not image_data:
            image_data = self.search_pexels(query)
        
        # Fallback to generic query
        if not image_data:
            generic_query = tags[0] if tags else "technology"
            image_data = self.search_unsplash(generic_query) or self.search_pexels(generic_query)
        
        # Use placeholder if all fail
        if not image_data:
            logger.warning("No image found, using placeholder")
            return {
                'path': '/images/placeholder.jpg',
                'alt': title,
                'attribution': ''
            }
        
        # Download the image
        local_path = self.download_image(image_data['url'], slug)
        
        return {
            'path': local_path,
            'alt': image_data['alt'],
            'attribution': image_data['attribution']
        }

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    
    finder = ImageFinder()
    result = finder.find_image(
        "Best AI coding assistants 2024",
        "best-ai-coding-assistants-2024",
        ['AI', 'programming']
    )
    
    print(f"\nImage found:")
    print(f"Path: {result['path']}")
    print(f"Alt: {result['alt']}")
    print(f"Attribution: {result['attribution']}")