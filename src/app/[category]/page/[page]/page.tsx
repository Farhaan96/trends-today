import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllArticles } from '@/lib/article-utils';
import { getCategoryKey, getCategoryDescription } from '@/lib/categories';
import { formatArticleDate } from '@/lib/editorial';
import {
  paginateItems,
  generatePaginationMetadata,
  validatePageParam,
} from '@/lib/pagination';
import PaginationLinks from '@/components/ui/PaginationLinks';
import { BreadcrumbSchema } from '@/components/seo/SchemaMarkup';
import EditorialImage from '@/components/editorial/EditorialImage';

type Params = {
  category: string;
  page: string;
};

export function generateStaticParams() {
  const categories = [
    'science',
    'culture',
    'psychology',
    'technology',
    'health',
    'space',
  ];

  // Generate params for each category's paginated pages
  // We'll calculate the actual pages needed in the build
  const params: Array<{ category: string; page: string }> = [];

  categories.forEach((category) => {
    // Generate up to 10 pages per category for static generation
    // Additional pages will be generated on-demand
    for (let page = 2; page <= 10; page++) {
      params.push({ category, page: page.toString() });
    }
  });

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, page: pageParam } = await params;
  const supportedCategories = [
    'science',
    'culture',
    'psychology',
    'technology',
    'health',
    'space',
    'mystery',
  ];
  if (!supportedCategories.includes(category.toLowerCase())) notFound();

  const key = getCategoryKey(category);
  const page = validatePageParam(pageParam);
  const description = getCategoryDescription(key);

  const all = await getAllArticles();
  const posts = all.filter(
    (p) =>
      (p.category || p.frontmatter?.category || '').toString().toLowerCase() ===
      key
  );

  const totalPages = Math.ceil(posts.length / 12);

  if (page > totalPages) {
    return {
      title: 'Page Not Found | Trends Today',
      description: 'The page you are looking for does not exist.',
    };
  }

  const paginatedResult = paginateItems(posts, page, 12, `/${key}`);
  const title = `${key.charAt(0).toUpperCase() + key.slice(1)} - Page ${page}`;
  const baseTitle = `${key.charAt(0).toUpperCase() + key.slice(1)} | Trends Today`;

  return {
    ...generatePaginationMetadata(
      paginatedResult.pagination,
      `/${key}`,
      baseTitle
    ),
    title,
    description: `Page ${page} of ${description}`,
    openGraph: {
      title,
      description: `Explore page ${page} of ${key} articles and insights.`,
      type: 'website',
      url: `https://www.trendstoday.ca/${key}/page/${page}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPaginatedPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, page: pageParam } = await params;
  const key = getCategoryKey(category);
  const page = validatePageParam(pageParam);
  const description = getCategoryDescription(key);

  const all = await getAllArticles();
  const posts = all.filter(
    (p) =>
      (p.category || p.frontmatter?.category || '').toString().toLowerCase() ===
      key
  );

  const paginatedResult = paginateItems(posts, page, 12, `/${key}`);

  if (page > paginatedResult.pagination.totalPages) {
    notFound();
  }

  const { items: pageArticles, pagination } = paginatedResult;
  const title = key.charAt(0).toUpperCase() + key.slice(1);

  // Breadcrumb data
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.trendstoday.ca' },
    { name: title, url: `https://www.trendstoday.ca/${key}` },
    {
      name: `Page ${page}`,
      url: `https://www.trendstoday.ca/${key}/page/${page}`,
    },
  ];

  return (
    <div className="category-page">
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Themed Category Header */}
      <section className="category-header">
        <div className="site-shell category-header__inner">
          <h1 className="category-title">
            {title} {page > 1 && `- Page ${page}`}
          </h1>
          {description && <p className="category-description">{description}</p>}
          <p className="category-count">
            Page {pagination.currentPage} of {pagination.totalPages} •{' '}
            {pagination.totalItems} total articles
          </p>
        </div>
      </section>

      {/* Articles list */}
      <section className="site-shell category-feed">
        {pageArticles.length === 0 ? (
          <p className="empty-state">No articles found on this page.</p>
        ) : (
          <div className="category-grid">
            {pageArticles.map((article, index) => {
              const href = `/${key}/${article.slug}`;
              const img = (article.image || article.frontmatter?.image) as
                | string
                | undefined;
              const atitle = (article.title ||
                article.frontmatter?.title) as string;
              const date = formatArticleDate(
                article.publishedAt || article.frontmatter?.publishedAt
              );
              return (
                <article key={href} className="category-story">
                  <Link href={href}>
                    <div className="category-story__media">
                      <EditorialImage
                        src={img}
                        alt={atitle}
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </Link>
                  <Link href={href}>
                    <h2 className="category-story__title">{atitle}</h2>
                  </Link>
                  <div className="category-story__date">{date}</div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Navigation */}
        <PaginationLinks
          pagination={pagination}
          baseUrl={`/${key}`}
          className="mt-16"
        />
      </section>
    </div>
  );
}
