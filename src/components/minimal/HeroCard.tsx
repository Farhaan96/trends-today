import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/content';

type Props = { article: Article };

export default function HeroCard({ article }: Props) {
  const title = article.frontmatter.title as string;
  const href = article.href as string;
  const date = new Date(
    article.frontmatter.publishedAt ||
      article.frontmatter.datePublished ||
      new Date().toISOString()
  ).toLocaleDateString();
  const category = (article.frontmatter.category || article.type) as string;
  const description = (article.frontmatter.description ||
    article.frontmatter.summary ||
    '') as string;
  const img = article.frontmatter.image as string | undefined;

  return (
    <article className="rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7">
          <Link href={href} prefetch={false}>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 hover:text-[var(--color-primary)]">
              {title}
            </h2>
          </Link>
          <div className="mt-2 text-sm text-gray-500">
            <span className="uppercase tracking-wide text-[var(--color-primary)] font-semibold">
              {category}
            </span>
            <span className="mx-2">•</span>
            <span>{date}</span>
          </div>
          {description && (
            <p className="mt-3 text-gray-600 line-clamp-3">{description}</p>
          )}
        </div>
        <div className="md:col-span-5">
          <div className="relative w-full aspect-[4/3] bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-md overflow-hidden">
            {img ? (
              <Image
                src={img}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                Image
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
