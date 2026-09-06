import type { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import { getAllBaseSchemas } from '@/lib/schema';
import { getAllPosts } from '@/lib/content';
import CinematicHome from '@/components/editorial/CinematicHome';
import { isLocalNewsCategory } from '@/lib/categories';

export const revalidate = 900;

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const posts = await getAllPosts();
  const stories = posts
    .filter((post) =>
      isLocalNewsCategory(post.category || post.frontmatter.category)
    )
    .map((post) => ({
      href: post.href,
      category: post.category || post.frontmatter.category,
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      image: post.frontmatter.image,
      imageAlt: post.frontmatter.imageAlt,
      imageAttribution: post.frontmatter.imageAttribution,
      publishedAt:
        post.frontmatter.publishedAt || post.frontmatter.datePublished,
      eventEndDate: post.frontmatter.eventEndDate,
      locality: post.frontmatter.locality,
      city: post.frontmatter.city,
    }));

  return (
    <div className="site-page">
      <StructuredData data={getAllBaseSchemas()} />
      <CinematicHome stories={stories} asOf={new Date().toISOString()} />
    </div>
  );
}
