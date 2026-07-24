import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsroomProfilePage from '@/components/newsroom/NewsroomProfilePage';
import { newsroomProfiles } from '@/lib/newsroom';

export function generateStaticParams() {
  return Object.keys(newsroomProfiles).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = newsroomProfiles[slug];
  if (!profile) return { title: 'Author Not Found' };

  return {
    title: `${profile.name}, ${profile.role}`,
    description: profile.shortBio,
    alternates: { canonical: `/author/${profile.id}` },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!newsroomProfiles[slug]) notFound();
  return <NewsroomProfilePage slug={slug} />;
}
