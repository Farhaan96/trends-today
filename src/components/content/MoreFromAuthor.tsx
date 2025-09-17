import Link from 'next/link';
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/24/outline';
import authorsData from '../../../data/authors.json';

interface Author {
  id?: string;
  name: string;
  title?: string;
  bio?: string;
}

interface Article {
  title: string;
  description: string;
  href: string;
  publishedAt: string;
  image?: string;
  category: string;
  readingTime: string | number;
}

interface MoreFromAuthorProps {
  author: Author | string;
  articles?: Article[];
}

export default function MoreFromAuthor({
  author,
  articles = [],
}: MoreFromAuthorProps) {
  const authorName = typeof author === 'string' ? author : author.name;
  const authorId =
    typeof author === 'object' && author.id
      ? author.id
      : authorName.toLowerCase().replace(/\s+/g, '-');

  // Get author data from JSON for profile image
  const authors = authorsData as Record<string, any>;
  const authorData = authors[authorId];

  // For now, show a simple placeholder until we implement proper article fetching
  const sampleArticles: Article[] = [
    {
      title: `Recent article by ${authorName}`,
      description: `Another insightful piece from ${authorName} on cutting-edge technology trends.`,
      href: '#',
      publishedAt: '2025-09-15',
      category: 'technology',
      readingTime: '3 min read',
    },
    {
      title: `${authorName}'s latest research`,
      description: `Deep dive analysis by ${authorName} on emerging tech developments.`,
      href: '#',
      publishedAt: '2025-09-10',
      category: 'science',
      readingTime: '4 min read',
    },
  ];

  const displayArticles =
    articles.length > 0 ? articles.slice(0, 3) : sampleArticles;

  return (
    <section className="bg-white border border-gray-100 rounded-xl p-8 my-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
          {authorData?.avatar ? (
            <Image
              src={authorData.avatar}
              alt={authorName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            More from {authorName}
          </h3>
          <p className="text-gray-600">
            Discover more insights from this author
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayArticles.map((article, index) => (
          <Link key={index} href={article.href} className="group space-y-4">
            {article.image && (
              <div className="relative w-full aspect-square bg-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover rounded-xl transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight break-words line-clamp-2">
                {article.title}
              </h4>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wide rounded-full">
                  {article.category}
                </span>
                <span>•</span>
                <span className="text-xs">
                  {typeof article.readingTime === 'string' &&
                  article.readingTime.includes('min read')
                    ? article.readingTime
                    : `${article.readingTime} min read`}
                </span>
              </div>

              {article.description && (
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                  {article.description}
                </p>
              )}

              <div className="text-sm text-gray-500">
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {authorId && authorId !== 'trends-today-editorial' && (
        <div className="mt-8 text-center">
          <Link
            href={`/author/${authorId}`}
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm"
          >
            View all articles by {authorName} →
          </Link>
        </div>
      )}
    </section>
  );
}
