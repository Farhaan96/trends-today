'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MinimalHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Science', href: '/science' },
    { name: 'Culture', href: '/culture' },
    { name: 'Psychology', href: '/psychology' },
    { name: 'Technology', href: '/technology' },
    { name: 'Health', href: '/health' },
    { name: 'Mystery', href: '/mystery' },
  ];

  return (
    <header className="border-b border-purple-700/20" style={{background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', backgroundImage: 'linear-gradient(90deg, #8B5CF6, #3B82F6)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-24">
          {/* Logo - Clean text-based design */}
          <Link href="/" className="flex items-center group no-underline" style={{textDecoration: 'none'}}>
            <div className="flex items-center space-x-3">
              {/* Logo Icon */}
              <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <span className="text-2xl font-black bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>T</span>
              </div>
              {/* Logo Text */}
              <div className="flex flex-col">
                <span className="text-xl font-black" style={{color: 'white', textDecoration: 'none'}}>Trends Today</span>
                <span className="text-xs font-medium" style={{color: 'rgba(255,255,255,0.8)', textDecoration: 'none'}}>Discover What's Trending</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Medium size, Bold, White */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:scale-105 transition-transform duration-200"
                style={{color: 'white', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none'}}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/search"
              className="hover:scale-105 transition-transform duration-200"
              style={{color: 'white', textDecoration: 'none'}}
              aria-label="Search"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-gradient-to-b from-purple-600/95 to-blue-600/95 backdrop-blur-sm">
          <nav className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 font-bold text-lg uppercase tracking-wide transition-all duration-200"
                style={{color: 'white', textDecoration: 'none'}}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/search"
              className="block py-3 font-bold text-lg uppercase tracking-wide transition-all duration-200"
              style={{color: 'white', textDecoration: 'none'}}
              onClick={() => setIsMenuOpen(false)}
            >
              Search
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
