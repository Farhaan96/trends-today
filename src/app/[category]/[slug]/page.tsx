import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug, getAllArticles } from '@/lib/article-utils';
import ArticleContent from '@/components/article/ArticleContent';
import ArticleHighlights from '@/components/article/ArticleHighlights';
import ArticleJsonLd from '@/components/seo/ArticleJsonLd';
import { BreadcrumbSchema } from '@/components/seo/SchemaMarkup';
import { SmartRelatedArticles } from '@/components/article/RelatedArticles';
import MoreFromAuthor from '@/components/content/MoreFromAuthor';
import { formatArticleDate, formatArticleDateTime } from '@/lib/editorial';
import EditorialImage from '@/components/editorial/EditorialImage';
import { CONTENT_CATEGORIES, getCategoryLabel } from '@/lib/categories';
import {
  getNewsroomProfileByName,
  getNewsroomProfileId,
  normalizeAuthorName,
} from '@/lib/newsroom';

const categoryConfig = Object.fromEntries(
  CONTENT_CATEGORIES.map((category) => [
    category,
    { name: getCategoryLabel(category) },
  ])
) as Record<string, { name: string }>;

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
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getArticleBySlug(category, slug);
  if (!article) {
    return {
      title: 'Article Not Found | Trends Today',
      description: 'The article you are looking for does not exist.',
    };
  }

  const title = article.title || article.frontmatter?.title;
  const description = article.description || article.frontmatter?.description;
  const image = article.image || article.frontmatter?.image;
  const url = `https://www.trendstoday.ca/${category}/${slug}`;
  const needsSourceRefresh =
    article.frontmatter?.archiveReviewStatus ===
    'format-reviewed-needs-source-refresh';

  return {
    title,
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
        normalizeAuthorName(
          typeof (article.author || article.frontmatter?.author) === 'string'
            ? article.author || article.frontmatter?.author
            : article.author?.name || article.frontmatter?.author?.name
        ),
      ],
      section: category,
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
      index: !needsSourceRefresh,
      follow: true,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category: categoryKey, slug } = await params;
  const article = await getArticleBySlug(categoryKey, slug);
  if (!article) notFound();

  const category = categoryConfig[categoryKey as keyof typeof categoryConfig];

  const allArticles = await getAllArticles();

  // Prepare data for structured data
  const title = article.title || article.frontmatter?.title;
  const description = article.description || article.frontmatter?.description;
  const image = article.image || article.frontmatter?.image;
  const publishedAt = article.publishedAt || article.frontmatter?.publishedAt;
  const modifiedAt = article.frontmatter?.modifiedAt || publishedAt;
  const rawAuthor = article.author || article.frontmatter?.author;
  const rawAuthorName =
    typeof rawAuthor === 'string'
      ? rawAuthor
      : rawAuthor?.name || 'Trends Today Newsroom';
  const authorName = normalizeAuthorName(rawAuthorName);
  const authorProfile = getNewsroomProfileByName(rawAuthorName);
  const author = authorProfile
    ? {
        name: authorProfile.name,
        bio: authorProfile.shortBio,
        url: `https://www.trendstoday.ca/author/${authorProfile.id}`,
        type: authorProfile.entityType,
      }
    : rawAuthor || { name: authorName };
  const url = `https://www.trendstoday.ca/${categoryKey}/${slug}`;

  // Breadcrumb data
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.trendstoday.ca' },
    {
      name: category.name,
      url: `https://www.trendstoday.ca/${categoryKey}`,
    },
    { name: title, url },
  ];

  const authorId = getNewsroomProfileId(authorName);
  const readingTime = article.frontmatter?.readingTime;
  const formattedReadingTime = readingTime
    ? typeof readingTime === 'string' && readingTime.includes('min read')
      ? readingTime
      : `${readingTime} min read`
    : null;
  const locality = article.frontmatter?.locality as string | undefined;
  const editor = article.frontmatter?.editor as string | undefined;
  const highlights = article.frontmatter?.highlights as string[] | undefined;
  const reportingMethod = article.frontmatter?.reportingMethod as
    | string
    | undefined;
  const archiveReviewStatus = article.frontmatter?.archiveReviewStatus as
    | string
    | undefined;
  const needsSourceRefresh =
    archiveReviewStatus === 'format-reviewed-needs-source-refresh';

  return (
    <article className="article-page">
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
      <header className="article-header">
        <div className="site-shell article-header__inner">
          {/* Title */}
          <h1 className="article-title">
            {article.title || article.frontmatter?.title}
          </h1>

          {description && <p className="article-deck">{description}</p>}

          {/* Meta below title, above image (left-aligned; category first) */}
          {/* Meta below title, above image (left-aligned; category first) */}
          <div className="article-meta-wrap">
            <div className="article-meta">
              <Link href={`/${categoryKey}`} className="article-category">
                {category.name}
              </Link>
              {locality && <span>{locality}</span>}
              <span className="font-medium">
                {authorId ? (
                  <Link
                    href={`/author/${authorId}`}
                    className="article-author-link"
                  >
                    {authorName}
                  </Link>
                ) : (
                  authorName
                )}
              </span>
              {editor && (
                <span>
                  Edited by{' '}
                  <Link
                    href={`/author/${editor.toLowerCase().replace(/\s+/g, '-')}`}
                    className="article-author-link"
                  >
                    {editor}
                  </Link>
                </span>
              )}
              <span>
                {locality
                  ? formatArticleDateTime(
                      article.publishedAt || article.frontmatter?.publishedAt
                    )
                  : formatArticleDate(
                      article.publishedAt || article.frontmatter?.publishedAt
                    )}
              </span>
              {formattedReadingTime && <span>{formattedReadingTime}</span>}
            </div>
          </div>

          {/* Large square hero image */}
          <div className="article-hero">
            <EditorialImage
              src={article.image || article.frontmatter?.image || undefined}
              alt={article.title || article.frontmatter?.title || 'Article'}
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
            />
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="site-shell article-content-shell">
        {needsSourceRefresh && (
          <aside className="article-archive-notice">
            <p className="article-method__eyebrow">Archive transparency</p>
            <p>
              This article received a July 2026 readability and source-display
              pass, but its underlying claims have not yet received a fresh
              source review. It is temporarily excluded from search indexing.
              Check the linked sources for current information.
            </p>
          </aside>
        )}
        <ArticleHighlights highlights={highlights} />
        <ArticleContent content={article.content || article.mdxContent} />
        {reportingMethod && (
          <aside className="article-method" aria-labelledby="reporting-method">
            <p className="article-method__eyebrow">Transparency</p>
            <h2 id="reporting-method">How we reported this</h2>
            <p>{reportingMethod}</p>
          </aside>
        )}
      </div>

      {/* More from Author */}
      <div className="site-shell article-supporting">
        {(article.author || article.frontmatter?.author) &&
          (() => {
            const currentAuthor = article.author || article.frontmatter?.author;
            const authorName =
              typeof currentAuthor === 'string'
                ? currentAuthor
                : currentAuthor?.name || currentAuthor;

            // Filter articles by the same author, excluding current article
            const authorArticles = allArticles
              .filter((a) => {
                const articleAuthor =
                  a.author?.name ||
                  a.frontmatter?.author?.name ||
                  a.frontmatter?.author;
                return articleAuthor === authorName && a.slug !== slug;
              })
              .slice(0, 3)
              .map((a) => ({
                title: a.title || a.frontmatter?.title,
                description: a.description || a.frontmatter?.description,
                href: `/${a.category}/${a.slug}`,
                publishedAt: a.publishedAt || a.frontmatter?.publishedAt,
                image: a.image || a.frontmatter?.image,
                category: a.category,
                readingTime: a.frontmatter?.readingTime || '2',
              }));

            return (
              <MoreFromAuthor
                author={currentAuthor}
                articles={authorArticles}
              />
            );
          })()}
      </div>

      {/* Related Articles */}
      <SmartRelatedArticles
        currentArticle={{
          slug,
          title: article.title,
          category: categoryKey,
          frontmatter: article.frontmatter,
        }}
        allArticles={allArticles}
        maxArticles={3}
        className="article-related"
      />
    </article>
  );
}
