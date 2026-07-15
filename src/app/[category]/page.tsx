import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllArticles } from '@/lib/article-utils';
import { getCategoryKey, getCategoryDescription } from '@/lib/categories';
import { formatArticleDate } from '@/lib/editorial';
import { paginateItems } from '@/lib/pagination';
import PaginationLinks from '@/components/ui/PaginationLinks';
import EditorialImage from '@/components/editorial/EditorialImage';

type Params = { category: string };

export function generateStaticParams() {
  const categories = [
    'science',
    'culture',
    'psychology',
    'technology',
    'health',
    'space',
  ];
  return categories.map((c) => ({ category: c }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  const key = getCategoryKey(category);
  const title = key.charAt(0).toUpperCase() + key.slice(1);
  const description = getCategoryDescription(key);
  return {
    title,
    description,
    alternates: {
      canonical: `/${key}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;
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
  const description = getCategoryDescription(key);

  // Use category-based loader so pages work with content/science, content/culture, etc.
  const all = await getAllArticles();
  const posts = all.filter(
    (p) =>
      (p.category || p.frontmatter?.category || '').toString().toLowerCase() ===
      key
  );

  const title = key.charAt(0).toUpperCase() + key.slice(1);
  const { items: pageArticles, pagination } = paginateItems(
    posts,
    1,
    12,
    `/${key}`
  );

  return (
    <div className="category-page">
      <section className="category-header">
        <div className="site-shell category-header__inner">
          <h1 className="category-title">{title}</h1>
          {description && <p className="category-description">{description}</p>}
          <p className="category-count">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </section>

      <section className="site-shell category-feed">
        {posts.length === 0 ? (
          <p className="empty-state">No articles in this category yet.</p>
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
        <PaginationLinks
          pagination={pagination}
          baseUrl={`/${key}`}
          className="mt-16"
        />
      </section>
    </div>
  );
}
