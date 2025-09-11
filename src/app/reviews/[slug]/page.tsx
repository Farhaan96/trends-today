import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import AuthorBox from '@/components/content/AuthorBox';
import CitationsList from '@/components/content/CitationsList';
import StructuredData from '@/components/seo/StructuredData';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import MDXImage from '@/components/mdx/MDXImage';
import { getCategoryStyles } from '@/lib/categories';

interface ReviewPageProps {
  params: {
    slug: string;
  };
}

// Get review article data
async function getReviewArticle(slug: string) {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'reviews');
    const filePath = path.join(contentDir, `${slug}.mdx`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    return {
      frontmatter: data,
      content,
      slug
    };
  } catch (error) {
    return null;
  }
}

// Generate static params for all review articles
export async function generateStaticParams() {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'reviews');
    
    if (!fs.existsSync(contentDir)) {
      return [];
    }
    
    const files = fs.readdirSync(contentDir);
    
    return files
      .filter(file => file.endsWith('.mdx'))
      .map(file => ({
        slug: file.replace('.mdx', ''),
      }));
  } catch (error) {
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const article = await getReviewArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Review Not Found | Trends Today',
      description: 'The requested review could not be found.',
    };
  }

  const { frontmatter } = article;
  
  return {
    title: frontmatter.title + ' | Trends Today',
    description: frontmatter.description,
    keywords: frontmatter.tags?.join(', '),
    authors: [{ name: (typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author?.name) || 'Trends Today Editorial' }],
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: 'article',
      publishedTime: frontmatter.publishedAt,
      authors: [(typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author?.name) || 'Trends Today Editorial'],
      images: frontmatter.image ? [
        {
          url: frontmatter.image,
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: frontmatter.image ? [frontmatter.image] : [],
    },
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const article = await getReviewArticle(params.slug);
  
  if (!article) {
    notFound();
  }
  
  const { frontmatter, content } = article;
  
  // Generate structured data for the review
  const reviewStructuredData = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": frontmatter.product?.name || frontmatter.title,
      "brand": frontmatter.product?.brand,
      "image": frontmatter.image ? `https://trendstoday.ca${frontmatter.image}` : undefined
    },
    "author": {
      "@type": "Person",
      "name": (typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author?.name) || "Trends Today Editorial"
    },
    "datePublished": frontmatter.publishedAt,
    "dateModified": frontmatter.updatedAt || frontmatter.publishedAt,
    "reviewRating": frontmatter.rating ? {
      "@type": "Rating",
      "ratingValue": frontmatter.rating,
      "bestRating": "10"
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "Trends Today",
      "url": "https://trendstoday.ca"
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <StructuredData data={reviewStructuredData} />
      
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <header className="p-8 pb-6">
          {/* Category badge */}
          <div className="flex items-center gap-3 mb-4">
            {(() => {
              const cat = getCategoryStyles(frontmatter.category)
              return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${cat.badge}`}>
                  {frontmatter.category || 'Review'}
                </span>
              )
            })()}
            {frontmatter.featured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ⭐ Featured Review
              </span>
            )}
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {frontmatter.title}
          </h1>
          
          {/* Description */}
          <p className="text-xl text-gray-800 mb-6">
            {frontmatter.description}
          </p>
          
          <div className="flex items-center gap-4 text-gray-900 border-b pb-6">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {(typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author?.name) || 'Trends Today Editorial'}
              </span>
            </div>
            <span>•</span>
            <time dateTime={frontmatter.publishedAt}>
              {new Date(frontmatter.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            {frontmatter.readingTime && (
              <>
                <span>•</span>
                <span>{frontmatter.readingTime}</span>
              </>
            )}
            {frontmatter.rating && (
              <>
                <span>•</span>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 font-medium">{frontmatter.rating}/10</span>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {frontmatter.image && (
          <div className="mb-8">
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={frontmatter.image}
                alt={frontmatter.imageAlt || frontmatter.title}
                className="w-full h-full object-cover"
                fallbackSrc="/file.svg"
              />
            </div>
            {(frontmatter.imageCredit || frontmatter.imageIsConcept) && (
              <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                {frontmatter.imageIsConcept && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 font-semibold rounded-sm">Concept render</span>
                )}
                {frontmatter.imageCredit && (
                  <span>
                    Image credit: {frontmatter.imageCredit.url ? (
                      <a href={frontmatter.imageCredit.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {frontmatter.imageCredit.name || 'Source'}
                      </a>
                    ) : (
                      frontmatter.imageCredit.name || 'Source'
                    )}
                    {frontmatter.imageLicense ? ` · ${frontmatter.imageLicense}` : ''}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <article className="px-8 pb-8">
          <div className="prose prose-lg max-w-none text-gray-900 article-content
            [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-6 [&>h1]:mt-8 [&>h1]:tracking-tight
            [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:border-b [&>h2]:border-gray-200 [&>h2]:pb-2 [&>h2]:tracking-tight
            [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mb-3 [&>h3]:mt-6 [&>h3]:tracking-tight
            [&>h4]:text-xl [&>h4]:font-bold [&>h4]:text-gray-900 [&>h4]:mb-2 [&>h4]:mt-4 [&>h4]:tracking-tight
            [&>p]:text-gray-900 [&>p]:leading-relaxed [&>p]:mb-4 [&>p]:text-base [&>p]:font-normal
            [&>strong]:text-gray-900 [&>strong]:font-semibold
            [&>em]:text-gray-800 [&>em]:italic
            [&>a]:text-blue-600 [&>a]:no-underline [&>a]:font-medium
            [&>ul]:text-gray-900 [&>ul]:mb-4 [&>ul]:pl-6
            [&>ol]:text-gray-900 [&>ol]:mb-4 [&>ol]:pl-6
            [&>li]:text-gray-900 [&>li]:mb-2 [&>li]:leading-relaxed
            [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-gray-800 [&>blockquote]:bg-blue-50 [&>blockquote]:py-4 [&>blockquote]:pr-4 [&>blockquote]:rounded-r-lg
            [&>code]:text-sm [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-gray-900 [&>code]:font-mono
            [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto
            [&>img]:rounded-lg [&>img]:shadow-md [&>img]:mb-6 [&>img]:mx-auto
            [&>table]:text-sm [&>table]:mb-6
            [&>th]:bg-gray-100 [&>th]:font-semibold [&>th]:text-gray-900 [&>th]:px-4 [&>th]:py-2
            [&>td]:px-4 [&>td]:py-2 [&>td]:text-gray-900 [&>td]:border-t [&>td]:border-gray-200
            [&>hr]:border-gray-300 [&>hr]:my-8">
            <MDXRemote 
              source={content} 
              components={{
                img: MDXImage
              }}
            />
          </div>
        </article>

        {/* Footer */}
        <footer className="px-8 pb-8 border-t pt-8 mt-8">
          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {frontmatter.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Author Box */}
          {frontmatter.author && (
            <AuthorBox 
              author={frontmatter.author} 
              publishedAt={frontmatter.publishedAt}
              lastUpdated={frontmatter.updatedAt}
            />
          )}
          
          {/* Citations */}
          {frontmatter.sources && (
            <CitationsList sources={frontmatter.sources} />
          )}
        </footer>
      </div>
    </main>
  );
}
