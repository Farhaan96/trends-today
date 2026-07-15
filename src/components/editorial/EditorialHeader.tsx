'use client';

import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navigation = [
  { name: 'Science', href: '/science' },
  { name: 'Culture', href: '/culture' },
  { name: 'Psychology', href: '/psychology' },
  { name: 'Technology', href: '/technology' },
  { name: 'Health', href: '/health' },
  { name: 'Space', href: '/space' },
];

export default function EditorialHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setIsMenuOpen(false), [pathname]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="site-header__bar">
        <Link href="/" className="site-wordmark" aria-label="Trends Today home">
          <span className="site-wordmark__mark" aria-hidden="true">
            T
          </span>
          <span>Trends Today</span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={
                  active ? 'site-nav__link is-active' : 'site-nav__link'
                }
                aria-current={active ? 'page' : undefined}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="site-menu-button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? (
            <XMarkIcon aria-hidden="true" />
          ) : (
            <Bars3Icon aria-hidden="true" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="mobile-nav__link">
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
