import Link from 'next/link';
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/24/outline';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
  currentArticleSlug: string;
  maxArticles?: number;
}

async function getAuthorArticles(
  authorName: string,
  currentArticleSlug: string,
  maxArticles: number = 3
): Promise<Article[]> {
  const articles: Article[] = [];

  // Define content directories to search
  const contentDirs = [
    path.join(process.cwd(), 'content', 'news'),
    path.join(process.cwd(), 'content', 'reviews'),
    path.join(process.cwd(), 'content', 'science'),
    path.join(process.cwd(), 'content', 'technology'),
    path.join(process.cwd(), 'content', 'space'),
    path.join(process.cwd(), 'content', 'health'),
    path.join(process.cwd(), 'content', 'psychology'),
    path.join(process.cwd(), 'content', 'culture'),
  ];

  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    const category = path.basename(dir);

    for (const file of files) {
      if (!file.endsWith('.mdx')) continue;

      const slug = file.replace('.mdx', '');
      if (slug === currentArticleSlug) continue; // Skip current article

      try {
        const filePath = path.join(dir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);

        // Check if this article is by the target author
        const articleAuthor = typeof frontmatter.author === 'string'
          ? frontmatter.author
          : frontmatter.author?.name;

        if (articleAuthor === authorName) {
          articles.push({
            title: frontmatter.title,
            description: frontmatter.description || frontmatter.summary || '',
            href: `/${category}/${slug}`,
            publishedAt: frontmatter.publishedAt || frontmatter.datePublished,
            image: frontmatter.image,
            category,
            readingTime: frontmatter.readingTime || '2',
          });
        }
      } catch (error) {
        // Skip files that can't be parsed
        continue;
      }
    }
  }

  // Sort by publish date (newest first) and limit results
  return articles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, maxArticles);
}

export default async function MoreFromAuthor({
  author,
  currentArticleSlug,
  maxArticles = 3,
}: MoreFromAuthorProps) {
  const authorName = typeof author === 'string' ? author : author.name;
  const authorId = typeof author === 'object' && author.id
    ? author.id
    : authorName.toLowerCase().replace(/\s+/g, '-');

  const articles = await getAuthorArticles(authorName, currentArticleSlug, maxArticles);

  if (articles.length === 0) {
    return null; // Don't render if no articles found
  }

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
        {articles.map((article, index) => (
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