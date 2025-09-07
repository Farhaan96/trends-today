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

interface NewsPageProps {
  params: {
    slug: string;
  };
}

// Get news article data
async function getNewsArticle(slug: string) {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'news');
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

// Generate static params for all news articles
export async function generateStaticParams() {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'news');
    
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
export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const article = await getNewsArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found | Trends Today',
      description: 'The requested article could not be found.',
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

export default async function NewsPage({ params }: NewsPageProps) {
  const article = await getNewsArticle(params.slug);
  
  if (!article) {
    notFound();
  }
  
  const { frontmatter, content } = article;
  
  // Generate structured data for the article
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": frontmatter.title,
    "description": frontmatter.description,
    "image": frontmatter.image ? `https://trendstoday.ca${frontmatter.image}` : undefined,
    "datePublished": frontmatter.publishedAt,
    "dateModified": frontmatter.updatedAt || frontmatter.publishedAt,
    "author": {
      "@type": "Person",
      "name": (typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author?.name) || "Trends Today Editorial"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Trends Today",
      "logo": {
        "@type": "ImageObject",
        "url": "https://trendstoday.ca/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://trendstoday.ca/news/${params.slug}`
    }
  };
  
  return (
    <main className="min-h-screen bg-white">
      <StructuredData data={articleStructuredData} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-red-600 text-white text-sm font-bold uppercase tracking-wide rounded-sm">
              {frontmatter.category || 'News'}
            </span>
            {frontmatter.featured && (
              <span className="ml-2 inline-block px-3 py-1 bg-blue-600 text-white text-sm font-bold uppercase tracking-wide rounded-sm">
                Featured
              </span>
            )}
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {frontmatter.title}
          </h1>
          
          <p className="text-xl text-gray-800 mb-6 leading-relaxed">
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
        
        {/* Article Content */}
        <article className="prose prose-lg max-w-none mb-12">
          <MDXRemote source={content} />
        </article>
        
        {/* Article Footer */}
        <footer className="border-t pt-8 space-y-8">
          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {frontmatter.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
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