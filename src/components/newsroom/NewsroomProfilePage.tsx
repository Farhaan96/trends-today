import Image from 'next/image';
import Link from 'next/link';
import {
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { getAllArticles, getArticlesByAuthor } from '@/lib/article-utils';
import { newsroomProfiles } from '@/lib/newsroom';
import { formatArticleDate } from '@/lib/editorial';

export default async function NewsroomProfilePage({ slug }: { slug: string }) {
  const profile = newsroomProfiles[slug];
  if (!profile) return null;

  const authorNames =
    profile.id === 'trends-today-newsroom'
      ? ['Trends Today Newsroom', 'Trends Today Team', 'Trends Today']
      : [profile.name];
  const articleGroups =
    profile.id === 'moe'
      ? [
          (await getAllArticles()).filter(
            (article) => article.frontmatter?.editor === profile.name
          ),
        ]
      : await Promise.all(authorNames.map((name) => getArticlesByAuthor(name)));
  const articles = articleGroups
    .flat()
    .filter(
      (article, index, all) =>
        all.findIndex((candidate) => candidate.slug === article.slug) === index
    )
    .slice(0, 12);

  return (
    <main className="profile-page">
      <header className="site-shell profile-page__header">
        <div
          className="newsroom-avatar newsroom-avatar--large"
          aria-hidden="true"
        >
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt=""
              width={288}
              height={288}
              sizes="(max-width: 640px) 96px, 144px"
            />
          ) : profile.entityType === 'Person' ? (
            <UserIcon />
          ) : (
            <UsersIcon />
          )}
        </div>
        <div>
          <p className="section-kicker">{profile.role}</p>
          <h1>{profile.name}</h1>
          <p className="profile-page__bio">{profile.shortBio}</p>
          <div className="profile-page__meta">
            <span>
              <MapPinIcon aria-hidden="true" />
              {profile.location}
            </span>
            {profile.email && (
              <a href={`mailto:${profile.email}`}>
                <EnvelopeIcon aria-hidden="true" />
                {profile.email}
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="site-shell profile-page__body">
        <section>
          <h2>About this role</h2>
          {profile.longBio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <h2>Responsibilities</h2>
          <ul>
            {profile.responsibilities.map((responsibility) => (
              <li key={responsibility}>{responsibility}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Recent work</h2>
          {articles.length ? (
            <div className="profile-articles">
              {articles.map((article) => (
                <Link
                  key={`${article.category}-${article.slug}`}
                  href={`/${article.category}/${article.slug}`}
                >
                  <span>{formatArticleDate(article.publishedAt)}</span>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p>No articles are currently attached to this profile.</p>
          )}
        </section>
      </div>
    </main>
  );
}
