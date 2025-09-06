import { Metadata } from 'next';
import { ClockIcon, CalendarIcon, ScaleIcon } from '@heroicons/react/24/outline';
import ComparisonTable from '@/components/content/ComparisonTable';
import CitationsList from '@/components/content/CitationsList';
import StructuredData from '@/components/seo/StructuredData';
import comparisonData from '../../../../content/comparisons/iphone-15-pro-vs-samsung-galaxy-s24.json';

export const metadata: Metadata = {
  title: comparisonData.seo?.metaTitle || comparisonData.title,
  description: comparisonData.seo?.metaDescription,
  keywords: comparisonData.seo?.keywords,
  openGraph: {
    title: comparisonData.title,
    description: comparisonData.seo?.metaDescription,
    type: 'article',
    publishedTime: comparisonData.lastUpdated,
  }
};

export default function ComparisonPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": comparisonData.title,
    "description": comparisonData.seo?.metaDescription,
    "datePublished": comparisonData.lastUpdated,
    "dateModified": comparisonData.lastUpdated,
    "author": {
      "@type": "Organization",
      "name": "Trends Today"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "Trends Today"
    },
    "about": [
      {
        "@type": "Product",
        "name": comparisonData.productA.name,
        "brand": comparisonData.productA.brand
      },
      {
        "@type": "Product",
        "name": comparisonData.productB.name,
        "brand": comparisonData.productB.brand
      }
    ]
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <article className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
              Comparison
            </span>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              12 min read
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {new Date(comparisonData.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {comparisonData.title}
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Two flagship smartphones battle it out. We compare performance, cameras, battery life, 
            and value to help you make the right choice.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{comparisonData.productA.name}</h2>
              <span className="text-2xl font-bold text-blue-600">
                ${comparisonData.productA.price.amount}
              </span>
            </div>
            
            <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-500">iPhone 15 Pro Image</span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
            <ul className="space-y-2">
              {comparisonData.productA.keyFeatures.map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{comparisonData.productB.name}</h2>
              <span className="text-2xl font-bold text-green-600">
                ${comparisonData.productB.price.amount}
              </span>
            </div>
            
            <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-500">Galaxy S24 Image</span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
            <ul className="space-y-2">
              {comparisonData.productB.keyFeatures.map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center mb-6">
            <ScaleIcon className="w-6 h-6 text-gray-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Head-to-Head Comparison</h2>
          </div>
          
          <ComparisonTable
            productAName={comparisonData.productA.name}
            productBName={comparisonData.productB.name}
            comparisons={comparisonData.comparisonTable}
          />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Verdict</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Winner: {comparisonData.verdict.winner === 'productA' 
                ? comparisonData.productA.name 
                : comparisonData.verdict.winner === 'productB'
                ? comparisonData.productB.name 
                : 'It Depends'}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {comparisonData.verdict.reasoning}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">
                Choose {comparisonData.productA.name} If You:
              </h3>
              <ul className="space-y-2">
                {comparisonData.verdict.bestFor?.productA.map((reason, index) => (
                  <li key={index} className="flex items-start text-blue-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                Choose {comparisonData.productB.name} If You:
              </h3>
              <ul className="space-y-2">
                {comparisonData.verdict.bestFor?.productB.map((reason, index) => (
                  <li key={index} className="flex items-start text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Detailed Specs Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 border-r border-gray-200">
                    Specification
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 border-r border-gray-200">
                    {comparisonData.productA.name}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">
                    {comparisonData.productB.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(comparisonData.productA.specs).map((key, index) => (
                  <tr key={key} className="border-t border-gray-200">
                    <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-200 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700 border-r border-gray-200">
                      {comparisonData.productA.specs[key as keyof typeof comparisonData.productA.specs]}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {comparisonData.productB.specs[key as keyof typeof comparisonData.productB.specs]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {comparisonData.faqs && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {comparisonData.faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Final Thoughts</h2>
          
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Both the iPhone 15 Pro and Samsung Galaxy S24 are exceptional smartphones that 
              represent the pinnacle of their respective ecosystems. Your choice should primarily 
              depend on which ecosystem you're already invested in and what features matter most to you.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              The iPhone 15 Pro justifies its premium pricing with superior build quality and 
              performance, while the Galaxy S24 offers better value and longer battery life. 
              Either choice will serve you well for years to come.
            </p>
          </div>
        </section>

        <CitationsList sources={comparisonData.sources} />
      </article>
    </>
  );
}