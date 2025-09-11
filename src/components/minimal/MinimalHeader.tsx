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
    <header className="border-b border-purple-700/20" style={{background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-24">
          {/* Logo - Clean SVG with modern trending icon */}
          <Link href="/" style={{textDecoration: 'none'}}>
            <svg width="200" height="56" viewBox="0 0 200 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer hover:opacity-90 transition-opacity">
              {/* White background circle */}
              <rect x="4" y="8" width="40" height="40" rx="8" fill="white"/>
              
              {/* Modern trending icon - pulse/wave */}
              <g transform="translate(24, 28)">
                {/* Trending line with dots */}
                <circle cx="-10" cy="6" r="2" fill="url(#gradient)" opacity="0.5"/>
                <circle cx="-4" cy="2" r="2" fill="url(#gradient)" opacity="0.7"/>
                <circle cx="2" cy="-2" r="2" fill="url(#gradient)" opacity="0.9"/>
                <circle cx="8" cy="-6" r="3" fill="url(#gradient)"/>
                
                {/* Connecting line */}
                <path 
                  d="M -10 6 Q -7 4, -4 2 T 2 -2 Q 5 -4, 8 -6" 
                  stroke="url(#gradient)" 
                  strokeWidth="2" 
                  fill="none"
                  strokeLinecap="round"
                />
                
                {/* Spark effects */}
                <circle cx="8" cy="-6" r="1" fill="white"/>
                <path d="M 6 -8 L 10 -8 M 8 -10 L 8 -6" stroke="url(#gradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
              </g>
              
              {/* Text */}
              <text x="56" y="28" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="bold" fill="white">Trends Today</text>
              <text x="56" y="42" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fill="rgba(255,255,255,0.8)">Discover What&apos;s Trending</text>
              
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor:'#8B5CF6', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#3B82F6', stopOpacity:1}} />
                </linearGradient>
              </defs>
            </svg>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {item.name}
              </a>
            ))}
            <a
              href="/search"
              style={{
                color: 'white',
                textDecoration: 'none'
              }}
              aria-label="Search"
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            style={{color: 'white'}}
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