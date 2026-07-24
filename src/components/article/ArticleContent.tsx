import { MDXRemote } from 'next-mdx-remote/rsc';

interface ArticleContentProps {
  content: string;
}

function demoteH1ToH2(md: string): string {
  if (!md) return md;
  return md.replace(/^# (.*)$/gm, '## $1');
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const body = demoteH1ToH2(content || '');
  return (
    <div className="prose prose-xl max-w-none text-gray-900 prose-a:text-blue-600 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-blue-700 prose-p:leading-7 md:prose-p:leading-8 prose-headings:mt-8 prose-headings:mb-3 prose-ul:my-6 prose-ol:my-6 prose-li:my-1.5">
      <MDXRemote source={body} />
    </div>
  );
}
