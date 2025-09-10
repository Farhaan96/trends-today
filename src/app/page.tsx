import Link from 'next/link';
import Image from 'next/image';
import StructuredData from '@/components/seo/StructuredData';
import { getAllBaseSchemas } from '@/lib/schema';
import { getAllPosts } from '@/lib/content';

export default async function HomePage({ searchParams }: { searchParams?: { page?: string } }) {
  const posts = await getAllPosts();

  // Get first 3 posts for the leravi-style layout
  const featuredPost = posts[0];
  const secondPost = posts[1];
  const thirdPost = posts[2];

  return (
    <main className="bg-white min-h-screen">
      <h1 className="sr-only">Trends Today - Latest Articles</h1>
      <StructuredData data={getAllBaseSchemas()} />
      
      {/* Leravi-style Layout */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Featured Article - Takes up most of the screen */}
        {featuredPost && (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Image */}
              <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                {featuredPost.frontmatter.image ? (
                  <Image 
                    src={featuredPost.frontmatter.image} 
                    alt={featuredPost.frontmatter.title as string}
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                      <p className="text-sm">Image</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <Link href={featuredPost.href as string} prefetch={false}>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 hover:text-purple-600 transition-colors leading-tight">
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
                  className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Read more →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Preview Articles - Show just the tops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {secondPost && (
            <div className="space-y-4">
              <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
                {secondPost.frontmatter.image ? (
                  <Image 
                    src={secondPost.frontmatter.image} 
                    alt={secondPost.frontmatter.title as string}
                    fill 
                    className="object-cover" 
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
              <Link href={secondPost.href as string} prefetch={false}>
                <h3 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors leading-tight">
                  {secondPost.frontmatter.title as string}
                </h3>
              </Link>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{typeof secondPost.frontmatter.author === 'string' ? secondPost.frontmatter.author : secondPost.frontmatter.author?.name || 'Trends Today'}</span>
                <span className="mx-2">•</span>
                <span>{new Date(secondPost.frontmatter.publishedAt || secondPost.frontmatter.datePublished || new Date().toISOString()).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {thirdPost && (
            <div className="space-y-4">
              <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
                {thirdPost.frontmatter.image ? (
                  <Image 
                    src={thirdPost.frontmatter.image} 
                    alt={thirdPost.frontmatter.title as string}
                    fill 
                    className="object-cover" 
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
              <Link href={thirdPost.href as string} prefetch={false}>
                <h3 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors leading-tight">
                  {thirdPost.frontmatter.title as string}
                </h3>
              </Link>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{typeof thirdPost.frontmatter.author === 'string' ? thirdPost.frontmatter.author : thirdPost.frontmatter.author?.name || 'Trends Today'}</span>
                <span className="mx-2">•</span>
                <span>{new Date(thirdPost.frontmatter.publishedAt || thirdPost.frontmatter.datePublished || new Date().toISOString()).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}