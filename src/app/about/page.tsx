import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Trends Today | Independent Tech Reviews & Analysis',
  description: 'Learn about Trends Today - your trusted source for independent tech reviews, in-depth analysis, and comprehensive buying guides.',
};

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Trends Today</h1>

        <div className="prose prose-lg max-w-none text-gray-900">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Trends Today is an independent technology publication dedicated to providing honest,
              in-depth reviews and analysis of the latest tech products and trends. We believe in
              putting readers first with unbiased content that helps you make informed decisions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What We Do</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">🔬 Independent Testing</h3>
                <p className="text-gray-700">
                  We purchase products with our own funds and test them rigorously in real-world
                  conditions. No cherry-picked review units, no biased coverage.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">📊 Data-Driven Analysis</h3>
                <p className="text-gray-700">
                  Our reviews are backed by comprehensive testing data, benchmarks, and comparative
                  analysis to give you the complete picture.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">💡 Expert Insights</h3>
                <p className="text-gray-700">
                  Our team of technology experts brings years of experience in various fields,
                  from consumer electronics to enterprise software.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span><strong>Independence:</strong> We maintain editorial independence from manufacturers and advertisers</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span><strong>Transparency:</strong> We clearly disclose affiliate relationships and potential conflicts of interest</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span><strong>Accuracy:</strong> We fact-check our content and correct errors promptly when identified</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span><strong>Reader-First:</strong> Your needs and interests always come before commercial considerations</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How We Make Money</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Trends Today is supported through affiliate commissions. When you purchase products
              through our links, we may earn a commission at no additional cost to you. This helps
              us maintain our independence and continue providing free, high-quality content.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Important:</strong> Our editorial content is never influenced by commercial
              relationships. Products are reviewed based solely on their merits, and negative
              reviews are published regardless of potential commission loss.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              Have questions, feedback, or suggestions? We'd love to hear from you.
              Visit our <a href="/contact" className="text-blue-600 hover:text-blue-800 underline">contact page</a> to get in touch.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}