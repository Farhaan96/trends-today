import StructuredData from '@/components/seo/StructuredData';
import { getAllBaseSchemas } from '@/lib/schema';
import { getAllPosts } from '@/lib/content';
import ArticleList from '@/components/home/ArticleList';

export default async function HomePage() {
  const posts = await getAllPosts();
  const initialPosts = posts.slice(0, 9); // Show first 9 articles initially

  return (
    <main className="bg-white min-h-screen">
      <h1 className="sr-only">Trends Today - Latest Articles</h1>
      <StructuredData data={getAllBaseSchemas()} />

      {/* Leravi-style Layout */}
      <section className="max-w-6xl mx-auto px-6 py-8 md:py-32">
        <ArticleList initialArticles={initialPosts} allArticles={posts} />
      </section>
    </main>
  );
}