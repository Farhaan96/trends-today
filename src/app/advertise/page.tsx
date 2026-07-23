import { Metadata } from 'next';
import Link from 'next/link';
import {
  ChartBarIcon,
  EnvelopeIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const advertisingEmail =
  'mailto:hello@trendstoday.ca?subject=Advertising%20inquiry%20for%20Trends%20Today';

export const metadata: Metadata = {
  title: 'Advertise with Trends Today',
  description:
    'Reach Lower Mainland readers through clearly labelled advertising and sponsorship opportunities with Trends Today.',
  alternates: { canonical: '/advertise' },
};

export default function AdvertisePage() {
  return (
    <main className="advertise-page">
      <header className="site-shell advertise-hero">
        <p className="section-kicker">Advertising and partnerships</p>
        <h1>Reach people paying attention to the Lower Mainland</h1>
        <p>
          Trends Today publishes useful local reporting across Vancouver, Metro
          Vancouver, and the Fraser Valley. We work with advertisers whose
          message is relevant to those readers and keep paid work clearly
          separated from editorial decisions.
        </p>
        <a className="primary-button" href={advertisingEmail}>
          <EnvelopeIcon aria-hidden="true" />
          Email an advertising inquiry
        </a>
      </header>

      <section className="site-shell advertise-offer">
        <div className="advertise-offer__intro">
          <p className="section-kicker">What a proposal includes</p>
          <h2>A clear audience, placement, and measurement plan</h2>
          <p>
            We do not publish unverified audience claims. Every proposal is
            scoped around the geography and subject fit, the placement and
            dates, available campaign measurements, and the reader experience.
          </p>
        </div>
        <div className="advertise-principles">
          <article>
            <MapPinIcon aria-hidden="true" />
            <h3>Local relevance</h3>
            <p>
              Target by Lower Mainland locality or coverage area when the
              available inventory and story context support it.
            </p>
          </article>
          <article>
            <ChartBarIcon aria-hidden="true" />
            <h3>Measured honestly</h3>
            <p>
              Proposals state which delivery and attention metrics are
              available. Unavailable numbers remain unavailable.
            </p>
          </article>
          <article>
            <ShieldCheckIcon aria-hidden="true" />
            <h3>Brand-safe presentation</h3>
            <p>
              Paid placements are labelled, visually distinct, and never allowed
              to influence independent coverage.
            </p>
          </article>
        </div>
      </section>

      <section className="site-shell advertise-formats">
        <div>
          <p className="section-kicker">Current opportunities</p>
          <h2>Start with the format that serves the reader</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Display placements</h3>
              <p>
                Responsive placements near relevant content, with a restrained
                ad load and clear separation from editorial material.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Sponsored guides or features</h3>
              <p>
                Useful branded content with upfront sponsorship labels, factual
                review, and publisher approval before publication.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Custom local packages</h3>
              <p>
                A bounded campaign around an appropriate city, event, service,
                or seasonal reader need. Scope and reporting are agreed before
                launch.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="site-shell advertise-contact">
        <div>
          <p className="section-kicker">Talk to the publisher</p>
          <h2>Tell us what outcome you need</h2>
          <p>
            Include your organization, target geography, timing, budget range,
            and desired outcome. Farhaan, the publisher, will reply from the
            Trends Today inbox with the next practical step.
          </p>
        </div>
        <div className="advertise-contact__details">
          <strong>Farhaan</strong>
          <span>Publisher, Trends Today</span>
          <a href={advertisingEmail}>hello@trendstoday.ca</a>
          <Link href="/editorial-standards">Read our editorial standards</Link>
        </div>
      </section>
    </main>
  );
}
