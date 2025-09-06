import { Metadata } from 'next';
import Link from 'next/link';
import { ClockIcon, CalendarIcon, TrophyIcon, CheckIcon } from '@heroicons/react/24/outline';
import ScoreCard from '@/components/content/ScoreCard';
import CitationsList from '@/components/content/CitationsList';
import StructuredData from '@/components/seo/StructuredData';
import buyingGuideData from '../../../../../content/best/best-smartphones-2025.json';

export const metadata: Metadata = {
  title: buyingGuideData.seo?.metaTitle || buyingGuideData.title,
  description: buyingGuideData.seo?.metaDescription,
  keywords: buyingGuideData.seo?.keywords,
  openGraph: {
    title: buyingGuideData.title,
    description: buyingGuideData.seo?.metaDescription,
    type: 'article',
    publishedTime: buyingGuideData.lastUpdated,
  }
};

export default function BuyingGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": buyingGuideData.title,
    "description": buyingGuideData.seo?.metaDescription,
    "datePublished": buyingGuideData.lastUpdated,
    "dateModified": buyingGuideData.lastUpdated,
    "author": {
      "@type": "Organization",
      "name": "Trends Today"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Trends Today"
    },
    "about": {
      "@type": "Product",
      "category": buyingGuideData.category
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500';  
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default: return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <article className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-12">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              Buying Guide
            </span>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              15 min read
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {new Date(buyingGuideData.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {buyingGuideData.title}
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
            {buyingGuideData.introduction}
          </p>
        </header>

        <section className="mb-12">
          <div className="flex items-center mb-6">
            <TrophyIcon className="w-6 h-6 text-yellow-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Our Top Picks</h2>
          </div>
          
          <div className="grid gap-8">
            {buyingGuideData.recommendations.map((rec, index) => (
              <div key={rec.rank} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                  <div className={`absolute top-4 left-4 w-12 h-12 ${getRankColor(rec.rank)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    #{rec.rank}
                  </div>
                  
                  <div className="grid lg:grid-cols-3 gap-6 p-6">
                    <div className="lg:col-span-2">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {rec.product.name}
                          </h3>
                          <span className="text-2xl font-bold text-green-600">
                            ${rec.product.price.amount}
                          </span>
                        </div>
                        <p className="text-lg text-blue-600 font-semibold">
                          {rec.category}
                        </p>
                      </div>

                      <div className="bg-gray-200 h-48 rounded-lg mb-6 flex items-center justify-center">
                        <span className="text-gray-500">{rec.product.name} Image</span>
                      </div>

                      <div className="mb-6">
                        <p className="text-gray-700 text-lg leading-relaxed">
                          {rec.verdict.summary}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                            Best For
                          </h4>
                          <ul className="space-y-1">
                            {rec.verdict.bestFor.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Key Specs</h4>
                          <dl className="space-y-1 text-sm">
                            {Object.entries(rec.product.keySpecs).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <dt className="text-gray-600 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </dt>
                                <dd className="text-gray-900 font-medium">{value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 italic">
                          <strong>Testing Notes:</strong> {rec.testingNotes}
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-1">
                      <ScoreCard 
                        overallScore={rec.score.overall}
                        breakdown={rec.score.breakdown}
                      />
                      
                      <div className="mt-6 space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-800 mb-2">Pros</h4>
                          <ul className="space-y-1">
                            {rec.verdict.pros?.map((pro, idx) => (
                              <li key={idx} className="text-sm text-green-700 flex items-start">
                                <CheckIcon className="w-3 h-3 mt-0.5 mr-2 flex-shrink-0 text-green-600" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-red-800 mb-2">Cons</h4>
                          <ul className="space-y-1">
                            {rec.verdict.cons?.map((con, idx) => (
                              <li key={idx} className="text-sm text-red-700 flex items-start">
                                <span className="w-3 h-3 mt-0.5 mr-2 flex-shrink-0 text-red-600">×</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What to Look For</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {buyingGuideData.buyingCriteria?.map((criteria, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {criteria.factor}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImportanceColor(criteria.importance)}`}>
                    {criteria.importance} priority
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {criteria.explanation}
                </p>
                
                {criteria.tips && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tips:</h4>
                    <ul className="space-y-1">
                      {criteria.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Budget Breakdown</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Budget ({buyingGuideData.budgetBreakdown?.budget?.range})
              </h3>
              <ul className="space-y-2">
                {buyingGuideData.budgetBreakdown?.budget?.recommendations.map((rec, index) => (
                  <li key={index} className="text-green-700 flex items-start">
                    <CheckIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                Mid-Range ({buyingGuideData.budgetBreakdown?.midRange?.range})
              </h3>
              <ul className="space-y-2">
                {buyingGuideData.budgetBreakdown?.midRange?.recommendations.map((rec, index) => (
                  <li key={index} className="text-blue-700 flex items-start">
                    <CheckIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-800 mb-3">
                Premium ({buyingGuideData.budgetBreakdown?.premium?.range})
              </h3>
              <ul className="space-y-2">
                {buyingGuideData.budgetBreakdown?.premium?.recommendations.map((rec, index) => (
                  <li key={index} className="text-purple-700 flex items-start">
                    <CheckIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-purple-600" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How We Tested</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed">
              {buyingGuideData.howWeTested}
            </p>
          </div>
        </section>

        {buyingGuideData.frequentlyAskedQuestions && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {buyingGuideData.frequentlyAskedQuestions.map((faq, index) => (
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

        <section className="mb-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            🔄 When We'll Update This Guide
          </h2>
          <p className="text-yellow-700">
            This guide will be updated when significant new smartphones are released or 
            major price changes occur. Next scheduled update: {' '}
            <strong>
              {new Date(buyingGuideData.nextUpdate || '').toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </strong>
          </p>
        </section>

        <CitationsList sources={buyingGuideData.sources} />
      </article>
    </>
  );
}