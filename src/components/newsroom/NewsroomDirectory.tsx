import Image from 'next/image';
import Link from 'next/link';
import { EnvelopeIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { newsroomProfiles } from '@/lib/newsroom';

export default function NewsroomDirectory() {
  const profiles = Object.values(newsroomProfiles);

  return (
    <main className="newsroom-page">
      <header className="site-shell newsroom-page__hero">
        <p className="section-kicker">People and accountability</p>
        <h1>Who is behind Trends Today</h1>
        <p>
          A small, independent Lower Mainland publication should be honest about
          who makes decisions and how its reporting is produced. These are our
          current public roles. We will add real portraits and more individual
          editor profiles only when those people and details can be verified.
        </p>
      </header>

      <section className="site-shell newsroom-grid" aria-label="Newsroom team">
        {profiles.map((profile) => (
          <article className="newsroom-card" key={profile.id}>
            <div className="newsroom-card__identity">
              <div className="newsroom-avatar" aria-hidden="true">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt=""
                    width={144}
                    height={144}
                    sizes="72px"
                  />
                ) : profile.entityType === 'Person' ? (
                  <UserIcon />
                ) : (
                  <UsersIcon />
                )}
              </div>
              <div>
                <p className="newsroom-card__role">{profile.role}</p>
                <h2>{profile.name}</h2>
              </div>
            </div>
            <p>{profile.shortBio}</p>
            <ul>
              {profile.responsibilities.map((responsibility) => (
                <li key={responsibility}>{responsibility}</li>
              ))}
            </ul>
            <div className="newsroom-card__actions">
              <Link href={`/author/${profile.id}`}>View profile</Link>
              {profile.email && (
                <a href={`mailto:${profile.email}`}>
                  <EnvelopeIcon aria-hidden="true" />
                  {profile.email}
                </a>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="site-shell newsroom-process">
        <div>
          <p className="section-kicker">How the desk works</p>
          <h2>Names are only useful when responsibility is real</h2>
        </div>
        <div>
          <p>
            Each local article should identify its byline, editor when
            applicable, publication time, reporting method, and primary sources.
            AI-assisted research or drafting does not become a fake person or a
            fabricated biography.
          </p>
          <p>
            The publication contact channel is being verified before it is
            displayed. Trends Today does not publish contact details without a
            confirmed delivery path.
          </p>
        </div>
      </section>
    </main>
  );
}
