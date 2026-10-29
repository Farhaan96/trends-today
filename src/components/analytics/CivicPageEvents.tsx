'use client';

import { useEffect } from 'react';

/** GA4 events for civic pages, through the site's existing gtag. */
export default function CivicPageEvents() {
  useEffect(() => {
    const page_path = window.location.pathname;
    const send = (name: string, params: Record<string, string>) =>
      window.gtag?.('event', name, { page_path, ...params });

    const block = document.querySelector('.article-next-up');
    const observer =
      block && 'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.intersectionRatio >= 0.5)) {
                send('what_closes_next_seen', {});
                observer?.disconnect();
              }
            },
            { threshold: 0.5 }
          )
        : null;
    if (block) observer?.observe(block);

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.(
        'a[data-card-status]'
      );
      if (!link) return;
      send('related_card_click', {
        target_path: link.getAttribute('href') || '',
        card_status: link.getAttribute('data-card-status') || '',
      });
    };
    document.addEventListener('click', onClick);
    return () => {
      observer?.disconnect();
      document.removeEventListener('click', onClick);
    };
  }, []);
  return null;
}
