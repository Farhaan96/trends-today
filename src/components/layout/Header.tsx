'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const primaryNavigation = [
    { name: 'REVIEWS', href: '/reviews' },
    { name: 'BUYING GUIDES', href: '/best' },
    { name: 'NEWS', href: '/news' },
    { name: 'VERSUS', href: '/compare' },
    { name: 'HOW TO', href: '/guides' }
  ];

  const categoryNavigation = [
    { name: 'Phones', href: '/reviews?category=smartphones' },
    { name: 'Laptops', href: '/reviews?category=laptops' },
    { name: 'Audio', href: '/reviews?category=headphones' },
    { name: 'Gaming', href: '/reviews?category=gaming' },
    { name: 'Smart Home', href: '/reviews?category=smart-home' }
  ];

  return (
    <header className="bg-white" style={{ fontFamily: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Top Brand Bar - TechRadar Style */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-xs font-bold uppercase tracking-wide">Tech News & Reviews</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-blue-300">Trending: iPhone 16 Pro, Galaxy S25, Vision Pro 2</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-xs">
            <Link href="/newsletter" className="text-gray-300 hover:text-white">Newsletter</Link>
            <span className="text-gray-500">|</span>
            <Link href="/about" className="text-gray-300 hover:text-white">About</Link>
            <span className="text-gray-500">|</span>
            <Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <nav className="bg-white border-b-2 border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* TechRadar-style Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-sm mr-2">
                    <span className="text-xl font-bold uppercase tracking-wide">T</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Trends</span>
                    <span className="text-2xl font-bold text-blue-600 uppercase tracking-tight">Today</span>
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold -mt-1">
                      Tech Reviews & News
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {primaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate-800 hover:text-blue-600 font-bold text-sm uppercase tracking-wide border-b-2 border-transparent hover:border-blue-600 pb-1 transition-all duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Search and Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* TechRadar-style Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search reviews, news..."
                    className="w-48 px-4 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="absolute right-2 top-2 text-gray-400 hover:text-blue-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile search button */}
              <button className="md:hidden p-2 text-slate-800 hover:text-blue-600 rounded-md">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-800 hover:text-blue-600 hover:bg-gray-100"
                >
                  {isOpen ? (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation - TechRadar Style */}
        <div className="hidden lg:block bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-6">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Categories:</span>
                {categoryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Updated Daily
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-4 pt-4 pb-6 space-y-6">
              {/* Mobile Search */}
              <div>
                <input 
                  type="text" 
                  placeholder="Search reviews, news..."
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Primary Navigation */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Main Navigation</div>
                {primaryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-slate-800 hover:text-blue-600 font-bold text-base uppercase tracking-wide py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Category Navigation */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Categories</div>
                {categoryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}