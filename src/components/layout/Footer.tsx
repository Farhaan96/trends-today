import Link from 'next/link';
import TrustBadges from '@/components/ui/TrustBadges';
import NewsletterSignup from '@/components/newsletter/NewsletterSignup';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        {/* Newsletter Section */}
        <div className="mb-12">
          <NewsletterSignup 
            variant="footer" 
            showLeadMagnet={true}
            leadMagnetTitle="Weekly Tech Digest"
            leadMagnetDescription="Get the latest reviews, comparisons, and deal alerts delivered to your inbox"
          />
        </div>

        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="text-2xl font-bold text-blue-400">
              Trends Today
            </Link>
            <p className="text-gray-300 text-base">
              Your trusted source for in-depth tech reviews, product comparisons, and comprehensive buying guides.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="https://twitter.com/trendstoday" className="text-gray-900 hover:text-blue-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://facebook.com/trendstoday" className="text-gray-900 hover:text-blue-600 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@trendstoday" className="text-gray-900 hover:text-red-500 transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://linkedin.com/company/trends-today" className="text-gray-900 hover:text-blue-700 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-3 md:gap-8">
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
                  Trust & Transparency
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/authors" className="text-base text-gray-300 hover:text-white">
                      Our Expert Team
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-we-test" className="text-base text-gray-300 hover:text-white">
                      How We Test
                    </Link>
                  </li>
                  <li>
                    <Link href="/editorial-standards" className="text-base text-gray-300 hover:text-white">
                      Editorial Standards
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/affiliate-disclosure" className="text-base text-gray-300 hover:text-white">
                      Affiliate Disclosure
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Premium & Services
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/subscribe" className="text-base text-purple-300 hover:text-white font-medium">
                      Trends Today Pro ✨
                    </Link>
                  </li>
                  <li>
                    <Link href="/deals" className="text-base text-gray-300 hover:text-white">
                      Deal Alerts
                    </Link>
                  </li>
                  <li>
                    <Link href="/newsletter" className="text-base text-gray-300 hover:text-white">
                      Newsletter
                    </Link>
                  </li>
                  <li>
                    <Link href="/revenue-dashboard" className="text-base text-gray-300 hover:text-white">
                      Revenue Transparency
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust Badges Section */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <h3 className="text-lg font-semibold text-white mb-6 text-center">Why Trust Trends Today?</h3>
          <div className="mb-8">
            <TrustBadges variant="horizontal" showAll={false} />
          </div>
        </div>
        
        {/* Affiliate Disclosure Section */}
        <div className="border-t border-gray-700 pt-6 pb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-500 text-lg">⚠️</div>
              <div className="text-sm text-gray-300">
                <strong className="text-white">Affiliate Disclosure:</strong> Trends Today participates in various affiliate marketing programs. 
                We may earn commissions from purchases made through links on our site at no additional cost to you. 
                This helps support our independent testing and reviews. 
                <Link href="/affiliate-disclosure" className="text-blue-400 hover:text-blue-300 underline">
                  Full disclosure policy
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="text-center lg:text-left">
              <p className="text-base text-gray-300">
                &copy; 2025 Trends Today. All rights reserved.
              </p>
              <p className="text-sm text-gray-900 mt-1">
                Independent tech reviews • Transparent monetization • Reader-first approach
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-4 text-sm text-gray-900">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Independent Reviews
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Professional Testing
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Expert Analysis
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Transparent Monetization
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}