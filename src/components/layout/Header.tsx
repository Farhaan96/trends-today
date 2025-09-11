'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import DarkModeToggle from '../ui/DarkModeToggle';
import NotificationSystem from '../ui/NotificationSystem';
import SearchModal from '../ui/SearchModal';
import MobileMenu from '../mobile/MobileMenu';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const primaryNavigation = [
    { name: 'Science', href: '/science' },
    { name: 'Culture', href: '/culture' },
    { name: 'Psychology', href: '/psychology' },
    { name: 'Technology', href: '/technology' },
    { name: 'Health', href: '/health' },
    { name: 'Space', href: '/space' }
  ];

  const categoryNavigation = [
    { name: 'Phones', href: '/reviews?category=smartphones' },
    { name: 'Laptops', href: '/reviews?category=laptops' },
    { name: 'Audio', href: '/reviews?category=headphones' },
    { name: 'Gaming', href: '/reviews?category=gaming' },
    { name: 'Smart Home', href: '/reviews?category=smart-home' }
  ];

  return (
    <header className="bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700" style={{ fontFamily: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Main Header - Leravi Style */}
      <nav className="text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Brand Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0" aria-label="Trends Today Home">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                  </div>
                  <span className="text-2xl font-bold text-white drop-shadow-lg">Trends Today</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {primaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-purple-200 font-medium text-lg transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Actions and Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Dark mode */}
              <div className="hidden md:block">
                <DarkModeToggle />
              </div>
              {/* Search Button */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-white hover:text-purple-200 rounded-md hover:bg-purple-600 transition-colors"
                aria-label="Search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-purple-200 hover:bg-purple-600"
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

      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
