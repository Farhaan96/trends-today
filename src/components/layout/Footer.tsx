import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="text-2xl font-bold text-blue-400">
              Trends Today
            </Link>
            <p className="text-gray-300 text-base">
              Your trusted source for in-depth tech reviews, product comparisons, and comprehensive buying guides.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Content
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/reviews" className="text-base text-gray-300 hover:text-white">
                      Reviews
                    </Link>
                  </li>
                  <li>
                    <Link href="/comparisons" className="text-base text-gray-300 hover:text-white">
                      Comparisons
                    </Link>
                  </li>
                  <li>
                    <Link href="/buying-guides" className="text-base text-gray-300 hover:text-white">
                      Buying Guides
                    </Link>
                  </li>
                  <li>
                    <Link href="/news" className="text-base text-gray-300 hover:text-white">
                      News
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/about" className="text-base text-gray-300 hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/methodology" className="text-base text-gray-300 hover:text-white">
                      Testing Methodology
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-base text-gray-300 hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclosure" className="text-base text-gray-300 hover:text-white">
                      Affiliate Disclosure
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-300 xl:text-center">
            &copy; 2025 Trends Today. All rights reserved. 
            <span className="block mt-2 text-sm text-gray-400">
              Independent reviews • Evidence-based testing • Transparent recommendations
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}