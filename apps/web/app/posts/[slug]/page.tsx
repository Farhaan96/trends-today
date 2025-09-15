import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPostBySlug, getAllPosts } from '../../../lib/mdx';
import AdSlot from '../../../components/AdSlot';
import ShareButtons from '../../../components/ShareButtons';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author || 'Trends Today Team'],
      images: [
        {
          url: post.image || '/images/placeholder.svg',
          width: 1200,
          height: 630,
          alt: post.imageAlt || post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.image || '/images/placeholder.svg'],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category)
  const allPosts = await getAllPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-4">
          <Link
            href={`/category/${post.category?.toLowerCase()}`}
            className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
          >
            {post.category || 'Technology'}
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        {post.subtitle && (
          <p className="text-xl text-gray-600 mb-6">{post.subtitle}</p>
        )}

        <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>{post.author || 'Trends Today Team'}</span>
            <span>•</span>
            <time>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>•</span>
            <span>{post.readingTime}</span>
          </div>
          <ShareButtons url={`/posts/${post.slug}`} title={post.title} />
        </div>
      </header>

      {/* Hero Image */}
      {post.image && (
        <div className="relative h-96 w-full mb-8 rounded-xl overflow-hidden">
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            className="object-cover"
            priority
          />
          {post.imageAttribution && (
            <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
              {post.imageAttribution}
            </div>
          )}
        </div>
      )}

      {/* Ad Slot - Top */}
      <AdSlot id="article-top" className="mb-8" />

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        <MDXRemote source={post.content} />
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">Tags:</span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag.toLowerCase()}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ad Slot - Bottom */}
      <AdSlot id="article-bottom" className="mt-8" />

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link key={related.slug} href={`/posts/${related.slug}`}>
                <article className="card-hover cursor-pointer">
                  <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={related.image || '/images/placeholder.svg'}
                      alt={related.imageAlt || related.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {related.readingTime}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>
    </article>
  );
}
