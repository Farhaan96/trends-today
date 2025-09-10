import Link from 'next/link';
import StructuredData from '@/components/seo/StructuredData';
import { getAllBaseSchemas } from '@/lib/schema';
import { getAllPosts } from '@/lib/content';
import HeroCard from '@/components/minimal/HeroCard';
import GridCard from '@/components/minimal/GridCard';
import AdSlot from '@/components/ads/AdSlot';

export default async function HomePage({ searchParams }: { searchParams?: { page?: string } }) {
  const posts = await getAllPosts();

  // 1 hero + 2 grid pattern, repeated for 9 posts/page
  const pageSize = 9;
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagePosts = posts.slice(start, end);
  const hasNext = end < posts.length;
  const hasPrev = page > 1;
  const totalPages = Math.ceil(posts.length / pageSize);

  return (
    <main className="bg-white min-h-screen">
      <h1 className="sr-only">Trends Today - Latest Articles</h1>
      <StructuredData data={getAllBaseSchemas()} />
      <section>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
          {Array.from({ length: Math.ceil(pagePosts.length / 3) }).map((_, gi) => {
            const i = gi * 3;
            const hero = pagePosts[i];
            const left = pagePosts[i + 1];
            const right = pagePosts[i + 2];
            if (!hero) return null;
            return (
              <div key={`group-${gi}`} className="space-y-6">
                <HeroCard article={hero} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {left && <GridCard article={left} />}
                  {right && <GridCard article={right} />}
                </div>
                <AdSlot height={120} className="rounded" />
              </div>
            );
          })}

          {/* Pagination */}
          <nav className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-1">
              {hasPrev && (
                <Link
                  href={`/?page=${page - 1}`}
                  prefetch={false}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                >
                  ← Newer
                </Link>
              )}

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
                  const pageNum = Math.min(Math.max(1, page - 2) + idx, totalPages);
                  return (
                    <Link
                      key={pageNum}
                      href={`/?page=${pageNum}`}
                      prefetch={false}
                      className={`px-3 py-2 text-sm rounded transition-colors ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              {hasNext && (
                <Link
                  href={`/?page=${page + 1}`}
                  prefetch={false}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                >
                  Older →
                </Link>
              )}
            </div>
            <div className="text-center mt-4 text-xs text-gray-500">
              Page {page} of {totalPages} • {posts.length} articles
            </div>
          </nav>
        </div>
      </section>
    </main>
  );
}