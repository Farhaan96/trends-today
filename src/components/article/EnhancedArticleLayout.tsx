'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import UtterancesComments from '@/components/engagement/UtterancesComments'
import Image from 'next/image'
import Link from 'next/link'
import { getCategoryStyles } from '@/lib/categories'

// Dynamic imports for better performance
const SocialShare = dynamic(() => import('@/components/social/SocialShare'))
const EnhancedNewsletter = dynamic(() => import('@/components/newsletter/EnhancedNewsletter'))
const RelatedArticles = dynamic(() => import('@/components/content/RelatedArticles'))
const UserEngagement = dynamic(() => import('@/components/engagement/UserEngagement'))

interface Author {
  name: string
  bio: string
  avatar: string
  twitter?: string
  linkedin?: string
}

interface Article {
  title: string
  description: string
  slug: string
  category: string
  publishedAt: string
  lastUpdated?: string
  author: Author
  image: string
  imageAlt: string
  readingTime: number
  tags?: string[]
  content: ReactNode
}

interface EnhancedArticleLayoutProps {
  article: Article
  className?: string
}

export default function EnhancedArticleLayout({
  article,
  className = ''
}: EnhancedArticleLayoutProps) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const articleId = `${article.category}-${article.slug}`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author.name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Trends Today",
      "logo": {
        "@type": "ImageObject",
        "url": "/images/logo.png"
      }
    },
    "datePublished": article.publishedAt,
    "dateModified": article.lastUpdated || article.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": currentUrl
    }
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className={`max-w-4xl mx-auto px-4 py-8 ${className}`}>
        {/* User Engagement (Reading progress, floating actions, analytics) */}
        <UserEngagement
          articleId={articleId}
          articleTitle={article.title}
          category={article.category}
          readingTime={article.readingTime}
        />

        {/* Article Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="mb-4">
            {(() => {
              const cat = getCategoryStyles(article.category)
              return (
                <Link 
                  href={`/${article.category}`}
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full capitalize ${cat.badge}`}
                >
                  {article.category}
                </Link>
              )
            })()}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {article.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {article.description}
          </p>

          {/* Author & Meta Information */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-t border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={56}
                height={56}
                className="rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{article.author.name}</p>
                <p className="text-sm text-gray-600">{article.author.bio}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)}
                  </time>
                  {article.lastUpdated && (
                    <span>
                      Updated {formatDate(article.lastUpdated)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <SocialShare
              url={currentUrl}
              title={article.title}
              description={article.description}
              image={article.image}
              size="small"
            />
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-12">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={article.image}
              alt={article.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
            />
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center italic">
            {article.imageAlt}
          </p>
        </div>

        {/* Article Content */}
        <div className="prose prose-xl max-w-none mb-16 prose-a:no-underline hover:prose-a:opacity-80 prose-p:leading-7 md:prose-p:leading-8 prose-headings:mt-8 prose-headings:mb-3 prose-ul:my-6 prose-ol:my-6 prose-li:my-1.5">
          {article.content}
        </div>

        {/* Gentle end-of-article prompt */}
        <div className="mb-12 p-4 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-800">Have a different take or an insight to add? Drop a comment below — we love hearing from readers.</p>
        </div>

        {/* Bottom Social Share */}
        <div className="mb-12 p-6 bg-gray-50 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Found this helpful? Share it with others!
          </h3>
          <SocialShare
            url={currentUrl}
            title={article.title}
            description={article.description}
            image={article.image}
            size="medium"
            showLabels
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                  className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="mb-12 p-6 bg-blue-50 rounded-2xl">
          <div className="flex gap-4">
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              width={64}
              height={64}
              className="rounded-full flex-shrink-0"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                About {article.author.name}
              </h3>
              <p className="text-gray-600 mb-3">{article.author.bio}</p>
              <div className="flex gap-3">
                {article.author.twitter && (
                  <a
                    href={article.author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Follow on Twitter
                  </a>
                )}
                {article.author.linkedin && (
                  <a
                    href={article.author.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Connect on LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-16">
          <EnhancedNewsletter
            title="Stay Updated with Latest Tech Trends"
            description="Get our latest articles, reviews, and tech insights delivered to your inbox weekly."
            variant="inline"
            showBenefits
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Related Articles */}
        <RelatedArticles
          currentSlug={article.slug}
          category={article.category}
          tags={article.tags}
          limit={6}
        />

        {/* Comments Section (Utterances - free via GitHub issues) */}
        <UtterancesComments issueTerm="pathname" />
      </article>
    </>
  )
}
