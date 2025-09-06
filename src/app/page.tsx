import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="bg-gray-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Stay Ahead of the Latest
            <span className="text-blue-600"> Tech Trends</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            In-depth reviews, unbiased comparisons, and comprehensive buying guides 
            covering the latest trends in technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/reviews" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Reviews
              <ArrowRightIcon className="ml-2 -mr-1 w-5 h-5" />
            </Link>
            <Link 
              href="/buying-guides" 
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Buying Guides
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Reviews</h3>
            <p className="text-gray-600 mb-4">
              Hands-on testing and detailed analysis of the newest tech products
            </p>
            <Link href="/reviews" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Reviews →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Comparisons</h3>
            <p className="text-gray-600 mb-4">
              Side-by-side analysis to help you choose between competing products
            </p>
            <Link href="/comparisons" className="text-blue-600 hover:text-blue-700 font-medium">
              View Comparisons →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tech News</h3>
            <p className="text-gray-600 mb-4">
              Stay updated with the latest developments in technology
            </p>
            <Link href="/news" className="text-blue-600 hover:text-blue-700 font-medium">
              Read News →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Why Trust Trends Today?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Evidence-Based Testing</h3>
              <p className="text-blue-100">
                Every review includes real-world testing data and methodology transparency
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Independent Reviews</h3>
              <p className="text-blue-100">
                Unbiased analysis with clear disclosure of any affiliate relationships
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Expert Analysis</h3>
              <p className="text-blue-100">
                Written by tech experts with deep knowledge and hands-on experience
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
