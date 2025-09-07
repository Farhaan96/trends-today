'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import DarkModeToggle from '../ui/DarkModeToggle';
import NewsletterSignup from '../newsletter/NewsletterSignup';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const navigation = [
    {
      name: 'Reviews',
      href: '/reviews',
      icon: '⭐',
      categories: [
        { name: 'Smartphones', href: '/reviews?category=smartphones' },
        { name: 'Laptops', href: '/reviews?category=laptops' },
        { name: 'Headphones', href: '/reviews?category=headphones' },
        { name: 'Gaming', href: '/reviews?category=gaming' },
        { name: 'Smart Home', href: '/reviews?category=smart-home' }
      ]
    },
    {
      name: 'Buying Guides',
      href: '/best',
      icon: '📚',
      categories: [
        { name: 'Best Phones 2025', href: '/best/smartphones/2025' },
        { name: 'Best Laptops 2025', href: '/best/laptops/2025' },
        { name: 'Best Headphones', href: '/best/headphones/2025' },
        { name: 'Best Gaming Gear', href: '/best/gaming/2025' }
      ]
    },
    {
      name: 'News',
      href: '/news',
      icon: '📰',
      categories: [
        { name: 'Latest Tech News', href: '/news' },
        { name: 'Product Launches', href: '/news?category=launches' },
        { name: 'Industry Updates', href: '/news?category=industry' }
      ]
    },
    {
      name: 'Comparisons',
      href: '/compare',
      icon: '⚖️',
      categories: [
        { name: 'Phone Comparisons', href: '/compare?category=smartphones' },
        { name: 'Laptop Comparisons', href: '/compare?category=laptops' }
      ]
    }
  ];

  const quickActions = [
    { name: 'Search', icon: '🔍', action: 'search' },
    { name: 'Dark Mode', icon: '🌙', action: 'theme' },
    { name: 'Newsletter', icon: '📧', action: 'newsletter' }
  ];

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-sm mr-2">
                <span className="text-lg font-bold uppercase">T</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white uppercase">
                Trends<span className="text-blue-600">Today</span>
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-900 hover:text-gray-900 dark:text-gray-900 dark:hover:text-gray-200 rounded-md"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl mb-1">{action.icon}</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-300">
                    {action.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => setActiveSection(activeSection === item.name ? null : item.name)}
                    className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{item.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-900 transition-transform ${
                        activeSection === item.name ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {activeSection === item.name && (
                    <div className="ml-8 mt-2 space-y-1">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block p-2 text-sm text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                      >
                        View All {item.name}
                      </Link>
                      {item.categories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          onClick={onClose}
                          className="block p-2 text-sm text-gray-800 dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Additional Links */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <Link
                  href="/authors"
                  onClick={onClose}
                  className="flex items-center p-2 text-sm text-gray-800 dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  Our Team
                </Link>
                <Link
                  href="/how-we-test"
                  onClick={onClose}
                  className="flex items-center p-2 text-sm text-gray-800 dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  How We Test
                </Link>
                <Link
                  href="/editorial-standards"
                  onClick={onClose}
                  className="flex items-center p-2 text-sm text-gray-800 dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  Editorial Standards
                </Link>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center p-2 text-sm text-gray-800 dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-900 dark:text-gray-900 mb-3">
              Stay updated with the latest tech news
            </div>
            <NewsletterSignup variant="footer" />
          </div>
        </div>
      </div>
    </div>
  );
}