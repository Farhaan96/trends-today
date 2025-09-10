import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getArticleBySlug, getAllArticles } from '@/lib/article-utils';
import ArticleContent from '@/components/article/ArticleContent';

const categoryConfig = {
  science: { name: 'Science', color: 'from-blue-500 to-indigo-600' },
  culture: { name: 'Culture', color: 'from-purple-500 to-pink-600' },
  psychology: { name: 'Psychology', color: 'from-green-500 to-teal-600' },
  technology: { name: 'Technology', color: 'from-orange-500 to-red-600' },
  health: { name: 'Health', color: 'from-cyan-500 to-blue-600' },
  mystery: { name: 'Mystery', color: 'from-violet-500 to-purple-600' }
};

export async function generateStaticParams() {
  const articles = await getAllArticles();
  const params = [];
  
  for (const category of Object.keys(categoryConfig)) {
    const categoryArticles = articles.filter(a => 
      a.category?.toLowerCase() === category || 
      a.frontmatter?.category?.toLowerCase() === category
    );
    
    for (const article of categoryArticles) {
      params.push({
        category: category,
        slug: article.slug
      });
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.category, params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found | Trends Today',
      description: 'The article you are looking for does not exist.'
    };
  }

  return {
    title: `${article.title || article.frontmatter?.title} | Trends Today`,
    description: article.description || article.frontmatter?.description,
    openGraph: {
      title: article.title || article.frontmatter?.title,
      description: article.description || article.frontmatter?.description,
      type: 'article',
      images: [article.image || article.frontmatter?.image || '/images/placeholder.jpg'],
    },
  };
}

export default async function ArticlePage({ params }: { params: { category: string; slug: string } }) {
  const article = await getArticleBySlug(params.category, params.slug);
  
  if (!article) {
    notFound();
  }

  const category = categoryConfig[params.category as keyof typeof categoryConfig];
  
  // Get related articles from the same category
  const allArticles = await getAllArticles();
  const relatedArticles = allArticles
    .filter(a => 
      (a.category?.toLowerCase() === params.category || 
       a.frontmatter?.category?.toLowerCase() === params.category) &&
      a.slug !== params.slug
    )
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-white">
      {/* Article Header */}
      <header className="relative">
        <div className="relative h-96 md:h-[500px]">
          <Image
            src={article.image || article.frontmatter?.image || '/images/placeholder.jpg'}
            alt={article.title || article.frontmatter?.title || 'Article'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          {/* Category Badge - Links back to category page */}
          <Link 
            href={`/${params.category}`}
            className={`absolute top-8 left-8 bg-gradient-to-r ${category.color} text-white px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform`}
          >
            ← Back to {category.name}
          </Link>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {article.title || article.frontmatter?.title}
              </h1>
              <div className="flex items-center gap-4 text-lg">
                <span>{article.author?.name || article.frontmatter?.author?.name || 'Trends Today'}</span>
                <span>•</span>
                <span>{new Date(article.publishedAt || article.frontmatter?.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ArticleContent content={article.content || article.mdxContent} />
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">More from {category.name}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link 
                  key={related.slug} 
                  href={`/${params.category}/${related.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={related.image || related.frontmatter?.image || '/images/placeholder.jpg'}
                      alt={related.title || related.frontmatter?.title || 'Article'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold line-clamp-2 hover:text-blue-600 transition-colors">
                      {related.title || related.frontmatter?.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}