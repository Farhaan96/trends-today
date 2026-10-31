import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles } from '@/lib/article-utils';
import { getCategoryLabel } from '@/lib/categories';

export const revalidate = 600;

export const metadata: Metadata = {
  title: { absolute: 'Latest stories | Trends Today' },
  description:
    'The newest Trends Today stories from Vancouver, Metro Vancouver and the Fraser Valley.',
  alternates: { canonical: 'https://www.trendstoday.ca/links' },
  robots: { index: false, follow: true },
};

export default async function LinksPage() {
  const now = Date.now();
  const articles = (await getAllArticles())
    .filter((article) => {
      const publishedAt = new Date(article.publishedAt).getTime();
      return Number.isFinite(publishedAt) && publishedAt <= now;
    })
    .slice(0, 12);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-extrabold leading-tight">
        Latest from Trends Today
      </h1>
      <p className="mt-1 text-sm text-gray-600">Tap a story. Newest first.</p>
      <ul className="mt-6 space-y-3">
        {articles.map((article) => (
          <li key={`${article.category}/${article.slug}`}>
            <Link
              href={`/${article.category}/${article.slug}?utm_source=instagram&utm_medium=social&utm_campaign=bio`}
              className="block min-h-20 rounded-xl border border-gray-300 bg-white px-4 py-3 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                {getCategoryLabel(article.category)}
              </span>
              <span className="mt-1 block break-words font-semibold leading-snug text-gray-900">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
