'use client';

import { useEffect, useRef } from 'react';

interface Props {
  /**
   * GitHub repo in the form "owner/repo". If not provided, uses env or sensible default.
   */
  repo?: string;
  /**
   * How to map pages to issues. Common options: 'pathname', 'url', or a custom string.
   * See https://utteranc.es for details.
   */
  issueTerm?: 'pathname' | 'url' | string;
  /**
   * Optional label to apply to issues created by Utterances
   */
  label?: string;
  /**
   * Theme for Utterances widget
   */
  theme?: string;
  className?: string;
}

export default function UtterancesComments({
  repo,
  issueTerm = 'pathname',
  label = 'comments',
  theme = 'github-light',
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear if already rendered (navigating client-side)
    containerRef.current.innerHTML = '';

    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://utteranc.es/client.js';
    scriptEl.async = true;
    scriptEl.crossOrigin = 'anonymous';

    const repoName =
      repo ||
      process.env.NEXT_PUBLIC_UTTERANCES_REPO ||
      'Farhaan96/trends-today';

    scriptEl.setAttribute('repo', repoName);
    scriptEl.setAttribute('issue-term', issueTerm);
    scriptEl.setAttribute('label', label);
    scriptEl.setAttribute('theme', theme);

    containerRef.current.appendChild(scriptEl);
  }, [repo, issueTerm, label, theme]);

  return (
    <div className={`mt-12 border-t border-gray-200 pt-8 ${className}`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
      <div ref={containerRef} />
    </div>
  );
}
