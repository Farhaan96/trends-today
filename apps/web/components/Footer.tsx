import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Trends Today</h3>
            <p className="text-gray-600 text-sm">
              Your daily source for technology news, reviews, and insights.
              Covering AI, gadgets, science, and innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap.xml"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/category/ai"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link
                  href="/category/gadgets"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Gadgets & Hardware
                </Link>
              </li>
              <li>
                <Link
                  href="/category/science"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Science & Research
                </Link>
              </li>
              <li>
                <Link
                  href="/category/space"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Space & Exploration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Trends Today. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
