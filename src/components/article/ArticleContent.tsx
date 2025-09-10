'use client';

import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { useEffect, useState } from 'react';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const [mdxSource, setMdxSource] = useState<any>(null);

  useEffect(() => {
    async function parseMDX() {
      try {
        const serialized = await serialize(content || '');
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
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return (
    <div className="prose prose-lg max-w-none">
      <MDXRemote {...mdxSource} />
    </div>
  );
}