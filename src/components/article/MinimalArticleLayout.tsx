import Link from 'next/link';
import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import AuthorSection from '@/components/content/AuthorSection';
import RelatedArticles, { getRelatedLinks, InlineLink } from '@/components/content/InternalLinks';
import { Article } from '@/lib/content';
import AdSlot from '@/components/ads/AdSlot';
import { getCategoryStyles } from '@/lib/categories';
import UtterancesComments from '@/components/engagement/UtterancesComments';

interface MinimalArticleLayoutProps {
  article: Article;
  children: React.ReactNode;
}

export default async function MinimalArticleLayout({ article, children }: MinimalArticleLayoutProps) {
  const frontmatter = article.frontmatter;
  const relatedLinks = await getRelatedLinks(article.href, frontmatter.category, 5);

  // Parse content to add internal links (this would be done in content generation)
  // For now, we'll add them strategically in the layout

  return (
    <article className="min-h-screen bg-white">
      {/* Clean article header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Category */}
        <div className="mb-4">
          {(() => {
            const cat = getCategoryStyles(frontmatter.category)
            return (
              <Link 
                href={`/${frontmatter.category?.toLowerCase() || 'articles'}`}
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${cat.badge}`}
              >
                {frontmatter.category || 'Article'}
              </Link>
            )
          })()}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          {frontmatter.title}
        </h1>

        {/* Meta information */}
        <div className="flex items-center text-sm text-gray-600 space-x-4 mb-6">
          <span>By {typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author?.name}</span>
          <span>•</span>
          <time dateTime={frontmatter.publishedAt || frontmatter.datePublished}>
            {new Date(frontmatter.publishedAt || frontmatter.datePublished || '').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
          {frontmatter.readingTime && (
            <>
              <span>•</span>
              <span>{frontmatter.readingTime} min read</span>
            </>
          )}
        </div>

        {/* Hero image */}
        {frontmatter.image && (
          <div className="relative aspect-[16/9] w-full mb-8 rounded-lg overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={frontmatter.image}
              alt={frontmatter.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}
      </header>

      {/* Article content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="prose prose-lg max-w-none">
        {/* Add strategic internal links in the content */}
        <div className="mb-8">
          {children}
        </div>
        {/* Gentle end-of-article prompt */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-800">What did you find most interesting here? Share your take in the comments below — we read every one.</p>
        </div>

          {/* Inline related articles (Le Ravi style) */}
          {relatedLinks.length > 0 && (
            <div className="my-8 p-4 bg-blue-50 border-l-4 border-blue-600">
              <p className="text-gray-700">
                <strong>You might also be interested in:</strong> Check out our{' '}
                <InlineLink href={relatedLinks[0].href}>
                  {relatedLinks[0].text}
                </InlineLink>
                {relatedLinks[1] && (
                  <>
                    {' '}and our recent{' '}
                    <InlineLink href={relatedLinks[1].href}>
                      {relatedLinks[1].text}
                    </InlineLink>
                  </>
                )}
                {' '}for more insights on this topic.
              </p>
            </div>
          )}
        </div>

        {/* Mid-article ad slot */}
        <div className="my-12">
          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Advertisement</div>
          <AdSlot height={250} className="bg-gray-50" />
        </div>

        {/* Author section with more articles */}
        <AuthorSection 
          author={frontmatter.author} 
          currentArticle={article.href}
          showMoreArticles={true}
        />

        {/* Related articles section */}
        {relatedLinks.length > 2 && (
          <RelatedArticles links={relatedLinks.slice(2)} />
        )}

        {/* Bottom navigation */}
        <nav className="mt-12 pt-8 border-t border-gray-200 mb-12">
          <div className="flex justify-between items-center">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </Link>
            <Link 
              href={`/${frontmatter.category?.toLowerCase() || 'articles'}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              More {frontmatter.category} Articles →
            </Link>
          </div>
        </nav>
      </div>
      {/* Comments (Utterances - free via GitHub issues) */}
      <div className="mt-12">
        <UtterancesComments issueTerm="pathname" />
      </div>
    </article>
  );
}
