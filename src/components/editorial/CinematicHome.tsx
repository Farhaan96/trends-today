'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { getCategoryLabel } from '@/lib/categories';
import { SubtlePaginationLinks } from '@/components/ui/PaginationLinks';
import StoryThumb from '@/components/editorial/StoryThumb';
import { paginateItems } from '@/lib/pagination';
import {
  type LocalStory,
  ALL_CITIES,
  activeEvents,
  filterStories,
  homepageImage,
  pickTravelStories,
  splitCityFilters,
  splitFeaturedStories,
  storyCity,
  editorialPoster,
} from '@/lib/cinematic-feed';

export default function CinematicHome({
  stories,
  asOf,
  latestHrefs,
  children,
}: {
  stories: LocalStory[];
  asOf: string;
  latestHrefs: string[];
  children?: ReactNode;
}) {
  const [now, setNow] = useState(asOf);
  const [selected, setSelected] = useState(1);
  const [city, setCity] = useState(ALL_CITIES);
  const [citiesExpanded, setCitiesExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(9);
  const hero = useRef<HTMLDivElement>(null);
  const swipe = useRef<number | null>(null);
  const events = activeEvents(stories, now)
    .filter((story) => story.href !== stories[0]?.href)
    .slice(0, 6);
  const index = events.length ? selected % events.length : 0;
  const current = events[index];
  const lead = stories[0];
  const leadImage = lead ? homepageImage(lead) : undefined;
  const defaultFeatureExclusions = new Set([
    ...(lead ? [lead.href] : []),
    ...latestHrefs,
  ]);
  const defaultFeatured = splitFeaturedStories(
    stories,
    0,
    defaultFeatureExclusions
  );
  const travelExclusions = new Set([
    ...defaultFeatureExclusions,
    ...(defaultFeatured.lead ? [defaultFeatured.lead.href] : []),
    ...defaultFeatured.secondaries.map((story) => story.href),
  ]);
  const transit = pickTravelStories(stories, travelExclusions);
  const { visible: visibleCities, extra: extraCities } = splitCityFilters(
    stories,
    city
  );
  const results = filterStories(stories, city, query);
  const isDefaultView = city === ALL_CITIES && query.trim() === '';
  const {
    lead: featuredLead,
    secondaries: secondaryStories,
    grid: gridStories,
    hasMore,
  } = splitFeaturedStories(
    results,
    count,
    isDefaultView ? defaultFeatureExclusions : new Set()
  );
  const featuredLeadImage = featuredLead
    ? homepageImage(featuredLead)
    : undefined;
  const pagination = paginateItems(stories, 1, 12, '').pagination;

  useEffect(() => {
    setNow(new Date().toISOString());
    const timer = setInterval(() => setNow(new Date().toISOString()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const element = hero.current;
    if (
      !element ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    let frame = 0;
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        element.style.setProperty(
          '--scroll-depth',
          `${Math.min(window.scrollY * 0.055, 30)}px`
        )
      );
    };
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scroll);
    };
  }, []);

  const move = (delta: number) =>
    setSelected((value) =>
      events.length ? (value + delta + events.length) % events.length : 0
    );
  const date = (value?: string) =>
    value && Number.isFinite(Date.parse(value))
      ? new Intl.DateTimeFormat('en-CA', {
          month: 'short',
          day: 'numeric',
          timeZone: 'America/Vancouver',
        }).format(new Date(value))
      : '';

  return (
    <div className="cinematic-home">
      {lead && (
        <section className="cover" aria-labelledby="cover-heading" ref={hero}>
          <div className="cover__inner">
            <div className="cover__copy">
              <p className="eyebrow">Your Lower Mainland, today</p>
              <h1 id="cover-heading">
                Good things. <br />
                Close to <br />
                home.
              </h1>
              <p className="cover__deck">{lead.description}</p>
              <Link href={lead.href} className="cover__read">
                <span className="arrow-disc">
                  <ArrowRightIcon />
                </span>
                Read the story
                <ArrowRightIcon />
              </Link>
              <p className="cover__signature">
                People
                <br />
                Places
                <br />
                Culture
                <br />
                Community
              </p>
            </div>
            <div
              className="cover__stage"
              onPointerMove={(event) => {
                if (
                  event.pointerType !== 'mouse' ||
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches
                )
                  return;
                const box = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty(
                  '--tilt-x',
                  `${-(event.clientY - box.top - box.height / 2) / 120}deg`
                );
                event.currentTarget.style.setProperty(
                  '--tilt-y',
                  `${(event.clientX - box.left - box.width / 2) / 150}deg`
                );
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty('--tilt-x', '0deg');
                event.currentTarget.style.setProperty('--tilt-y', '0deg');
              }}
            >
              <Link
                href={lead.href}
                className={`cover__frame ${
                  leadImage?.src && leadImage.fit === 'contain'
                    ? 'cover__frame--contain'
                    : ''
                }`.trim()}
                aria-label={lead.title}
              >
                <span
                  className={[
                    'cover__media',
                    leadImage?.src ? '' : 'cover__media--fallback',
                    leadImage?.src && leadImage.fit === 'contain'
                      ? 'cover__media--contain'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {leadImage?.src ? (
                    // The headline sits in the caption inside this link, so
                    // the cover art is decorative.
                    <Image
                      src={leadImage.src}
                      alt=""
                      fill
                      priority
                      sizes="(max-width: 760px) 100vw, 67vw"
                      className="cover__image"
                    />
                  ) : (
                    <span
                      className="story-thumb__fallback cover__fallback"
                      aria-hidden="true"
                    >
                      <span className="story-thumb__mark">trends today</span>
                      <span className="story-thumb__rule" />
                      <span className="story-thumb__label">
                        {getCategoryLabel(lead.category)}
                      </span>
                    </span>
                  )}
                  {leadImage?.src && leadImage.illustration && (
                    <span className="story-thumb__illustration">
                      Illustration
                    </span>
                  )}
                </span>
                <div className="cover__caption">
                  <div className="cover__stamp">
                    <span>Latest story</span>
                    <time dateTime={lead.publishedAt}>
                      {date(lead.publishedAt)}
                    </time>
                  </div>
                  <div>
                    <span className="eyebrow">{storyCity(lead)}</span>
                    <h2>{lead.title}</h2>
                  </div>
                  <ArrowRightIcon />
                </div>
              </Link>
              {lead.imageAttribution && (
                <p className="cover__credit">{lead.imageAttribution}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {children}

      {transit.length > 0 && (
        <section className="travel-brief" aria-labelledby="travel-heading">
          <div className="travel-brief__inner">
            <h2 id="travel-heading">
              Before you <br />
              head out.
            </h2>
            {transit.map((story) => {
              const image = homepageImage(story);
              return (
                <article key={story.href}>
                  <Link href={story.href} className="travel-brief__link">
                    <StoryThumb
                      image={image.src}
                      category={story.category}
                      illustration={image.illustration}
                      fit={image.fit}
                      className="travel-brief__thumb"
                      sizes="(max-width: 560px) calc(100vw - 44px), (max-width: 800px) 45vw, 30vw"
                    />
                    <span className="eyebrow">{storyCity(story)}</span>
                    <div className="travel-brief__title-row">
                      <h3>{story.title}</h3>
                      <ArrowRightIcon />
                    </div>
                    <span className="travel-brief__description">
                      {story.description}
                    </span>
                    <time dateTime={story.publishedAt}>
                      {date(story.publishedAt)}
                    </time>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section
          id="weekend"
          className="weekend"
          aria-labelledby="weekend-heading"
        >
          <div className="weekend__heading">
            <div>
              <p className="eyebrow">Things to do</p>
              <h2 id="weekend-heading">Your weekend, sorted.</h2>
            </div>
            <div>
              <p>
                Food, festivals and a few
                <br />
                good reasons to get out.
              </p>
              <Link href="/things-to-do">
                Explore things to do
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
          <div
            className="poster-gallery"
            role="region"
            aria-roledescription="carousel"
            aria-label="Upcoming local events"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                move(1);
              }
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                move(-1);
              }
            }}
            onPointerDown={(event) => {
              swipe.current = event.clientX;
            }}
            onPointerUp={(event) => {
              if (
                swipe.current !== null &&
                Math.abs(event.clientX - swipe.current) > 45
              )
                move(event.clientX < swipe.current ? 1 : -1);
              swipe.current = null;
            }}
            onPointerCancel={() => {
              swipe.current = null;
            }}
          >
            {events.map((story, itemIndex) => {
              let offset = (itemIndex - index + events.length) % events.length;
              if (offset > events.length / 2) offset -= events.length;
              const poster = editorialPoster(story);
              return (
                <Link
                  key={story.href}
                  href={story.href}
                  className={`event-poster ${offset === 0 ? 'is-selected' : ''}`}
                  style={
                    {
                      '--offset': offset,
                      '--distance': Math.abs(offset),
                      zIndex: 10 - Math.abs(offset),
                    } as CSSProperties
                  }
                  aria-label={story.title}
                  tabIndex={Math.abs(offset) > 1 ? -1 : 0}
                  aria-hidden={Math.abs(offset) > 1 || undefined}
                >
                  {poster ? (
                    <Image
                      src={poster}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 65vw, 30vw"
                      draggable={false}
                    />
                  ) : (
                    <div className="event-poster__fallback">
                      <span>{storyCity(story)}</span>
                      <h3>{story.title}</h3>
                      <p>Through {date(story.eventEndDate)}</p>
                      <ArrowRightIcon />
                    </div>
                  )}
                  <time
                    className="event-poster__date"
                    dateTime={story.publishedAt}
                  >
                    {date(story.publishedAt)}
                  </time>
                </Link>
              );
            })}
          </div>
          <div className="gallery-controls">
            <button
              className="round-button"
              type="button"
              aria-label="Previous event"
              disabled={events.length < 2}
              onClick={() => move(-1)}
            >
              <ArrowLeftIcon />
            </button>
            <div>
              <p className="gallery-count" aria-live="polite">
                {String(index + 1).padStart(2, '0')}{' '}
                <span>/ {String(events.length).padStart(2, '0')}</span>
              </p>
              <Link href={current.href} className="gallery-detail">
                View event details
                <ArrowRightIcon />
              </Link>
            </div>
            <button
              className="round-button"
              type="button"
              aria-label="Next event"
              disabled={events.length < 2}
              onClick={() => move(1)}
            >
              <ArrowRightIcon />
            </button>
          </div>
          <p className="gallery-caption">
            {current.title}
            <span>Editorial event artwork by Trends Today</span>
          </p>
        </section>
      )}

      <section
        id="discover"
        className="neighbourhood"
        aria-labelledby="neighbourhood-heading"
      >
        <div className="neighbourhood__heading">
          <div>
            <p className="eyebrow">Lower Mainland</p>
            <h2 id="neighbourhood-heading">Around your neighbourhood.</h2>
          </div>
          <p>
            Different places.
            <br />A brighter region.
          </p>
        </div>
        <div className="discovery-tools">
          <div
            className="city-filters"
            role="group"
            aria-label="Filter by city"
          >
            <div className="city-filters__row">
              <button
                type="button"
                aria-pressed={city === ALL_CITIES}
                onClick={() => {
                  setCity(ALL_CITIES);
                  setCount(9);
                }}
              >
                {ALL_CITIES}
              </button>
              {visibleCities.map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={city === item}
                  onClick={() => {
                    setCity(item);
                    setCount(9);
                  }}
                >
                  {item}
                </button>
              ))}
              {extraCities.length > 0 && (
                <button
                  type="button"
                  className="city-filters__toggle"
                  aria-expanded={citiesExpanded}
                  aria-controls="extra-city-filters"
                  onClick={() => setCitiesExpanded((value) => !value)}
                >
                  {citiesExpanded ? 'Fewer cities' : 'More cities'}
                  <span className="city-filters__caret" aria-hidden="true" />
                </button>
              )}
            </div>
            <div
              id="extra-city-filters"
              className="city-filters__extra"
              hidden={!citiesExpanded}
            >
              {extraCities.map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={city === item}
                  onClick={() => {
                    setCity(item);
                    setCount(9);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label className="story-search">
            <MagnifyingGlassIcon />
            <span className="sr-only">Search local stories</span>
            <input
              type="search"
              value={query}
              placeholder="Find a local story"
              onChange={(event) => {
                setQuery(event.target.value);
                setCount(9);
              }}
            />
          </label>
        </div>
        <p className="result-count" role="status">
          {results.length} {results.length === 1 ? 'story' : 'stories'}
          {city !== ALL_CITIES ? ` in ${city}` : ' from across the region'}
        </p>
        {featuredLead && (
          <div className="neighbourhood-feature">
            <article className="neighbourhood-lead">
              <Link
                href={featuredLead.href}
                className="neighbourhood-lead__link"
              >
                <StoryThumb
                  image={featuredLeadImage?.src}
                  category={featuredLead.category}
                  illustration={featuredLeadImage?.illustration}
                  fit={featuredLeadImage?.fit}
                  className="neighbourhood-lead__thumb"
                  sizes="(max-width: 800px) calc(100vw - 44px), 58vw"
                />
                <span className="eyebrow">
                  {storyCity(featuredLead)}
                  <span>{getCategoryLabel(featuredLead.category)}</span>
                </span>
                <h3>{featuredLead.title}</h3>
                <span className="neighbourhood-lead__description">
                  {featuredLead.description}
                </span>
                <span className="neighbourhood-lead__meta">
                  <time dateTime={featuredLead.publishedAt}>
                    {date(featuredLead.publishedAt)}
                  </time>
                  <ArrowRightIcon />
                </span>
              </Link>
            </article>
            {secondaryStories.length > 0 && (
              <div className="neighbourhood-secondary">
                {secondaryStories.map((story) => {
                  const image = homepageImage(story);
                  return (
                    <article key={story.href}>
                      <Link href={story.href}>
                        <StoryThumb
                          image={image.src}
                          category={story.category}
                          illustration={image.illustration}
                          fit={image.fit}
                          className="neighbourhood-secondary__thumb"
                          sizes="(max-width: 480px) 44vw, (max-width: 800px) 30vw, 18vw"
                        />
                        <div className="neighbourhood-secondary__body">
                          <span className="eyebrow">{storyCity(story)}</span>
                          <h3>{story.title}</h3>
                          <time dateTime={story.publishedAt}>
                            {date(story.publishedAt)}
                          </time>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {gridStories.length > 0 && (
          <div className="neighbourhood-grid">
            {gridStories.map((story) => {
              const image = homepageImage(story);
              return (
                <article key={story.href}>
                  <Link href={story.href} className="neighbourhood-card">
                    <StoryThumb
                      image={image.src}
                      category={story.category}
                      illustration={image.illustration}
                      fit={image.fit}
                      className="neighbourhood-card__thumb"
                      sizes="(max-width: 480px) calc(100vw - 44px), (max-width: 800px) 45vw, 30vw"
                    />
                    <span className="eyebrow">
                      {storyCity(story)}
                      <span>{getCategoryLabel(story.category)}</span>
                    </span>
                    <h3>{story.title}</h3>
                    <span className="neighbourhood-card__description">
                      {story.description}
                    </span>
                    <span className="neighbourhood-card__meta">
                      <time dateTime={story.publishedAt}>
                        {date(story.publishedAt)}
                      </time>
                      {story.eventEndDate &&
                        Date.parse(story.eventEndDate) < Date.parse(now) && (
                          <span className="ended-label">Past event</span>
                        )}
                      <ArrowRightIcon />
                    </span>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
        {results.length === 0 && (
          <div className="discovery-empty">
            <h3>No stories found.</h3>
            <p>Try another city or a shorter search.</p>
            <button
              type="button"
              onClick={() => {
                setCity(ALL_CITIES);
                setQuery('');
              }}
            >
              Show all stories
            </button>
          </div>
        )}
        {hasMore && (
          <button
            type="button"
            className="more-stories"
            onClick={() => setCount((value) => value + 9)}
          >
            More local stories
            <ArrowRightIcon />
          </button>
        )}
        <SubtlePaginationLinks
          pagination={pagination}
          baseUrl=""
          className="crawler-pagination"
        />
      </section>
    </div>
  );
}
