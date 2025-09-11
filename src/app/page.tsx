import Link from 'next/link';
import Image from 'next/image';
import StructuredData from '@/components/seo/StructuredData';
import { getAllBaseSchemas } from '@/lib/schema';
import { getAllPosts } from '@/lib/content';

export default async function HomePage({ searchParams }: { searchParams?: { page?: string } }) {
  const posts = await getAllPosts();

  // Pagination setup - 9 posts per page
  const pageSize = 9;
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagePosts = posts.slice(start, end);
  const hasNext = end < posts.length;
  const hasPrev = page > 1;
  const totalPages = Math.ceil(posts.length / pageSize);

  // Get first 3 posts for the leravi-style layout
  const featuredPost = pagePosts[0];
  const secondPost = pagePosts[1];
  const thirdPost = pagePosts[2];

  return (
    <main className="bg-white min-h-screen">
      <h1 className="sr-only">Trends Today - Latest Articles</h1>
      <StructuredData data={getAllBaseSchemas()} />
      
      {/* Leravi-style Layout */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        {/* Featured Article - Takes up most of the screen */}
        {featuredPost && (
          <div className="mb-48">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Image */}
              <Link href={featuredPost.href as string} prefetch={false}>
                <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  {featuredPost.frontmatter.image ? (
                    <Image 
                      src={featuredPost.frontmatter.image} 
                      alt={featuredPost.frontmatter.title as string}
                      fill 
                      className="object-cover hover:scale-105 transition-transform duration-300" 
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                        <p className="text-sm">Image</p>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
              
              {/* Content */}
              <div className="space-y-4">
                <Link href={featuredPost.href as string} prefetch={false}>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words">
                    {featuredPost.frontmatter.title as string}
                  </h2>
                </Link>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="font-medium">By {typeof featuredPost.frontmatter.author === 'string' ? featuredPost.frontmatter.author : featuredPost.frontmatter.author?.name || 'Trends Today'}</span>
                  <span>•</span>
                  <span>{new Date(featuredPost.frontmatter.publishedAt || featuredPost.frontmatter.datePublished || new Date().toISOString()).toLocaleDateString()}</span>
                </div>
                
                {featuredPost.frontmatter.description && (
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {(featuredPost.frontmatter.description as string).substring(0, 200)}...
                  </p>
                )}
                
                <Link 
                  href={featuredPost.href as string}
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm text-white"
                >
                  Read more →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Preview Articles - Show just the tops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-48">
          {secondPost && (
            <div className="space-y-4">
              <Link href={secondPost.href as string} prefetch={false}>
                <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  {secondPost.frontmatter.image ? (
                    <Image 
                      src={secondPost.frontmatter.image} 
                      alt={secondPost.frontmatter.title as string}
                      fill 
                      className="object-cover hover:scale-105 transition-transform duration-300" 
                      sizes="(max-width: 768px) 100vw, 50vw"
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
              </Link>
              <Link href={secondPost.href as string} prefetch={false}>
                <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words">
                  {secondPost.frontmatter.title as string}
                </h3>
              </Link>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{typeof secondPost.frontmatter.author === 'string' ? secondPost.frontmatter.author : secondPost.frontmatter.author?.name || 'Trends Today'}</span>
                <span className="mx-2">•</span>
                <span>{new Date(secondPost.frontmatter.publishedAt || secondPost.frontmatter.datePublished || new Date().toISOString()).toLocaleDateString()}</span>
              </div>
              <Link 
                href={secondPost.href as string}
                className="inline-block text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Read more →
              </Link>
            </div>
          )}

          {thirdPost && (
            <div className="space-y-4">
              <Link href={thirdPost.href as string} prefetch={false}>
                <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  {thirdPost.frontmatter.image ? (
                    <Image 
                      src={thirdPost.frontmatter.image} 
                      alt={thirdPost.frontmatter.title as string}
                      fill 
                      className="object-cover hover:scale-105 transition-transform duration-300" 
                      sizes="(max-width: 768px) 100vw, 50vw"
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
              </Link>
              <Link href={thirdPost.href as string} prefetch={false}>
                <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words">
                  {thirdPost.frontmatter.title as string}
                </h3>
              </Link>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{typeof thirdPost.frontmatter.author === 'string' ? thirdPost.frontmatter.author : thirdPost.frontmatter.author?.name || 'Trends Today'}</span>
                <span className="mx-2">•</span>
                <span>{new Date(thirdPost.frontmatter.publishedAt || thirdPost.frontmatter.datePublished || new Date().toISOString()).toLocaleDateString()}</span>
              </div>
              <Link 
                href={thirdPost.href as string}
                className="inline-block text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Read more →
              </Link>
            </div>
          )}
        </div>

        {/* Additional Articles Grid - 6 more articles */}
        {pagePosts.length > 3 && (
          <div className="mt-48">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {pagePosts.slice(3).map((article, index) => (
                <div key={article.href} className="space-y-4">
                  <Link href={article.href as string} prefetch={false}>
                    <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      {article.frontmatter.image ? (
                        <Image 
                          src={article.frontmatter.image} 
                          alt={article.frontmatter.title as string}
                          fill 
                          className="object-cover hover:scale-105 transition-transform duration-300" 
                          sizes="(max-width: 768px) 100vw, 50vw"
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
                  </Link>
                  <Link href={article.href as string} prefetch={false}>
                    <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words">
                      {article.frontmatter.title as string}
                    </h3>
                  </Link>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{typeof article.frontmatter.author === 'string' ? article.frontmatter.author : article.frontmatter.author?.name || 'Trends Today'}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(article.frontmatter.publishedAt || article.frontmatter.datePublished || new Date().toISOString()).toLocaleDateString()}</span>
                  </div>
                  <Link 
                    href={article.href as string}
                    className="inline-block text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    Read more →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Pagination */}
        <nav className="mt-48 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-1">
              {hasPrev && (
                <Link
                  href={`/?page=${page - 1}`}
                  prefetch={false}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  ← Newer
                </Link>
              )}

              <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  const pageNum = Math.min(Math.max(1, page - 2) + idx, totalPages);
                  return (
                    <Link
                      key={pageNum}
                      href={`/?page=${pageNum}`}
                      prefetch={false}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        pageNum === page
                        ? 'bg-purple-600 text-white'
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
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Older →
                </Link>
              )}
            </div>
          <div className="text-center mt-4 text-sm text-gray-500">
              Page {page} of {totalPages} • {posts.length} articles
            </div>
          </nav>
      </section>
    </main>
  );
}