import Link from 'next/link';
import StoryThumb from '@/components/editorial/StoryThumb';
import { homepageImage } from '@/lib/cinematic-feed';
import type { TodayBriefModel } from '@/lib/today-brief';

export default function TodayBrief({ brief }: { brief: TodayBriefModel }) {
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
          {brief.items.map((item) => {
            const image = homepageImage(item);
            return (
              <li key={`${item.href}-${item.text}`}>
                <Link href={item.href} className="today-brief__link">
                  <StoryThumb
                    image={image.src}
                    imageAlt={item.imageAlt}
                    title={item.text}
                    category={item.category}
                    illustration={image.illustration}
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
            );
          })}
        </ul>
      </div>
    </section>
  );
}
