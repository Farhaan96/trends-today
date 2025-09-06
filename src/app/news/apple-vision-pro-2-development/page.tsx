import { Metadata } from 'next';
import Link from 'next/link';
import { ClockIcon, CalendarIcon, NewspaperIcon, TagIcon } from '@heroicons/react/24/outline';
import CitationsList from '@/components/content/CitationsList';
import AuthorBox from '@/components/content/AuthorBox';
import StructuredData from '@/components/seo/StructuredData';
import newsData from '../../../../content/news/apple-vision-pro-2-development.json';

export const metadata: Metadata = {
  title: newsData.seo?.metaTitle || newsData.title,
  description: newsData.seo?.metaDescription,
  keywords: newsData.seo?.keywords,
  openGraph: {
    title: newsData.title,
    description: newsData.seo?.metaDescription,
    type: 'article',
    publishedTime: newsData.publishedAt,
    modifiedTime: newsData.lastUpdated,
    authors: [newsData.author?.name || 'Trends Today'],
    tags: newsData.tags,
  }
};

export default function NewsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": newsData.title,
    "description": newsData.summary,
    "datePublished": newsData.publishedAt,
    "dateModified": newsData.lastUpdated,
    "author": {
      "@type": "Person",
      "name": newsData.author?.name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Trends Today"
    },
    "articleSection": newsData.category,
    "keywords": newsData.tags?.join(', '),
    "about": newsData.relatedProducts?.map(product => ({
      "@type": "Product",
      "name": product.name,
      "category": product.category
    }))
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'breaking': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'product-launches': 'bg-green-100 text-green-800',
      'industry-analysis': 'bg-purple-100 text-purple-800',
      'acquisitions': 'bg-yellow-100 text-yellow-800',
      'ai': 'bg-blue-100 text-blue-800',
      'smartphones': 'bg-indigo-100 text-indigo-800',
      'laptops': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
            <span className={`px-3 py-1 rounded-full font-medium ${getUrgencyColor(newsData.urgency || 'standard')}`}>
              {newsData.urgency === 'breaking' ? '🚨 Breaking' : 
               newsData.urgency === 'important' ? '⚡ Important' : 
               '📰 News'}
            </span>
            <span className={`px-3 py-1 rounded-full font-medium ${getCategoryColor(newsData.category)}`}>
              {newsData.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              4 min read
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {new Date(newsData.publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {newsData.title}
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed font-medium">
            {newsData.summary}
          </p>

          {newsData.tags && (
            <div className="flex flex-wrap items-center gap-2 mt-6">
              <TagIcon className="w-4 h-4 text-gray-500" />
              {newsData.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="mb-8">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <span className="text-gray-500">Vision Pro 2 Concept Image</span>
          </div>
        </div>

        <div className="prose max-w-none">
          {newsData.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 text-lg leading-relaxed mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        {newsData.timeline && (
          <section className="my-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline</h2>
            
            <div className="space-y-4">
              {newsData.timeline.map((event, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-600">
                    {event.date}
                  </div>
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mx-4"></div>
                  <div className="flex-1 text-gray-700">
                    {event.event}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {newsData.quotes && newsData.quotes.length > 0 && (
          <section className="my-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Quotes</h2>
            
            <div className="space-y-6">
              {newsData.quotes.map((quote, index) => (
                <blockquote key={index} className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <p className="text-gray-700 text-lg italic mb-4">
                    "{quote.text}"
                  </p>
                  <cite className="text-gray-600 text-sm">
                    — {quote.source}
                    {quote.title && `, ${quote.title}`}
                    {quote.company && `, ${quote.company}`}
                  </cite>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {newsData.impact && (
          <section className="my-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Industry Impact</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-3">Industry</h3>
                <p className="text-blue-700 text-sm">
                  {newsData.impact.industry}
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-3">Consumers</h3>
                <p className="text-green-700 text-sm">
                  {newsData.impact.consumers}
                </p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-semibold text-purple-800 mb-3">Competitors</h3>
                <p className="text-purple-700 text-sm">
                  {newsData.impact.competitors}
                </p>
              </div>
            </div>
          </section>
        )}

        {newsData.relatedProducts && (
          <section className="my-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {newsData.relatedProducts.map((product, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                  {product.relevance && (
                    <p className="text-xs text-gray-500 mt-2">{product.relevance}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="my-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <NewspaperIcon className="w-5 h-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-semibold text-yellow-800">Stay Updated</h2>
          </div>
          <p className="text-yellow-700 text-sm">
            This is a developing story. We'll update this article as more information becomes available. 
            Last updated: {new Date(newsData.lastUpdated).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </section>

        <CitationsList sources={newsData.sources} />

        {newsData.author && (
          <AuthorBox 
            author={newsData.author}
            publishedAt={newsData.publishedAt}
            lastUpdated={newsData.lastUpdated}
          />
        )}

        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Coverage</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/reviews/apple-vision-pro-review" className="group">
              <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-gray-100 transition-colors">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  Apple Vision Pro Review: The Future is Expensive
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our comprehensive review of Apple's first spatial computing device
                </p>
                <span className="text-xs text-blue-600 font-medium">Read Review →</span>
              </div>
            </Link>
            
            <Link href="/compare/vision-pro-vs-quest-3" className="group">
              <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-gray-100 transition-colors">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  Vision Pro vs Meta Quest 3: Which VR Headset Wins?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Head-to-head comparison of the leading VR/AR headsets
                </p>
                <span className="text-xs text-blue-600 font-medium">Read Comparison →</span>
              </div>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}