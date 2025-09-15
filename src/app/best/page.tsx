import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

interface BestGuide {
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

// Get all buying guides
async function getAllGuides(): Promise<BestGuide[]> {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'best');

    if (!fs.existsSync(contentDir)) {
      return [];
    }

    const files = fs.readdirSync(contentDir);
    const guides = files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => {
        const filePath = path.join(contentDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent);

        return {
          slug: file.replace('.mdx', ''),
          frontmatter: data,
        };
      })
      .filter((guide) => guide.frontmatter.title) // Only include guides with titles
      .sort((a, b) => {
        const dateA = a.frontmatter.publishedAt
          ? new Date(a.frontmatter.publishedAt).getTime()
          : 0;
        const dateB = b.frontmatter.publishedAt
          ? new Date(b.frontmatter.publishedAt).getTime()
          : 0;
        return dateB - dateA;
      }); // Sort by date

    return guides;
  } catch (_error) {
    return [];
  }
}

// Mock data for popular categories
const popularCategories = [
  {
    title: 'Best Smartphones 2025',
    description: 'Top-rated phones across all budgets',
    icon: '📱',
    color: 'bg-blue-500',
  },
  {
    title: 'Best Laptops 2025',
    description: 'Premium and budget laptop recommendations',
    icon: '💻',
    color: 'bg-green-500',
  },
  {
    title: 'Best Headphones 2025',
    description: 'Wireless, wired, and gaming headphones',
    icon: '🎧',
    color: 'bg-purple-500',
  },
  {
    title: 'Best Smart Home 2025',
    description: 'Speakers, displays, and automation',
    icon: '🏠',
    color: 'bg-orange-500',
  },
  {
    title: 'Best Gaming Gear 2025',
    description: 'PCs, consoles, and accessories',
    icon: '🎮',
    color: 'bg-red-500',
  },
  {
    title: 'Best Cameras 2025',
    description: 'DSLR, mirrorless, and action cameras',
    icon: '📸',
    color: 'bg-pink-500',
  },
];

export const metadata: Metadata = {
  title: 'Best Tech Products 2025 | Buying Guides | Trends Today',
  description:
    'Expert buying guides and recommendations for the best tech products in 2025. Find the perfect smartphone, laptop, headphones, and more.',
  keywords:
    'best tech 2025, buying guides, product recommendations, best smartphones, best laptops',
};

export default async function BestPage() {
  const guides = await getAllGuides();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Best Tech Products 2025
        </h1>
        <p className="text-xl text-gray-900 max-w-3xl mx-auto">
          Discover the best technology products across every category. Our
          expert recommendations help you choose the right tech for your needs
          and budget.
        </p>
      </header>

      {/* Popular Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Popular Categories
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCategories.map((category, index) => (
            <Link
              key={index}
              href={`/best/${category.title.toLowerCase().replace(/\s+/g, '-').replace('2025', '').slice(0, -1)}`}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div
                  className={`${category.color} h-24 rounded-t-xl flex items-center justify-center`}
                >
                  <span className="text-4xl">{category.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                    {category.title}
                  </h3>
                  <p className="text-gray-900">{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Guides */}
      {guides.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Latest Buying Guides
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <article
                key={guide.slug}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                {guide.frontmatter.image && (
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <Image
                      src={guide.frontmatter.image as string}
                      alt={guide.frontmatter.title as string}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Buying Guide
                    </span>
                    <span className="text-sm text-gray-900">
                      {guide.frontmatter.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <Link
                      href={`/best/${guide.slug}`}
                      className="hover:text-blue-600"
                    >
                      {guide.frontmatter.title}
                    </Link>
                  </h3>
                  <p className="text-gray-900 mb-4">
                    {guide.frontmatter.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-900">
                    <span>
                      Updated{' '}
                      {guide.frontmatter.publishedAt
                        ? new Date(
                            guide.frontmatter.publishedAt
                          ).toLocaleDateString()
                        : 'Recently'}
                    </span>
                    <span>💰 Budget options included</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* How We Choose */}
      <section className="mb-16 bg-gray-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          How We Choose the Best
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧪</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Extensive Testing
            </h3>
            <p className="text-gray-900">
              We personally test every product for weeks, running real-world
              scenarios and benchmarks.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Value Analysis
            </h3>
            <p className="text-gray-900">
              We evaluate price-to-performance ratio and recommend options for
              every budget.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Regular Updates
            </h3>
            <p className="text-gray-900">
              Our guides are continuously updated as new products launch and
              prices change.
            </p>
          </div>
        </div>
      </section>

      {/* Budget Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Shop by Budget
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Under $100
            </h3>
            <p className="text-green-700 mb-4">
              Budget-friendly options that don&apos;t compromise on quality
            </p>
            <Link
              href="/best/budget"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              View Budget Picks →
            </Link>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">
              $100 - $500
            </h3>
            <p className="text-blue-700 mb-4">
              Mid-range products with the best value proposition
            </p>
            <Link
              href="/best/mid-range"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Mid-Range →
            </Link>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-purple-800 mb-2">$500+</h3>
            <p className="text-purple-700 mb-4">
              Premium products for enthusiasts and professionals
            </p>
            <Link
              href="/best/premium"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              View Premium →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-blue-600 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Why Trust Our Recommendations?
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-blue-200">Products Tested</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">8+</div>
            <div className="text-blue-200">Years Experience</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-blue-200">Unbiased Reviews</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50K+</div>
            <div className="text-blue-200">Happy Readers</div>
          </div>
        </div>
      </section>
    </main>
  );
}
