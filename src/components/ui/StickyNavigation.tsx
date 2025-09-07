'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';

export default function StickyNavigation() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show sticky nav when scrolling down past header
      if (currentScrollY > 200) {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const quickLinks = [
    { name: 'Reviews', href: '/reviews' },
    { name: 'Best', href: '/best' },
    { name: 'News', href: '/news' },
    { name: 'Compare', href: '/compare' },
  ];

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-sm mr-2">
              <span className="text-lg font-bold uppercase">T</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white uppercase">
              Trends<span className="text-blue-600">Today</span>
            </span>
          </Link>

          {/* Quick Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-900 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <DarkModeToggle />
            
            {/* Search Icon */}
            <button
              className="p-2 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}