'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ClockIcon, EyeIcon } from '@heroicons/react/24/outline'

interface Article {
  title: string
  slug: string
  description: string
  image: string
  category: string
  publishedAt: string
  readingTime: number
  author: {
    name: string
    avatar: string
  }
}

interface RelatedArticlesProps {
  currentSlug: string
  category: string
  tags?: string[]
  limit?: number
  className?: string
}

// Mock related articles function (replace with actual API call)
const getRelatedArticles = async (category: string, currentSlug: string, limit = 6): Promise<Article[]> => {
  // In production, this would be an API call to your content management system
  // For now, returning mock data based on category
  const mockArticles: Record<string, Article[]> = {
    reviews: [
      {
        title: 'iPhone 15 Pro Max Review: The Ultimate Flagship Experience',
        slug: 'iphone-15-pro-max-review',
        description: 'After weeks of testing, here\'s our comprehensive review of Apple\'s most advanced iPhone.',
        image: '/images/products/iphone-15-pro-max-hero.jpg',
        category: 'reviews',
        publishedAt: '2025-09-06T10:00:00Z',
        readingTime: 8,
        author: {
          name: 'Alex Chen',
          avatar: '/images/authors/alex-chen.jpg'
        }
      },
      {
        title: 'Samsung Galaxy S24 Ultra Review: Android Excellence',
        slug: 'samsung-galaxy-s24-ultra-review',
        description: 'Samsung\'s latest flagship combines premium design with cutting-edge features.',
        image: '/images/products/samsung-galaxy-s24-hero.jpg',
        category: 'reviews',
        publishedAt: '2025-09-05T14:30:00Z',
        readingTime: 6,
        author: {
          name: 'Sarah Martinez',
          avatar: '/images/authors/sarah-martinez.jpg'
        }
      },
      {
        title: 'Google Pixel 9 Pro Review: AI-Powered Photography',
        slug: 'google-pixel-9-pro-review',
        description: 'Google\'s computational photography reaches new heights with the Pixel 9 Pro.',
        image: '/images/products/google-pixel-9-pro-hero.jpg',
        category: 'reviews',
        publishedAt: '2025-09-04T16:15:00Z',
        readingTime: 7,
        author: {
          name: 'David Kim',
          avatar: '/images/authors/david-kim.jpg'
        }
      }
    ],
    news: [
      {
        title: 'iPhone 17 Air: Ultra-Thin Design Leaked Ahead of Apple Event',
        slug: 'iphone-17-air-announcement-what-to-expect',
        description: 'Exclusive leaks reveal Apple\'s thinnest iPhone ever with revolutionary design.',
        image: '/images/news/iphone-17-air-thin-profile.jpg',
        category: 'news',
        publishedAt: '2025-09-07T08:00:00Z',
        readingTime: 4,
        author: {
          name: 'Emma Thompson',
          avatar: '/images/authors/emma-thompson.jpg'
        }
      },
      {
        title: 'AI Settlement: Anthropic to Pay Authors $1.5 Billion',
        slug: 'first-of-its-kind-ai-settlement-anthropic-to-pay-authors-1-5',
        description: 'Groundbreaking settlement could reshape AI training data compensation.',
        image: '/images/news/ai-settlement-hero.jpg',
        category: 'news',
        publishedAt: '2025-09-06T12:00:00Z',
        readingTime: 5,
        author: {
          name: 'Alex Chen',
          avatar: '/images/authors/alex-chen.jpg'
        }
      }
    ]
  }

  return mockArticles[category]?.filter(article => article.slug !== currentSlug).slice(0, limit) || []
}

export default function RelatedArticles({ 
  currentSlug, 
  category, 
  tags = [], 
  limit = 6,
  className = '' 
}: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRelatedArticles = async () => {
      try {
        setLoading(true)
        const relatedArticles = await getRelatedArticles(category, currentSlug, limit)
        setArticles(relatedArticles)
      } catch (error) {
        console.error('Error loading related articles:', error)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    loadRelatedArticles()
  }, [currentSlug, category, limit])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`mt-16 ${className}`}>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <div className={`mt-16 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Related Articles</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <EyeIcon className="w-4 h-4" />
          <span>More from {category}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <article 
            key={article.slug}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <Link href={`/${article.category}/${article.slug}`} className="block">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full capitalize">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {article.author.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(article.publishedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3" />
                    <span>{article.readingTime} min</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link 
          href={`/${category}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>View All {category.charAt(0).toUpperCase() + category.slice(1)}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
