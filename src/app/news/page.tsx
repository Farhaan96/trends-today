import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { Metadata } from 'next';

interface NewsArticle {
  slug: string;
  frontmatter: {
    title?: string;
    description?: string;
    publishedAt?: string;
    image?: string;
    category?: string;
    author?: {
      name?: string;
      avatar?: string;
    };
    [key: string]: any;
  };
}

// Get all news articles
async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'news');
    
    if (!fs.existsSync(contentDir)) {
      return [];
    }
    
    const files = fs.readdirSync(contentDir);
    const articles = files
      .filter(file => file.endsWith('.mdx'))
      .map(file => {
        const filePath = path.join(contentDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent);
        
        return {
          slug: file.replace('.mdx', ''),
          frontmatter: data
        };
      })
      .filter(article => article.frontmatter.title) // Only include articles with titles
      .sort((a, b) => {
        const dateA = a.frontmatter.publishedAt ? new Date(a.frontmatter.publishedAt).getTime() : 0;
        const dateB = b.frontmatter.publishedAt ? new Date(b.frontmatter.publishedAt).getTime() : 0;
        return dateB - dateA;
      }); // Sort by date
    
    return articles;
  } catch (_error) {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Tech News | Trends Today',
  description: 'Latest technology news, breaking tech announcements, product launches, and industry analysis. Stay updated with the tech world.',
  keywords: 'tech news, technology news, product launches, tech announcements, industry news',
};

export default async function NewsPage() {
  const articles = await getAllNews();
  
  const featuredArticles = articles.filter(article => article.frontmatter.featured);
  const recentArticles = articles.slice(0, 8);
  const breakingNews = articles.slice(0, 3);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Tech News
        </h1>
        <p className="text-xl text-gray-900 max-w-3xl mx-auto">
          Breaking news, product launches, and industry insights from the world of technology.
          Stay ahead with the latest developments.
        </p>
      </header>

      {/* Breaking News */}
      {breakingNews.length > 0 && (
        <section className="mb-12">
          <div className="bg-red-600 text-white px-4 py-2 rounded-t-lg">
            <h2 className="text-lg font-bold flex items-center">
              🚨 Breaking News
            </h2>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-b-lg p-6">
            <div className="space-y-4">
              {breakingNews.map((article) => (
                <article key={article.slug} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-3 flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      <Link href={`/news/${article.slug}`} className="hover:text-red-600">
                        {article.frontmatter.title}
                      </Link>
                    </h3>
                    <p className="text-gray-900 mb-2">
                      {article.frontmatter.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <time dateTime={article.frontmatter.publishedAt}>
                        {article.frontmatter.publishedAt ? new Date(article.frontmatter.publishedAt).toLocaleDateString() : 'Recently'}
                      </time>
                      <span>•</span>
                      <span>{(typeof article.frontmatter.author === 'string' ? article.frontmatter.author : article.frontmatter.author?.name) || 'Editorial Team'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.slice(0, 3).map((article) => (
              <article key={article.slug} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {article.frontmatter.image && (
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={article.frontmatter.image}
                      alt={article.frontmatter.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      Featured
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      News
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <Link href={`/news/${article.slug}`} className="hover:text-blue-600">
                      {article.frontmatter.title}
                    </Link>
                  </h3>
                  <p className="text-gray-900 mb-4">
                    {article.frontmatter.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-900">
                    <span>{(typeof article.frontmatter.author === 'string' ? article.frontmatter.author : article.frontmatter.author?.name) || 'Editorial Team'}</span>
                    <time dateTime={article.frontmatter.publishedAt}>
                      {article.frontmatter.publishedAt ? new Date(article.frontmatter.publishedAt).toLocaleDateString() : 'Recently'}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Latest News */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest News</h2>
        <div className="space-y-6">
          {recentArticles.map((article, index) => (
            <article key={article.slug} className={`flex gap-6 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} rounded-lg p-6 hover:shadow-md transition-shadow`}>
              {article.frontmatter.image && (
                <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={article.frontmatter.image}
                    alt={article.frontmatter.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    {article.frontmatter.category || 'News'}
                  </span>
                  <time className="text-sm text-gray-900" dateTime={article.frontmatter.publishedAt}>
                    {article.frontmatter.publishedAt ? new Date(article.frontmatter.publishedAt).toLocaleDateString() : 'Recently'}
                  </time>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  <Link href={`/news/${article.slug}`} className="hover:text-blue-600">
                    {article.frontmatter.title}
                  </Link>
                </h3>
                <p className="text-gray-900 mb-4 line-clamp-3">
                  {article.frontmatter.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">
                    By {(typeof article.frontmatter.author === 'string' ? article.frontmatter.author : article.frontmatter.author?.name) || 'Editorial Team'}
                  </span>
                  <Link 
                    href={`/news/${article.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-blue-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Never Miss a Story</h2>
        <p className="text-blue-200 mb-6">
          Get the latest tech news delivered to your inbox. Join 50,000+ readers.
        </p>
        <div className="flex max-w-md mx-auto gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg text-gray-900"
          />
          <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100">
            Subscribe
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-blue-600">{articles.length}+</div>
            <div className="text-gray-900">News Articles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">24/7</div>
            <div className="text-gray-900">Coverage</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">Breaking</div>
            <div className="text-gray-900">First Reports</div>
          </div>
        </div>
      </section>
    </main>
  );
}
