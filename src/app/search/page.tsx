'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Result = {
  id: string;
  title: string;
  type: 'review' | 'guide' | 'comparison' | 'news' | string;
  excerpt: string;
  url: string;
  image?: string;
  publishedAt?: string;
};

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!touched) return;
    const handle = setTimeout(async () => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const json = await res.json();
        setResults(json.results || []);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [q, touched]);

  const placeholder = useMemo(
    () => 'Search reviews, guides, and comparisons…',
    []
  );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">Search</h1>

      <div className="mb-8">
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setTouched(true); }}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="mt-2 text-sm text-gray-500">
          {loading ? 'Searching…' : (q && results.length > 0 ? `${results.length} results` : 'Type at least 2 characters')}
        </div>
      </div>

      {results.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((r) => (
            <li key={r.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <Link href={r.url} className="block">
                <div className="relative h-44 bg-gray-100">
                  {r.image ? (
                    <Image src={r.image} alt={r.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">{r.type}</div>
                  <h2 className="mt-1 text-lg font-bold text-gray-900 line-clamp-2">{r.title}</h2>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{r.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

