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
    <main className="max-w-4xl mx-auto px-4 py-8">
      <StructuredData data={reviewStructuredData} />
      
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <header className="p-8 pb-6">
          {/* Category badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {frontmatter.category || 'Review'}
            </span>
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
          
          <div className="flex items-center gap-4 text-gray-700 border-b pb-6">
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
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={frontmatter.image}
                alt={frontmatter.title}
                className="w-full h-full object-cover"
                fallbackSrc="/file.svg"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <article className="px-8 pb-8">
          <div className="prose prose-lg prose-blue max-w-none">
            <MDXRemote source={content} />
          </div>
        </article>

        {/* Footer */}
        <footer className="px-8 pb-8 border-t pt-8 mt-8">
          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {frontmatter.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
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