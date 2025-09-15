import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/content';

interface Author {
  name: string;
  bio?: string;
  avatar?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface AuthorSectionProps {
  author: Author | string;
  currentArticle?: string;
  showMoreArticles?: boolean;
}

export async function getAuthorArticles(authorName: string, exclude?: string) {
  const posts = await getAllPosts();
  return posts
    .filter((post) => {
      const postAuthor =
        typeof post.frontmatter.author === 'string'
          ? post.frontmatter.author
          : post.frontmatter.author?.name;
      return postAuthor === authorName && post.href !== exclude;
    })
    .slice(0, 5); // Show max 5 other articles
}

export default async function AuthorSection({
  author,
  currentArticle,
  showMoreArticles = true,
}: AuthorSectionProps) {
  const authorData: Author =
    typeof author === 'string' ? { name: author } : author;

  const moreArticles = showMoreArticles
    ? await getAuthorArticles(authorData.name, currentArticle)
    : [];

  return (
    <div className="my-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start space-x-4">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          {authorData.avatar ? (
            <Image
              src={authorData.avatar}
              alt={authorData.name}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {authorData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            About {authorData.name}
          </h3>

          {authorData.bio && (
            <p className="text-gray-600 text-sm mb-3">{authorData.bio}</p>
          )}

          {/* Social Links */}
          {authorData.social && (
            <div className="flex space-x-3 mb-4">
              {authorData.social.linkedin && (
                <a
                  href={authorData.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
              {authorData.social.twitter && (
                <a
                  href={authorData.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-400 transition-colors"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
              )}
              {authorData.social.instagram && (
                <a
                  href={authorData.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* More Articles by Author */}
          {moreArticles.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                More from {authorData.name}:
              </h4>
              <ul className="space-y-2">
                {moreArticles.map((article, index) => (
                  <li key={index}>
                    <Link
                      href={article.href}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {article.frontmatter.title}
                    </Link>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(
                        article.frontmatter.publishedAt ||
                          article.frontmatter.datePublished ||
                          ''
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Link to Author Page */}
              <Link
                href={`/author/${authorData.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                View all articles by {authorData.name} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
