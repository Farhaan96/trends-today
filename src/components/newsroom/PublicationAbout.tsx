import Link from 'next/link';

export default function PublicationAbout() {
  return (
    <main className="trust-page">
      <header className="site-shell trust-page__hero">
        <p className="section-kicker">About Trends Today</p>
        <h1>Useful local reporting, built for real decisions</h1>
        <p>
          Trends Today is an independent Lower Mainland publication covering
          local news, transit, events, food, housing, and sports. The aim is
          simple: help a reader understand what happened, why it matters, and
          what they can do next.
        </p>
      </header>

      <section className="site-shell trust-page__split">
        <div>
          <p className="section-kicker">What we publish</p>
          <h2>Completeness before volume</h2>
        </div>
        <div>
          <p>
            A local guide should include the locations it promises. A transit
            update should state the route, timing, affected stops, and
            alternatives. A policy story should explain who is affected, when it
            changes, and where the primary record can be checked.
          </p>
          <p>
            We use short bulletins only when the reader’s job is genuinely
            short. Reported updates and guides receive more context, structured
            facts, source links, and a visible reporting-method note.
          </p>
        </div>
      </section>

      <section className="site-shell trust-page__split">
        <div>
          <p className="section-kicker">How we work</p>
          <h2>Transparent about people and tools</h2>
        </div>
        <div>
          <p>
            Moe is the publisher and handles editorial accountability,
            corrections, advertising, and partnerships. The Trends Today
            Newsroom is a shared organizational byline for work produced through
            the publication’s research and review process.
          </p>
          <p>
            Software, including AI tools, may assist research and drafting.
            Those tools are not presented as fictional reporters. Sources, local
            utility, sensitive claims, and release readiness are reviewed before
            publication.
          </p>
          <Link href="/authors">Meet the newsroom</Link>
        </div>
      </section>

      <section className="site-shell trust-page__contact">
        <div>
          <p className="section-kicker">Contact and accountability</p>
          <h2>Questions should reach a real inbox</h2>
        </div>
        <div>
          <p>
            The publication email address is being verified before release. We
            will publish it here only after delivery to a monitored inbox is
            confirmed.
          </p>
          <div className="trust-page__actions">
            <Link href="/contact">Contact Trends Today</Link>
            <Link href="/advertise">Advertise with us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
