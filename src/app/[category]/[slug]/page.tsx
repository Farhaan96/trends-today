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
  space: { name: 'Space', color: 'from-indigo-600 to-fuchsia-700' },
} as const;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  const params: { category: string; slug: string }[] = [];

  for (const category of Object.keys(categoryConfig)) {
    const categoryArticles = articles.filter(
      (a) => a.category?.toLowerCase() === category || a.frontmatter?.category?.toLowerCase() === category
    );
    for (const article of categoryArticles) {
      params.push({ category, slug: article.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.category, params.slug);
  if (!article) {
    return { title: 'Article Not Found | Trends Today', description: 'The article you are looking for does not exist.' };
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
  if (!article) notFound();

  const category = categoryConfig[params.category as keyof typeof categoryConfig];

  const allArticles = await getAllArticles();
  const relatedArticles = allArticles
    .filter(
      (a) =>
        (a.category?.toLowerCase() === params.category || a.frontmatter?.category?.toLowerCase() === params.category) &&
        a.slug !== params.slug
    )
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white pt-8 pb-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3 md:mb-4">
            {article.title || article.frontmatter?.title}
          </h1>

          {/* Meta below title, above image */}
          <div className="flex items-center justify-center gap-4 text-gray-600 mb-4">
            <span className="font-medium">{article.author?.name || article.frontmatter?.author?.name || 'Trends Today'}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt || article.frontmatter?.publishedAt).toLocaleDateString()}</span>
            {(article.frontmatter?.readingTime || (article as any).readingTime) && (
              <>
                <span>•</span>
                <span>{article.frontmatter?.readingTime || (article as any).readingTime} min read</span>
              </>
            )}
            <span>•</span>
            <Link href={`/${params.category}`} className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${category.color}`}>
              {category.name}
            </Link>
          </div>

          {/* Large square hero image */}
          <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 md:mb-6">
            <Image
              src={article.image || article.frontmatter?.image || '/images/placeholder.jpg'}
              alt={article.title || article.frontmatter?.title || 'Article'}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
            />
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <ArticleContent content={article.content || article.mdxContent} />
      </div>

      {/* Related */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">More from {category.name}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/${params.category}/${related.slug}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow block"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={related.image || related.frontmatter?.image || '/images/placeholder.jpg'}
                      alt={related.title || related.frontmatter?.title || 'Article'}
                      fill
                      className="object-cover rounded-t-xl"
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