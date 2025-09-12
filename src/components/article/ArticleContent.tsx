'use client';

import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { useEffect, useState } from 'react';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const [mdxSource, setMdxSource] = useState<any>(null);

  // Demote any H1s in the MDX body to H2 to avoid duplicate page titles
  function demoteH1ToH2(md: string): string {
    if (!md) return md;
    // Replace only single leading '#' at start of lines with '## '
    // Keeps existing ##, ###, etc. intact
    return md.replace(/^# (.*)$/gm, '## $1');
  }

  useEffect(() => {
    async function parseMDX() {
      try {
        const body = demoteH1ToH2(content || '');
        const serialized = await serialize(body);
        setMdxSource(serialized);
      } catch (error) {
        console.error('Error parsing MDX:', error);
      }
    }
    parseMDX();
  }, [content]);

  if (!mdxSource) {
    // Fallback to rendering as plain markdown-style HTML
    return (
      <div className="prose prose-xl max-w-none text-gray-900 dark:text-gray-100 prose-a:no-underline hover:prose-a:opacity-80 prose-p:leading-7 md:prose-p:leading-8 prose-headings:mt-8 prose-headings:mb-3 prose-ul:my-6 prose-ol:my-6 prose-li:my-1.5">
        <div dangerouslySetInnerHTML={{ __html: demoteH1ToH2(content) }} />
      </div>
    );
  }

  return (
    <div className="prose prose-xl max-w-none text-gray-900 dark:text-gray-100 prose-a:no-underline hover:prose-a:opacity-80 prose-p:leading-7 md:prose-p:leading-8 prose-headings:mt-8 prose-headings:mb-3 prose-ul:my-6 prose-ol:my-6 prose-li:my-1.5">
      <MDXRemote {...mdxSource} />
    </div>
  );
}
