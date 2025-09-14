import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

interface Comparison {
  slug: string;
  frontmatter: Record<string, unknown>;
}

// Get all comparison articles
async function getAllComparisons(): Promise<Comparison[]> {
  try {
    const contentDirs = [
      path.join(process.cwd(), 'content', 'compare'),
      path.join(process.cwd(), 'content', 'comparisons')
    ];
    
    const comparisons: Comparison[] = [];
    
    for (const contentDir of contentDirs) {
      if (!fs.existsSync(contentDir)) continue;
      
      const files = fs.readdirSync(contentDir);
      const dirComparisons = files
        .filter(file => file.endsWith('.mdx'))
        .map(file => {
          const filePath = path.join(contentDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const { data } = matter(fileContent);
          
          return {
            slug: file.replace('.mdx', ''),
            frontmatter: data
          };
        });
      
      comparisons.push(...dirComparisons);
    }
    
    return comparisons
      .filter(comparison => comparison.frontmatter.title) // Only include comparisons with titles
      .sort((a, b) => new Date(b.frontmatter.publishedAt).getTime() - new Date(a.frontmatter.publishedAt).getTime()); // Sort by date
    
  } catch (_error) {
    return [];
  }
}

// Popular comparison categories
const comparisonCategories = [
  {
    title: 'iPhone vs Samsung',
    description: 'Apple and Samsung flagship comparisons',
    icon: '📱',
    examples: ['iPhone 15 Pro vs Galaxy S24 Ultra', 'iPhone vs Galaxy comparison'],
    color: 'bg-blue-500'
  },
  {
    title: 'Laptop Comparisons',
    description: 'MacBook vs Windows laptop comparisons',
    icon: '💻',
    examples: ['MacBook Air vs Dell XPS', 'Gaming laptop comparisons'],
    color: 'bg-green-500'
  },
  {
    title: 'Streaming Services',
    description: 'Netflix, Disney+, HBO Max comparisons',
    icon: '📺',
    examples: ['Netflix vs Disney+', 'Streaming service guide'],
    color: 'bg-red-500'
  },
  {
    title: 'Gaming Consoles',
    description: 'PlayStation vs Xbox vs Nintendo',
    icon: '🎮',
    examples: ['PS5 vs Xbox Series X', 'Console buying guide'],
    color: 'bg-purple-500'
  },
  {
    title: 'Audio Gear',
    description: 'Headphones, speakers, and earbuds',
    icon: '🎧',
    examples: ['AirPods vs Sony WH-1000XM5', 'Best wireless earbuds'],
    color: 'bg-yellow-500'
  },
  {
    title: 'Smart Home',
    description: 'Alexa vs Google vs Apple HomeKit',
    icon: '🏠',
    examples: ['Echo vs Google Nest', 'Smart home ecosystems'],
    color: 'bg-orange-500'
  }
];

export const metadata: Metadata = {
  title: 'Product Comparisons | Trends Today',
  description: 'In-depth product comparisons to help you choose the right tech. Compare specs, features, prices, and performance.',
  keywords: 'product comparison, tech comparison, iPhone vs Samsung, laptop comparison, gadget comparison',
};

export default async function ComparePage() {
  const comparisons = await getAllComparisons();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Product Comparisons
        </h1>
        <p className="text-xl text-gray-900 max-w-3xl mx-auto">
          Make informed decisions with our detailed product comparisons. 
          We break down specs, features, and value to help you choose the perfect tech.
        </p>
      </header>

      {/* Comparison Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Comparisons</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparisonCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300">
              <div className={`${category.color} h-20 rounded-t-xl flex items-center justify-center`}>
                <span className="text-3xl">{category.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-900 mb-4">
                  {category.description}
                </p>
                <div className="space-y-1">
                  {category.examples.map((example, idx) => (
                    <div key={idx} className="text-sm text-gray-900 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Comparisons */}
      {comparisons.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Comparisons</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comparisons.map((comparison) => (
              <article key={comparison.slug} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {comparison.frontmatter.image && (
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <Image
                      src={comparison.frontmatter.image as string}
                      alt={comparison.frontmatter.title as string}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                      Comparison
                    </span>
                    <span className="text-sm text-gray-900">
                      {comparison.frontmatter.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <Link href={`/compare/${comparison.slug}`} className="hover:text-blue-600">
                      {comparison.frontmatter.title}
                    </Link>
                  </h3>
                  <p className="text-gray-900 mb-4">
                    {comparison.frontmatter.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-900">
                    <span>Updated {new Date(comparison.frontmatter.publishedAt).toLocaleDateString()}</span>
                    <span>📊 Detailed specs</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Comparison Tool CTA */}
      <section className="mb-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Can&apos;t Find What You&apos;re Looking For?</h2>
        <p className="text-xl text-blue-200 mb-6">
          Request a custom comparison and we&apos;ll create it for you
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
          Request Comparison
        </button>
      </section>

      {/* How We Compare */}
      <section className="mb-16 bg-gray-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Comparison Process</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Spec Analysis</h3>
            <p className="text-gray-900 text-sm">
              Detailed breakdown of technical specifications
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Performance</h3>
            <p className="text-gray-900 text-sm">
              Real-world testing and benchmark results
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Value</h3>
            <p className="text-gray-900 text-sm">
              Price-to-performance analysis
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Winner</h3>
            <p className="text-gray-900 text-sm">
              Clear recommendation for different use cases
            </p>
          </div>
        </div>
      </section>

      {/* Popular Comparisons List */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Most Popular Comparisons</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'iPhone 15 Pro vs Samsung Galaxy S24 Ultra',
            'MacBook Air M2 vs Dell XPS 13',
            'PlayStation 5 vs Xbox Series X',
            'AirPods Pro vs Sony WH-1000XM5',
            'iPad Pro vs Microsoft Surface Pro',
            'Google Pixel 8 Pro vs iPhone 15 Pro',
            'Nintendo Switch vs Steam Deck',
            'MacBook Pro vs ThinkPad X1 Carbon'
          ].map((comparison, index) => (
            <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{comparison}</span>
                <Link href={`/compare/${comparison.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-600 hover:text-blue-800">
                  Compare →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold text-blue-600">{comparisons.length || 50}+</div>
            <div className="text-gray-900">Detailed Comparisons</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">100+</div>
            <div className="text-gray-900">Products Analyzed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-gray-900">Spec Categories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">Weekly</div>
            <div className="text-gray-900">New Comparisons</div>
          </div>
        </div>
      </section>
    </main>
  );
}
