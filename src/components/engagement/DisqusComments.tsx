'use client';

import { useEffect } from 'react';

interface DisqusCommentsProps {
  url: string;
  identifier: string;
  title: string;
}

declare global {
  interface Window {
    DISQUS: {
      reset: (config: { reload: boolean; config: () => void }) => void;
    };
    disqus_config: () => void;
  }
}

export default function DisqusComments({
  url,
  identifier,
  title,
}: DisqusCommentsProps) {
  useEffect(() => {
    const disqusShortname =
      process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || 'trendstoday';

    // Configure Disqus
    window.disqus_config = function () {
      // @ts-expect-error - Disqus configuration
      this.page.url = url;
      // @ts-expect-error - Disqus configuration
      this.page.identifier = identifier;
      // @ts-expect-error - Disqus configuration
      this.page.title = title;
    };

    // Load Disqus script
    if (!document.getElementById('disqus-script')) {
      const d = document;
      const s = d.createElement('script');
      s.id = 'disqus-script';
      s.src = `https://${disqusShortname}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', String(Number(new Date())));
      (d.head || d.body).appendChild(s);
    } else if (window.DISQUS) {
      // Reset Disqus if script already loaded
      window.DISQUS.reset({
        reload: true,
        config: window.disqus_config,
      });
    }
  }, [url, identifier, title]);

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Join the Discussion
      </h3>
      <div id="disqus_thread" className="min-h-[200px]"></div>
      <noscript>
        <div className="text-gray-600 text-center py-8">
          Please enable JavaScript to view the{' '}
          <a
            href="https://disqus.com/?ref_noscript"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            comments powered by Disqus.
          </a>
        </div>
      </noscript>
    </div>
  );
}
