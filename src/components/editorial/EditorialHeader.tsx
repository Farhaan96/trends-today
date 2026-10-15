'use client';

import Link from 'next/link';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import RelativeStamp from '@/components/editorial/RelativeStamp';

const navigation = [
  { name: 'Local news', href: '/local-news' },
  { name: 'Things to do', href: '/things-to-do' },
  { name: 'Food & drink', href: '/food-drink' },
  { name: 'Transit', href: '/transit' },
  { name: 'Housing', href: '/housing' },
  { name: 'Sports', href: '/sports' },
];

export default function EditorialHeader({
  freshness,
}: {
  freshness?: { iso: string; label: string; editionDate?: string } | null;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setIsMenuOpen(false), [pathname]);
  return (
    <header
      className="tt-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setIsMenuOpen(false);
      }}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="tt-header__inner">
        <Link href="/" className="tt-wordmark" aria-label="Trends Today home">
          trends today<span>.</span>
        </Link>
        <nav className="tt-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? 'page'
                  : undefined
              }
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <Link
          href="/#discover"
          className="tt-search"
          aria-label="Search local stories"
        >
          <MagnifyingGlassIcon />
        </Link>
        <div className="tt-edition" aria-label="Publication edition">
          <span>Lower Mainland edition</span>
          {freshness?.editionDate ? <span>{freshness.editionDate}</span> : null}
        </div>
        <button
          type="button"
          className="tt-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
        </button>
      </div>
      {freshness?.iso && freshness.label ? (
        <p className="tt-freshness">
          <RelativeStamp iso={freshness.iso} absolute={freshness.label} />
        </p>
      ) : null}
      <nav className="tt-chips" aria-label="Sections">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? 'page'
                : undefined
            }
          >
            {item.name}
          </Link>
        ))}
      </nav>
      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          className="tt-mobile-nav"
          aria-label="Mobile navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link href="/#discover" onClick={() => setIsMenuOpen(false)}>
            Search stories
          </Link>
        </nav>
      )}
    </header>
  );
}
