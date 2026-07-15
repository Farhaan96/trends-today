import type { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import { getAllBaseSchemas } from '@/lib/schema';
import { getAllPosts } from '@/lib/content';
import EditorialArticleList from '@/components/editorial/EditorialArticleList';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const posts = await getAllPosts();
  const initialPosts = posts.slice(0, 9); // Show first 9 articles initially

  return (
    <div className="site-page">
      <StructuredData data={getAllBaseSchemas()} />
      <section className="site-shell home-shell">
        <EditorialArticleList
          initialArticles={initialPosts}
          allArticles={posts}
        />
      </section>
    </div>
  );
}
