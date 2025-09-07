import SocialShareButtons from '../social/SocialShareButtons';
import NewsletterSignup from '../newsletter/NewsletterSignup';
import CommentSystem from '../engagement/CommentSystem';
import RatingSystem from '../engagement/RatingSystem';

interface ArticleLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  image?: string;
  publishedAt?: string;
  articleId: string;
}

export default function ArticleLayout({
  children,
  title,
  description = '',
  image = '',
  publishedAt,
  articleId
}: ArticleLayoutProps) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
        
        {description && (
          <p className="text-xl text-gray-800 dark:text-gray-300 mb-6">
            {description}
          </p>
        )}

        {/* Article Meta */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-900 dark:text-gray-900">
            {publishedAt && (
              <time dateTime={publishedAt}>
                {new Date(publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            )}
          </div>
          
          <SocialShareButtons
            url={currentUrl}
            title={title}
            description={description}
            image={image}
            variant="horizontal"
          />
        </div>
      </header>

      {/* Article Content */}
      <article className="prose prose-slate prose-lg prose-slate max-w-none dark:prose-invert mb-12">
        {children}
      </article>

      {/* Floating Social Share */}
      <SocialShareButtons
        url={currentUrl}
        title={title}
        description={description}
        image={image}
        variant="floating"
      />

      {/* Article Rating */}
      <div className="mb-12">
        <RatingSystem
          articleId={articleId}
          initialRating={4.2}
          totalRatings={127}
        />
      </div>

      {/* Newsletter CTA */}
      <div className="mb-12">
        <NewsletterSignup 
          variant="inline" 
          showLeadMagnet={true}
          leadMagnetTitle="Get More Tech Reviews Like This"
          leadMagnetDescription="Join 50,000+ readers who get our weekly digest of the latest reviews and buying guides"
        />
      </div>

      {/* Comments */}
      <div className="mb-8">
        <CommentSystem
          articleId={articleId}
          articleTitle={title}
        />
      </div>
    </div>
  );
}