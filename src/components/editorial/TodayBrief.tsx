import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import StoryThumb from '@/components/editorial/StoryThumb';
import { getAllArticles } from '@/lib/article-utils';
import {
  buildTodayBrief,
  type TodayFile,
  type TodayPost,
} from '@/lib/today-brief';

function readTodayFile(): TodayFile | null {
  try {
    const filePath = path.join(process.cwd(), 'content', 'today.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as TodayFile;
  } catch {
    return null;
  }
}

export default async function TodayBrief() {
  const articles = await getAllArticles();
  const posts: TodayPost[] = articles.map((article) => ({
    href: `/${article.category}/${article.slug}`,
    title: article.frontmatter?.title || article.title,
    category: article.category,
    image: article.frontmatter?.image || article.image,
    imageAlt: article.frontmatter?.imageAlt,
    updatedAt: article.frontmatter?.updatedAt,
    modifiedAt: article.frontmatter?.modifiedAt,
    publishedAt: article.frontmatter?.publishedAt,
    datePublished: article.frontmatter?.datePublished,
    status: article.frontmatter?.status,
  }));
  const brief = buildTodayBrief({
    file: readTodayFile(),
    posts,
    now: new Date().toISOString(),
  });

  if (brief.items.length < 3) return null;

  return (
    <section className="today-brief" aria-labelledby="today-brief-heading">
      <div className="today-brief__inner">
        <div className="today-brief__head">
          <h2 id="today-brief-heading">{brief.heading}</h2>
          {brief.mode === 'today' && brief.dateTime && brief.dateLabel ? (
            <time dateTime={brief.dateTime}>{brief.dateLabel}</time>
          ) : null}
        </div>
        <ul>
          {brief.items.map((item) => (
            <li key={`${item.href}-${item.text}`}>
              <Link href={item.href} className="today-brief__link">
                <StoryThumb
                  image={item.image}
                  imageAlt={item.imageAlt}
                  title={item.text}
                  category={item.category}
                  className="today-brief__thumb"
                  sizes="(max-width: 639px) 36vw, (max-width: 959px) 46vw, 24vw"
                />
                <span className="today-brief__body">
                  <span className="today-brief__label">{item.label}</span>
                  <span className="today-brief__headline">{item.text}</span>
                  {item.dateTime && item.dateLabel ? (
                    <time
                      className="today-brief__date"
                      dateTime={item.dateTime}
                    >
                      {item.dateLabel}
                    </time>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
