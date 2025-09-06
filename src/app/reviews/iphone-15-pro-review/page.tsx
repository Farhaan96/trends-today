import { Metadata } from 'next';
import Image from 'next/image';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import ProsCons from '@/components/content/ProsCons';
import ScoreCard from '@/components/content/ScoreCard';
import CitationsList from '@/components/content/CitationsList';
import AuthorBox from '@/components/content/AuthorBox';
import StructuredData from '@/components/seo/StructuredData';
import reviewData from '../../../../content/reviews/iphone-15-pro-review.json';

export const metadata: Metadata = {
  title: reviewData.seo?.metaTitle || reviewData.title,
  description: reviewData.seo?.metaDescription,
  keywords: reviewData.seo?.keywords,
  alternates: {
    canonical: reviewData.seo?.canonicalUrl,
  },
  openGraph: {
    title: reviewData.title,
    description: reviewData.seo?.metaDescription,
    type: 'article',
    publishedTime: reviewData.lastUpdated,
    authors: [reviewData.author?.name || 'Trends Today'],
  }
};

export default function ReviewPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": reviewData.product.name,
      "brand": {
        "@type": "Brand",
        "name": reviewData.product.brand
      },
      "model": reviewData.product.model,
      "category": reviewData.product.category,
      "offers": {
        "@type": "Offer",
        "price": reviewData.product.price.amount,
        "priceCurrency": reviewData.product.price.currency
      }
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": reviewData.score.overall,
      "bestRating": 5,
      "worstRating": 1
    },
    "author": {
      "@type": "Person",
      "name": reviewData.author?.name
    },
    "reviewBody": reviewData.verdict,
    "datePublished": reviewData.lastUpdated,
    "publisher": {
      "@type": "Organization",
      "name": "Trends Today"
    }
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              Review
            </span>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              8 min read
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {new Date(reviewData.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {reviewData.title}
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            After two weeks of intensive testing, we dive deep into Apple's latest flagship. 
            Is the titanium upgrade worth the premium price?
          </p>
        </header>

        <div className="mb-8">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <span className="text-gray-500">iPhone 15 Pro Hero Image</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Verdict</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed">
                  {reviewData.verdict}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Tested</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {reviewData.howWeTested}
              </p>
              
              <div className="space-y-6">
                {reviewData.testedClaims.map((claim, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Claim: "{claim.claim}"
                    </h3>
                    <p className="text-green-700 font-medium mb-2">
                      Result: {claim.result}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Methodology:</strong> {claim.methodology}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Evidence:</strong> {claim.evidence}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Design & Build Quality</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The iPhone 15 Pro marks Apple's transition to titanium, and the difference is immediately noticeable. 
                At 187g, it's 8g lighter than the iPhone 14 Pro while feeling more premium in hand. The brushed 
                titanium finish resists fingerprints better than the stainless steel predecessor.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The Action Button replaces the traditional mute switch, offering customizable functionality that 
                power users will appreciate. Build quality remains exceptional with tight tolerances and premium 
                materials throughout.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The A17 Pro chip delivers on Apple's performance promises with a 19.3% improvement in CPU 
                performance over the A16 Bionic. Gaming performance is particularly impressive, handling 
                demanding titles like Resident Evil 4 with console-quality graphics.
              </p>
              <p className="text-gray-700 leading-relaxed">
                However, intensive tasks can cause the device to warm noticeably, and we observed some 
                thermal throttling during extended gaming sessions.
              </p>
            </section>

            <ProsCons 
              pros={reviewData.prosAndCons?.pros || []}
              cons={reviewData.prosAndCons?.cons || []}
            />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Should You Upgrade?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Upgrade If</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Coming from iPhone 12 Pro or older</li>
                    <li>• Need USB-C connectivity</li>
                    <li>• Want the premium titanium build</li>
                    <li>• Heavy mobile gaming user</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Consider If</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• iPhone 13 Pro user</li>
                    <li>• Budget is a concern</li>
                    <li>• Don't need latest features</li>
                    <li>• Waiting for bigger changes</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Skip If</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• iPhone 14 Pro user</li>
                    <li>• Happy with current device</li>
                    <li>• Price is too high</li>
                    <li>• Don't use advanced features</li>
                  </ul>
                </div>
              </div>
            </section>

            {reviewData.alternatives && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Alternatives to Consider</h2>
                <div className="space-y-4">
                  {reviewData.alternatives.map((alt, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{alt.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{alt.reason}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <CitationsList sources={reviewData.sources} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <ScoreCard 
                overallScore={reviewData.score.overall}
                breakdown={reviewData.score.breakdown}
              />
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Specs</h3>
                <dl className="space-y-2 text-sm">
                  {Object.entries(reviewData.product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</dt>
                      <dd className="text-gray-900 font-medium text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">
                      ${reviewData.product.price.amount}
                    </span>
                    <p className="text-sm text-gray-600">Starting price</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {reviewData.author && (
          <AuthorBox 
            author={reviewData.author}
            publishedAt={reviewData.lastUpdated}
            lastUpdated={reviewData.lastUpdated}
          />
        )}
      </article>
    </>
  );
}