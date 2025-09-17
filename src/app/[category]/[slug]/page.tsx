import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getArticleBySlug, getAllArticles } from '@/lib/article-utils';
import ArticleContent from '@/components/article/ArticleContent';
import ArticleJsonLd from '@/components/seo/ArticleJsonLd';
import { BreadcrumbSchema } from '@/components/seo/SchemaMarkup';
import { SmartRelatedArticles } from '@/components/article/RelatedArticles';

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
      (a) =>
        a.category?.toLowerCase() === category ||
        a.frontmatter?.category?.toLowerCase() === category
    );
    for (const article of categoryArticles) {
      params.push({ category, slug: article.slug });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.category, params.slug);
  if (!article) {
    return {
      title: 'Article Not Found | Trends Today',
      description: 'The article you are looking for does not exist.',
    };
  }

  const title = article.title || article.frontmatter?.title;
  const description = article.description || article.frontmatter?.description;
  const image = article.image || article.frontmatter?.image;
  const url = `https://www.trendstoday.ca/${params.category}/${params.slug}`;

  return {
    title: `${title} | Trends Today`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      publishedTime: article.publishedAt || article.frontmatter?.publishedAt,
      modifiedTime:
        article.frontmatter?.modifiedAt ||
        article.publishedAt ||
        article.frontmatter?.publishedAt,
      authors: [
        article.author?.name ||
          article.frontmatter?.author?.name ||
          'Trends Today',
      ],
      section: params.category,
      images: [
        {
          url: image || '/images/placeholder.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image || '/images/placeholder.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const article = await getArticleBySlug(params.category, params.slug);
  if (!article) notFound();

  const category =
    categoryConfig[params.category as keyof typeof categoryConfig];

  const allArticles = await getAllArticles();
  const relatedArticles = allArticles
    .filter(
      (a) =>
        (a.category?.toLowerCase() === params.category ||
          a.frontmatter?.category?.toLowerCase() === params.category) &&
        a.slug !== params.slug
    )
    .slice(0, 3);

  // Prepare data for structured data
  const title = article.title || article.frontmatter?.title;
  const description = article.description || article.frontmatter?.description;
  const image = article.image || article.frontmatter?.image;
  const publishedAt = article.publishedAt || article.frontmatter?.publishedAt;
  const modifiedAt = article.frontmatter?.modifiedAt || publishedAt;
  const author = article.author ||
    article.frontmatter?.author || { name: 'Trends Today' };
  const url = `https://www.trendstoday.ca/${params.category}/${params.slug}`;

  // Breadcrumb data
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.trendstoday.ca' },
    {
      name: category.name,
      url: `https://www.trendstoday.ca/${params.category}`,
    },
    { name: title, url },
  ];

  return (
    <article className="min-h-screen bg-white">
      {/* Structured Data */}
      <ArticleJsonLd
        headline={title}
        description={description}
        image={image}
        author={author}
        publishedAt={publishedAt}
        modifiedAt={modifiedAt}
        category={category.name}
        url={url}
        wordCount={article.frontmatter?.wordCount}
        readingTime={article.frontmatter?.readingTime}
        keywords={article.frontmatter?.keywords}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      {/* Header */}
      <header className="bg-white pt-8 pb-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3 md:mb-4">
            {article.title || article.frontmatter?.title}
          </h1>

          {/* Meta below title, above image (left-aligned; category first) */}
          {/* Meta below title, above image (left-aligned; category first) */}
          <div className="my-4 border-y border-gray-200/70">
            <div className="flex flex-wrap items-center justify-start gap-3 text-gray-600 py-3 text-sm">
              <Link
                href={`/${params.category}`}
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${category.color}`}
              >
                {category.name}
              </Link>
              <span>•</span>
              <span className="font-medium">
                {(() => {
                  const author = article.author || article.frontmatter?.author;
                  const authorName = author?.name || 'Trends Today';
                  const authorId = (author as any)?.id || (typeof author === 'string' ? (author as string).toLowerCase().replace(/\s+/g, '-') : null);

                  return authorId && authorId !== 'trends-today' ? (
                    <Link
                      href={`/author/${authorId}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {authorName}
                    </Link>
                  ) : authorName;
                })()}
              </span>
              <span>•</span>
              <span>
                {new Date(
                  article.publishedAt || article.frontmatter?.publishedAt
                ).toLocaleDateString()}
              </span>
              {(article.frontmatter?.readingTime ||
                (article as any).readingTime) && (
                <>
                  <span>•</span>
                  <span>
                    {(() => {
                      const readingTime = article.frontmatter?.readingTime ||
                        (article as any).readingTime;
                      return typeof readingTime === 'string' &&
                             readingTime.includes('min read')
                        ? readingTime
                        : `${readingTime} min read`;
                    })()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Large square hero image */}
          <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 md:mb-6">
            <Image
              src={
                article.image ||
                article.frontmatter?.image ||
                '/images/placeholder.jpg'
              }
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

      {/* Related Articles */}
      <SmartRelatedArticles
        currentArticle={{
          slug: params.slug,
          title: article.title,
          category: params.category,
          frontmatter: article.frontmatter,
        }}
        allArticles={allArticles}
        maxArticles={3}
        className="bg-gray-50"
      />
    </article>
  );
}
