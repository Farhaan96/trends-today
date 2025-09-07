import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { Metadata } from 'next';

interface Review {
  slug: string;
  frontmatter: any;
}

// Get all review articles
async function getAllReviews(): Promise<Review[]> {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'reviews');
    
    if (!fs.existsSync(contentDir)) {
      return [];
    }
    
    const files = fs.readdirSync(contentDir);
    const reviews = files
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
      .filter(review => review.frontmatter.title) // Only include reviews with titles
      .sort((a, b) => new Date(b.frontmatter.publishedAt).getTime() - new Date(a.frontmatter.publishedAt).getTime()); // Sort by date
    
    return reviews;
  } catch (error) {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Tech Reviews | Trends Today',
  description: 'In-depth reviews of the latest smartphones, laptops, gadgets, and tech products. Expert analysis, ratings, and buying recommendations.',
  keywords: 'tech reviews, smartphone reviews, laptop reviews, gadget reviews, product reviews',
};

export default async function ReviewsPage() {
  const reviews = await getAllReviews();
  
  // Group reviews by category
  const reviewsByCategory = reviews.reduce((acc, review) => {
    const category = review.frontmatter.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(review);
    return acc;
  }, {} as Record<string, Review[]>);
  
  const categories = Object.keys(reviewsByCategory);
  const featuredReviews = reviews.filter(review => review.frontmatter.featured);
  const recentReviews = reviews.slice(0, 6);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Tech Reviews
        </h1>
        <p className="text-xl text-gray-800 max-w-3xl mx-auto">
          Expert reviews and analysis of the latest technology products. 
          We test everything so you can make informed decisions.
        </p>
      </header>

      {/* Featured Reviews */}
      {featuredReviews.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Reviews</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredReviews.slice(0, 3).map((review) => (
              <article key={review.slug} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {review.frontmatter.image && (
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={review.frontmatter.image}
                      alt={review.frontmatter.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      ⭐ Featured
                    </span>
                    {review.frontmatter.rating && (
                      <span className="text-yellow-500 font-bold">
                        {review.frontmatter.rating}/10
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <Link href={`/reviews/${review.slug}`} className="hover:text-blue-600">
                      {review.frontmatter.title}
                    </Link>
                  </h3>
                  <p className="text-gray-800 mb-4">
                    {review.frontmatter.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>{review.frontmatter.category}</span>
                    <time dateTime={review.frontmatter.publishedAt}>
                      {new Date(review.frontmatter.publishedAt).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Recent Reviews */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Reviews</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentReviews.map((review) => (
            <article key={review.slug} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {review.frontmatter.image && (
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={review.frontmatter.image}
                    alt={review.frontmatter.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
                    {review.frontmatter.category || 'Review'}
                  </span>
                  {review.frontmatter.rating && (
                    <span className="text-yellow-500 font-bold">
                      ★ {review.frontmatter.rating}/10
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  <Link href={`/reviews/${review.slug}`} className="hover:text-blue-600">
                    {review.frontmatter.title}
                  </Link>
                </h3>
                <p className="text-gray-800 mb-4">
                  {review.frontmatter.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>{(typeof review.frontmatter.author === 'string' ? review.frontmatter.author : review.frontmatter.author?.name) || 'Editorial Team'}</span>
                  <time dateTime={review.frontmatter.publishedAt}>
                    {new Date(review.frontmatter.publishedAt).toLocaleDateString()}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Reviews by Category */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                {category} Reviews ({reviewsByCategory[category].length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {reviewsByCategory[category].slice(0, 4).map((review) => (
                  <article key={review.slug} className="flex gap-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    {review.frontmatter.image && (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={review.frontmatter.image}
                          alt={review.frontmatter.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1">
                        <Link href={`/reviews/${review.slug}`} className="hover:text-blue-600">
                          {review.frontmatter.title}
                        </Link>
                      </h4>
                      <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                        {review.frontmatter.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        {review.frontmatter.rating && (
                          <span className="text-yellow-500">★ {review.frontmatter.rating}/10</span>
                        )}
                        <time dateTime={review.frontmatter.publishedAt}>
                          {new Date(review.frontmatter.publishedAt).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-50 rounded-lg p-8 text-center">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-blue-600">{reviews.length}+</div>
            <div className="text-gray-800">Expert Reviews</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">{categories.length}</div>
            <div className="text-gray-800">Product Categories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-gray-800">Unbiased Testing</div>
          </div>
        </div>
      </section>
    </main>
  );
}