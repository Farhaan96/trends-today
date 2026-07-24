import Link from 'next/link';

export default function CurrentEditorialStandards() {
  return (
    <main className="trust-page">
      <header className="site-shell trust-page__hero">
        <p className="section-kicker">Editorial standards</p>
        <h1>Accuracy, utility, and visible accountability</h1>
        <p>
          These standards apply to local reporting, guides, explainers, and
          sponsored material published by Trends Today. Last reviewed July 23,
          2026.
        </p>
      </header>

      <section className="site-shell standards-list">
        <article>
          <span>01</span>
          <div>
            <h2>Complete the reader’s job</h2>
            <p>
              Headlines and introductions must not promise locations, prices,
              schedules, eligibility, or steps that the body does not provide.
              Length follows the information needed, not a target padded with
              repetition.
            </p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h2>Prefer primary, local sources</h2>
            <p>
              Official records, direct announcements, public data, and
              attributable local voices take priority. Sources are linked at the
              point of use or in a clear source list.
            </p>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <h2>Show who and how</h2>
            <p>
              Articles display a real person or organizational newsroom byline,
              an editor where applicable, timestamps, and a reporting-method
              note. AI assistance is disclosed as part of the newsroom process
              and never disguised as a fictional person.
            </p>
          </div>
        </article>
        <article>
          <span>04</span>
          <div>
            <h2>Separate editorial and commercial work</h2>
            <p>
              Advertising does not determine independent coverage. Sponsored
              work requires publisher approval, a clear label, factual review,
              and a visual treatment that cannot be mistaken for independent
              reporting.
            </p>
          </div>
        </article>
        <article>
          <span>05</span>
          <div>
            <h2>Correct the record</h2>
            <p>
              Material errors are corrected promptly. Significant changes should
              update the modification time and explain what changed. Concerns
              will be accepted through the verified publication contact shown on
              this site.
            </p>
          </div>
        </article>
      </section>

      <section className="site-shell trust-page__contact">
        <div>
          <p className="section-kicker">Questions or corrections</p>
          <h2>Hold the publication to these standards</h2>
        </div>
        <div>
          <p>
            Include the article link, the specific concern, and supporting
            evidence when using the verified publication contact shown on this
            site.
          </p>
          <div className="trust-page__actions">
            <Link href="/authors">Who is responsible</Link>
            <Link href="/contact">Contact the newsroom</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
