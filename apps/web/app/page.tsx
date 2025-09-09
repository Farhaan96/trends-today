import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/mdx'
import AdSlot from '@/components/AdSlot'

export default async function HomePage() {
  const posts = await getAllPosts()
  
  // Group posts by category
  const featuredPost = posts[0]
  const recentPosts = posts.slice(1, 13)
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Featured Post */}
      {featuredPost && (
        <div className="mb-12">
          <Link href={`/posts/${featuredPost.slug}`}>
            <article className="card-hover cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
              <div className="relative h-96 w-full">
                <Image
                  src={featuredPost.image || '/images/placeholder.svg'}
                  alt={featuredPost.imageAlt || featuredPost.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <span className="inline-block px-3 py-1 bg-blue-600 text-xs font-semibold rounded-full mb-3">
                    {featuredPost.category || 'Technology'}
                  </span>
                  <h1 className="text-3xl font-bold mb-2">{featuredPost.title}</h1>
                  <p className="text-gray-200 mb-3">{featuredPost.subtitle}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <time>{new Date(featuredPost.date).toLocaleDateString()}</time>
                    <span>•</span>
                    <span>{featuredPost.readingTime}</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </div>
      )}

      {/* Ad Slot */}
      <AdSlot id="home-top" className="mb-8" />

      {/* Recent Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentPosts.map((post) => (
          <Link key={post.slug} href={`/posts/${post.slug}`}>
            <article className="card-hover cursor-pointer h-full bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-48 w-full">
                <Image
                  src={post.image || '/images/placeholder.svg'}
                  alt={post.imageAlt || post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <span className="inline-block px-2 py-1 bg-gray-100 text-xs font-medium rounded mb-2">
                  {post.category || 'Technology'}
                </span>
                <h2 className="font-semibold text-lg mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {post.subtitle || post.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <time>{new Date(post.date).toLocaleDateString()}</time>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {posts.length > 13 && (
        <div className="mt-12 text-center">
          <Link
            href="/archive"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            View All Articles
          </Link>
        </div>
      )}

      {/* Bottom Ad */}
      <AdSlot id="home-bottom" className="mt-12" />
    </div>
  )
}