import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StructuredData from '@/components/seo/StructuredData';
import { getAllBaseSchemas } from '@/lib/schema';
import { getAllPosts } from '@/lib/content';
import ArticleList from '@/components/home/ArticleList';
import { paginateItems, generatePaginationMetadata, validatePageParam } from '@/lib/pagination';
import PaginationLinks from '@/components/ui/PaginationLinks';

interface Props {
  params: {
    page: string;
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const totalPages = Math.ceil(posts.length / 12);

  // Generate pages 2 through totalPages (page 1 is handled by /page.tsx)
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: (i + 2).toString(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = validatePageParam(params.page);
  const posts = await getAllPosts();
  const totalPages = Math.ceil(posts.length / 12);

  if (page > totalPages) {
    return {
      title: 'Page Not Found | Trends Today',
      description: 'The page you are looking for does not exist.',
    };
  }

  const paginatedResult = paginateItems(posts, page, 12, '');
  const baseTitle = "Trends Today - Discover What's Trending in Science, Culture, Technology & More";

  return {
    ...generatePaginationMetadata(paginatedResult.pagination, '', baseTitle),
    description: `Page ${page} of trending discoveries, breakthrough research, and fascinating insights across science, psychology, technology, culture, and more.`,
    openGraph: {
      title: `Page ${page} | Trends Today`,
      description: `Explore page ${page} of trending topics and breakthrough insights across all categories.`,
      type: 'website',
      url: `https://www.trendstoday.ca/page/${page}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PaginatedHomePage({ params }: Props) {
  const page = validatePageParam(params.page);
  const posts = await getAllPosts();
  const paginatedResult = paginateItems(posts, page, 12, '');

  if (page > paginatedResult.pagination.totalPages) {
    notFound();
  }

  const { items: pageArticles, pagination } = paginatedResult;

  return (
    <main className="bg-white min-h-screen">
      <h1 className="sr-only">
        Trends Today - Latest Articles - Page {page}
      </h1>
      <StructuredData data={getAllBaseSchemas()} />

      {/* Leravi-style Layout */}
      <section className="max-w-6xl mx-auto px-6 py-8 md:py-32">
        {/* Page indicator for SEO and user orientation */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-2">
            Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalItems} total articles
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            Latest Articles {pagination.currentPage > 1 && `- Page ${pagination.currentPage}`}
          </h2>
        </div>

        {/* Article Grid - Static for this page */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
          {pageArticles.map((article) => (
            <div key={article.href} className="space-y-4">
              <a href={article.href} className="block">
                <div className="relative w-full aspect-square bg-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  {article.frontmatter.image ? (
                    <img
                      src={article.frontmatter.image}
                      alt={article.frontmatter.title}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-300"
                      loading={pagination.currentPage === 1 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                        <p className="text-xs">Image</p>
                      </div>
                    </div>
                  )}
                </div>
              </a>
              <a href={article.href} className="block">
                <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words">
                  {article.frontmatter.title}
                </h3>
              </a>
              <div className="text-sm text-gray-500">
                <span className="font-medium">
                  {typeof article.frontmatter.author === 'string'
                    ? article.frontmatter.author
                    : article.frontmatter.author?.name || 'Trends Today'}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {new Date(
                    article.frontmatter.publishedAt ||
                      article.frontmatter.datePublished ||
                      new Date().toISOString()
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Navigation */}
        <PaginationLinks
          pagination={pagination}
          baseUrl=""
          className="mt-16 md:mt-24"
        />
      </section>
    </main>
  );
}