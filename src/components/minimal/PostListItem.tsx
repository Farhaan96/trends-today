import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/content';

type Props = {
  article: Article;
  showThumb?: boolean;
};

export default function PostListItem({ article, showThumb = false }: Props) {
  const title: string = article.frontmatter.title;
  const href: string = article.href;
  const date = new Date(
    article.frontmatter.publishedAt || article.frontmatter.datePublished || new Date().toISOString()
  );
  const category: string = article.frontmatter.category || article.type;
  const img: string | undefined = article.frontmatter.image;

  return (
    <li className="py-4">
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <Link href={href} prefetch={false}>
            <h2 className="text-xl font-semibold leading-snug underline decoration-gray-200 hover:decoration-gray-400">
              {title}
            </h2>
          </Link>
          <div className="mt-1 text-sm text-gray-500">
            <span>{date.toLocaleDateString()}</span>
            <span className="mx-2">·</span>
            <span className="uppercase tracking-wide">{category}</span>
          </div>
        </div>
        {showThumb && img && (
          <div className="w-24 h-16 relative flex-shrink-0 rounded overflow-hidden border border-gray-100">
            <Image src={img} alt={title} fill className="object-cover" sizes="96px" />
          </div>
        )}
      </div>
    </li>
  );
}

