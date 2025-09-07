'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  type: 'article' | 'review' | 'comparison' | 'guide';
  excerpt: string;
  url: string;
  image?: string;
  publishedAt: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            window.location.href = results[selectedIndex].url;
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Perform search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'review': return 'bg-green-100 text-green-800';
      case 'comparison': return 'bg-blue-100 text-blue-800';
      case 'guide': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'review': return '⭐';
      case 'comparison': return '⚖️';
      case 'guide': return '📚';
      default: return '📄';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 pt-16">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
          {/* Search Header */}
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, reviews, guides..."
              className="flex-1 text-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  Searching...
                </div>
              </div>
            )}

            {!isSearching && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <MagnifyingGlassIcon className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  No results found for "{query}"
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Try different keywords or check spelling
                </p>
              </div>
            )}

            {results.map((result, index) => (
              <Link
                key={result.id}
                href={result.url}
                onClick={onClose}
                className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                  selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getTypeColor(result.type)}`}>
                        <span>{getTypeIcon(result.type)}</span>
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(result.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                      {result.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {result.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Search Footer */}
          {!isSearching && query.length < 2 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Type to search articles and reviews</span>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">↑↓</kbd>
                  <span>Navigate</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd>
                  <span>Select</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}