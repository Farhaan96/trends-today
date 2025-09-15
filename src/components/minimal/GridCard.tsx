import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/content';

type Props = { article: Article };

export default function GridCard({ article }: Props) {
  const title = article.frontmatter.title as string;
  const href = article.href as string;
  const date = new Date(
    article.frontmatter.publishedAt ||
      article.frontmatter.datePublished ||
      new Date().toISOString()
  ).toLocaleDateString();
  const category = (article.frontmatter.category || article.type) as string;
  const img = article.frontmatter.image as string | undefined;
  const description = (article.frontmatter.description ||
    article.frontmatter.summary ||
    '') as string;

  return (
    <article>
      <Link href={href} prefetch={false}>
        <h3 className="font-serif text-2xl font-bold leading-snug text-gray-900 hover:text-[var(--color-primary)]">
          {title}
        </h3>
      </Link>
      <div className="mt-2 text-sm text-gray-500">
        <span className="uppercase tracking-wide text-[var(--color-primary)] font-semibold">
          {category}
        </span>
        <span className="mx-2">•</span>
        <span>{date}</span>
      </div>
      <div className="mt-3 relative w-full aspect-[16/9] bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-md overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 30vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            Image
          </div>
        )}
      </div>
      {description && (
        <p className="mt-3 text-gray-600 text-sm line-clamp-2">{description}</p>
      )}
    </article>
  );
}
