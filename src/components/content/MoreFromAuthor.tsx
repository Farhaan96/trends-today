import Link from 'next/link';
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/24/outline';

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
  const authorId = typeof author === 'object' && author.id
    ? author.id
    : authorName.toLowerCase().replace(/\s+/g, '-');

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

  const displayArticles = articles.length > 0 ? articles.slice(0, 3) : sampleArticles;

  return (
    <section className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 my-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            More from {authorName}
          </h3>
          <p className="text-sm text-gray-600">
            Discover more insights from this author
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayArticles.map((article, index) => (
          <Link
            key={index}
            href={article.href}
            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            {article.image && (
              <div className="relative h-32 bg-gray-100">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wide rounded-full">
                  {article.category}
                </span>
                <span className="text-xs text-gray-500">
                  {typeof article.readingTime === 'string' && article.readingTime.includes('min read')
                    ? article.readingTime
                    : `${article.readingTime} min read`}
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {article.title}
              </h4>

              {article.description && (
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {article.description}
                </p>
              )}

              <div className="mt-3 text-xs text-gray-500">
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
        <div className="mt-6 text-center">
          <Link
            href={`/author/${authorId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View all articles by {authorName} →
          </Link>
        </div>
      )}
    </section>
  );
}