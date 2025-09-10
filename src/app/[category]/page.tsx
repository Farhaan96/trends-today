import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles } from '@/lib/article-utils';

const categories = {
  science: {
    name: 'Science',
    description: 'Explore the latest scientific discoveries, research breakthroughs, and innovations shaping our understanding of the universe.',
    color: 'from-blue-500 to-indigo-600'
  },
  culture: {
    name: 'Culture', 
    description: 'Dive into cultural phenomena, social trends, arts, and the forces shaping modern society.',
    color: 'from-purple-500 to-pink-600'
  },
  psychology: {
    name: 'Psychology',
    description: 'Understand the human mind, behavior patterns, mental health, and the science of well-being.',
    color: 'from-green-500 to-teal-600'
  },
  technology: {
    name: 'Technology',
    description: 'Stay updated with the latest in tech, AI, gadgets, software, and digital innovation.',
    color: 'from-orange-500 to-red-600'
  },
  health: {
    name: 'Health',
    description: 'Discover wellness tips, medical breakthroughs, fitness trends, and holistic health insights.',
    color: 'from-cyan-500 to-blue-600'
  },
  mystery: {
    name: 'Mystery',
    description: 'Uncover unexplained phenomena, historical enigmas, and fascinating mysteries from around the world.',
    color: 'from-violet-500 to-purple-600'
  }
};

export async function generateStaticParams() {
  return Object.keys(categories).map((category) => ({
    category: category,
  }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const category = categories[params.category as keyof typeof categories];
  
  if (!category) {
    return {
      title: 'Category Not Found | Trends Today',
      description: 'The category you are looking for does not exist.'
    };
  }

  return {
    title: `${category.name} Articles | Trends Today`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Trends Today`,
      description: category.description,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categoryKey = params.category as keyof typeof categories;
  const category = categories[categoryKey];
  
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Get articles for this category
  const allArticles = await getAllArticles();
  const categoryArticles = allArticles.filter(article => 
    article.category?.toLowerCase() === categoryKey || 
    article.frontmatter?.category?.toLowerCase() === categoryKey
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className={`bg-gradient-to-r ${category.color} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">{category.name}</h1>
          <p className="text-xl opacity-90 max-w-3xl">{category.description}</p>
          <div className="mt-6">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              {categoryArticles.length} article{categoryArticles.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {categoryArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-8">No articles in this category yet.</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Browse all articles
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryArticles.map((article) => (
              <article key={article.slug} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <Link href={`/${categoryKey}/${article.slug}`}>
                  <div className="relative h-48">
                    <Image
                      src={article.image || article.frontmatter?.image || '/images/placeholder.jpg'}
                      alt={article.title || article.frontmatter?.title || 'Article'}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute top-4 left-4 bg-gradient-to-r ${category.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                      {category.name}
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                      {article.title || article.frontmatter?.title}
                    </h2>
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {article.description || article.frontmatter?.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{article.author?.name || article.frontmatter?.author?.name || 'Trends Today'}</span>
                      <span>{new Date(article.publishedAt || article.frontmatter?.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}