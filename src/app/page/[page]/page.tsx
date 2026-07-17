import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StructuredData from '@/components/seo/StructuredData';
import { getAllBaseSchemas } from '@/lib/schema';
import { getAllPosts } from '@/lib/content';
import {
  paginateItems,
  generatePaginationMetadata,
  validatePageParam,
} from '@/lib/pagination';
import PaginationLinks from '@/components/ui/PaginationLinks';
import { formatArticleDate } from '@/lib/editorial';
import EditorialImage from '@/components/editorial/EditorialImage';
import { isLocalNewsCategory } from '@/lib/categories';

interface Props {
  params: Promise<{
    page: string;
  }>;
}

async function getHomepageFeed() {
  const posts = await getAllPosts();
  const localPosts = posts.filter((post) =>
    isLocalNewsCategory(post.category || post.frontmatter.category)
  );

  return {
    posts: localPosts.length > 0 ? localPosts : posts,
    localDeskIsLive: localPosts.length > 0,
  };
}

export async function generateStaticParams() {
  const { posts } = await getHomepageFeed();
  const totalPages = Math.ceil(posts.length / 12);

  // Generate pages 2 through totalPages (page 1 is handled by /page.tsx)
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: (i + 2).toString(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: pageParam } = await params;
  const page = validatePageParam(pageParam);
  const { posts, localDeskIsLive } = await getHomepageFeed();
  const totalPages = Math.ceil(posts.length / 12);

  if (page > totalPages) {
    return {
      title: 'Page Not Found | Trends Today',
      description: 'The page you are looking for does not exist.',
    };
  }

  const paginatedResult = paginateItems(posts, page, 12, '');
  const baseTitle = localDeskIsLive
    ? 'Trends Today | Lower Mainland News and Things to Do'
    : 'Trends Today | Article Archive';

  return {
    ...generatePaginationMetadata(paginatedResult.pagination, '', baseTitle),
    description: localDeskIsLive
      ? `Page ${page} of local news, transit updates, events, food, housing, and sports across the Lower Mainland.`
      : `Page ${page} of the existing Trends Today article archive.`,
    openGraph: {
      title: `Page ${page} | Trends Today`,
      description: localDeskIsLive
        ? `Explore page ${page} of useful updates from Vancouver to the Fraser Valley.`
        : `Explore page ${page} of the existing Trends Today article archive.`,
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
  const { page: pageParam } = await params;
  const page = validatePageParam(pageParam);
  const { posts, localDeskIsLive } = await getHomepageFeed();
  const paginatedResult = paginateItems(posts, page, 12, '');

  if (page > paginatedResult.pagination.totalPages) {
    notFound();
  }

  const { items: pageArticles, pagination } = paginatedResult;

  return (
    <div className="site-page">
      <h1 className="sr-only">
        {localDeskIsLive
          ? 'Trends Today local updates'
          : 'Trends Today archive'}
        , page {page}
      </h1>
      <StructuredData data={getAllBaseSchemas()} />

      <section className="site-shell category-feed">
        <div className="archive-header">
          <p className="category-count">
            Page {pagination.currentPage} of {pagination.totalPages} |{' '}
            {pagination.totalItems} total articles
          </p>
          <h2>
            {localDeskIsLive ? 'Latest local updates' : 'From the archive'}{' '}
            {pagination.currentPage > 1 && `| Page ${pagination.currentPage}`}
          </h2>
        </div>

        <div className="category-grid">
          {pageArticles.map((article) => (
            <article key={article.href} className="category-story">
              <a href={article.href} className="block">
                <div className="category-story__media">
                  {article.frontmatter.image ? (
                    <EditorialImage
                      src={article.frontmatter.image}
                      alt={article.frontmatter.title}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="editorial-image-fallback">
                      <span>Trends Today</span>
                    </div>
                  )}
                </div>
              </a>
              <a href={article.href} className="block">
                <h3 className="category-story__title">
                  {article.frontmatter.title}
                </h3>
              </a>
              <div className="category-story__date">
                <span className="font-medium">
                  {typeof article.frontmatter.author === 'string'
                    ? article.frontmatter.author
                    : article.frontmatter.author?.name || 'Trends Today'}
                </span>
                <span className="mx-2">|</span>
                <span>
                  {formatArticleDate(
                    article.frontmatter.publishedAt ||
                      article.frontmatter.datePublished
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>

        <PaginationLinks
          pagination={pagination}
          baseUrl=""
          className="mt-16 md:mt-24"
        />
      </section>
    </div>
  );
}
