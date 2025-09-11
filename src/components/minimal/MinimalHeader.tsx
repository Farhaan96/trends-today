'use client';

import Link from 'next/link';
// Image removed to switch to text-based logo
import { useState } from 'react';
import DarkModeToggle from '../ui/DarkModeToggle';

export default function MinimalHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Science', href: '/science' },
    { name: 'Culture', href: '/culture' },
    { name: 'Psychology', href: '/psychology' },
    { name: 'Technology', href: '/technology' },
    { name: 'Health', href: '/health' },
    { name: 'Space', href: '/space' },
  ];

  return (
    <header className="border-b border-purple-700/20" style={{background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Trends Today Home">
            <div className="flex flex-col leading-tight" style={{lineHeight: 1}}>
              <span className="text-white font-extrabold tracking-tight text-3xl md:text-4xl">Trends Today</span>
              <span className="text-white/80 text-sm md:text-base">Discover What's Trending</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                style={{
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {item.name}
              </a>
            ))}
            <a
              href="/search"
              style={{ color: 'white', textDecoration: 'none' }}
              aria-label="Search"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </a>
            {/* Dark mode toggle */}
            <DarkModeToggle />
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            style={{ color: 'white' }}
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
              <a
                key={item.name}
                href={item.href}
                className="block py-3"
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textDecoration: 'none'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <a
              href="/search"
              className="block py-3"
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textDecoration: 'none'
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Search
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
