import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles } from '@/lib/article-utils';
import {
  getCategoryKey,
  getCategoryStyles,
  getCategoryDescription,
} from '@/lib/categories';
import {
  paginateItems,
  generatePaginationMetadata,
  validatePageParam,
} from '@/lib/pagination';
import PaginationLinks from '@/components/ui/PaginationLinks';
import { BreadcrumbSchema } from '@/components/seo/SchemaMarkup';

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
  params: Params;
}): Promise<Metadata> {
  const key = getCategoryKey(params.category);
  const page = validatePageParam(params.page);
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
  params: Params;
}) {
  const key = getCategoryKey(params.category);
  const page = validatePageParam(params.page);
  const styles = getCategoryStyles(key);
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
    <main className="bg-white">
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Themed Category Header */}
      <section className={`border-b ${styles.headerBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${styles.badge}`}
            >
              {title}
            </span>
          </div>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-gray-900">
            {title} {page > 1 && `- Page ${page}`}
          </h1>
          {description && <p className="mt-2 text-gray-600">{description}</p>}
          <p className="mt-3 text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages} •{' '}
            {pagination.totalItems} total articles
          </p>
        </div>
      </section>

      {/* Articles list */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {pageArticles.length === 0 ? (
          <p className="text-gray-600">No articles found on this page.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageArticles.map((article) => {
              const href = `/${key}/${article.slug}`;
              const img = (article.image || article.frontmatter?.image) as
                | string
                | undefined;
              const atitle = (article.title ||
                article.frontmatter?.title) as string;
              const date = new Date(
                (article.publishedAt ||
                  article.frontmatter?.publishedAt ||
                  new Date().toISOString()) as string
              ).toLocaleDateString();
              return (
                <article key={href} className="group">
                  <Link href={href}>
                    <div className="relative w-full aspect-square bg-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                      {img ? (
                        <Image
                          src={img}
                          alt={atitle}
                          fill
                          className="object-cover rounded-xl transition-transform duration-300"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          loading={page === 1 ? 'eager' : 'lazy'}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm rounded-xl">
                          Image
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${styles.badge}`}
                        >
                          {key}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <Link href={href}>
                    <h2 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-gray-800 leading-snug">
                      {atitle}
                    </h2>
                  </Link>
                  <div className="text-sm text-gray-500">{date}</div>
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
    </main>
  );
}
