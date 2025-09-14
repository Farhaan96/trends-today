import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheckIcon,
  ScaleIcon,
  EyeIcon,
  HeartIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  // UserGroupIcon,
  // GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Editorial Standards - Our Commitment to Trust & Transparency | Trends Today',
  description: 'Learn about Trends Today\'s editorial standards, ethics policy, independence commitment, and transparency practices that ensure trustworthy tech journalism.',
  openGraph: {
    title: 'Editorial Standards - Trust & Transparency at Trends Today',
    description: 'Our commitment to independent, ethical, and transparent tech journalism.',
    type: 'article',
  },
};

export default function EditorialStandardsPage() {
  const coreValues = [
    {
      icon: ShieldCheckIcon,
      title: "Independence",
      description: "We maintain complete editorial independence from manufacturers, advertisers, and other commercial interests.",
      details: [
        "All review units are purchased independently or borrowed without conditions",
        "No manufacturer influence on review content or scores",
        "Clear separation between editorial content and advertising",
        "Transparent disclosure of any potential conflicts of interest"
      ]
    },
    {
      icon: ScaleIcon,
      title: "Objectivity",
      description: "Our reviews are based on standardized testing, objective measurements, and consistent evaluation criteria.",
      details: [
        "Standardized testing procedures across all product categories",
        "Professional-grade testing equipment for accurate measurements",
        "Consistent scoring methodology applied fairly to all products",
        "Multiple reviewers for subjective assessments to reduce bias"
      ]
    },
    {
      icon: EyeIcon,
      title: "Transparency",
      description: "We openly share our testing methodology, funding sources, and editorial processes with our readers.",
      details: [
        "Detailed explanation of testing procedures for each category",
        "Clear disclosure of how we acquire review products",
        "Open about our revenue sources and business model",
        "Published correction and update policies"
      ]
    },
    {
      icon: HeartIcon,
      title: "Reader Focus",
      description: "Every review and recommendation is made with our readers' best interests in mind, not commercial considerations.",
      details: [
        "Honest assessments of products' strengths and weaknesses",
        "Clear guidance on who should or shouldn't buy a product",
        "No artificial promotion of products for commercial reasons",
        "Regular updates to recommendations as markets change"
      ]
    }
  ];

  const policies = [
    {
      icon: DocumentTextIcon,
      title: "Review Product Acquisition",
      content: [
        {
          subtitle: "Purchase Policy",
          text: "Whenever possible, we purchase review products at retail price using our editorial budget. This ensures we receive the same product quality as consumers and maintains our independence."
        },
        {
          subtitle: "Manufacturer Loans",
          text: "When products are borrowed from manufacturers (typically for expensive or pre-release items), we establish clear terms: no editorial influence, reasonable testing period, and return shipping at our expense."
        },
        {
          subtitle: "Gift Policy",
          text: "We do not accept products as gifts. Any unrequested products received are either returned, donated to charity, or clearly marked as such if reviewed."
        }
      ]
    },
    {
      icon: ExclamationTriangleIcon,
      title: "Conflict of Interest Policy",
      content: [
        {
          subtitle: "Financial Relationships",
          text: "We disclose any financial relationships with companies whose products we review. Our editorial team members are prohibited from owning stock in companies we regularly cover."
        },
        {
          subtitle: "Personal Relationships",
          text: "Editorial staff must disclose any personal or professional relationships that could influence their judgment of products or companies."
        },
        {
          subtitle: "Recusal Process",
          text: "Team members recuse themselves from reviews where they have conflicts of interest. Alternative reviewers are assigned to ensure objective evaluation."
        }
      ]
    },
    {
      icon: ClockIcon,
      title: "Content Update Policy",
      content: [
        {
          subtitle: "Review Updates",
          text: "We update reviews when products receive significant software updates, price changes, or when market conditions change substantially. Update dates are clearly marked."
        },
        {
          subtitle: "Correction Policy",
          text: "Errors are corrected promptly and transparently. Significant corrections are noted at the top of articles with explanation of what was changed and when."
        },
        {
          subtitle: "Recommendation Updates",
          text: "Our buying guides and recommendations are reviewed quarterly to ensure they reflect current market conditions and product availability."
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Editorial Standards
        </h1>
        <p className="text-xl text-gray-800 max-w-3xl mx-auto mb-8">
          Our commitment to independent, ethical, and transparent technology journalism. 
          These standards guide every review, comparison, and recommendation we publish.
        </p>
        
        <div className="inline-flex items-center px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <CheckBadgeIcon className="w-6 h-6 text-blue-600 mr-2" />
          <span className="text-blue-800 font-medium">Last updated: September 2024</span>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {coreValues.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="bg-white p-2 rounded-lg mr-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                  </div>
                  <p className="text-gray-900">{value.description}</p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-2">
                    {value.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-sm text-gray-900">
                        <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Editorial Policies</h2>
        
        <div className="space-y-8">
          {policies.map((policy, index) => {
            const IconComponent = policy.icon;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <IconComponent className="w-6 h-6 text-gray-800 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">{policy.title}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {policy.content.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <h4 className="font-semibold text-gray-900 mb-2">{item.subtitle}</h4>
                        <p className="text-gray-900 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Quality Assurance</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editorial Review Process</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                <div>
                  <div className="font-medium text-gray-900">Author Research & Testing</div>
                  <div className="text-sm text-gray-800">Comprehensive testing period with documented methodology</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                <div>
                  <div className="font-medium text-gray-900">Fact-Checking & Verification</div>
                  <div className="text-sm text-gray-800">Independent verification of all claims and measurements</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                <div>
                  <div className="font-medium text-gray-900">Editorial Review</div>
                  <div className="text-sm text-gray-800">Senior editor review for accuracy, clarity, and standards compliance</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">4</div>
                <div>
                  <div className="font-medium text-gray-900">Publication & Monitoring</div>
                  <div className="text-sm text-gray-800">Post-publication monitoring for reader feedback and corrections</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reader Trust Measures</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Open Corrections Policy</div>
                  <div className="text-xs text-gray-800">Errors are corrected quickly and transparently</div>
                </div>
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Reader Feedback Integration</div>
                  <div className="text-xs text-gray-800">We actively seek and respond to reader concerns</div>
                </div>
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Regular Audits</div>
                  <div className="text-xs text-gray-800">Quarterly reviews of our editorial processes and standards</div>
                </div>
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Staff Training</div>
                  <div className="text-xs text-gray-800">Ongoing training on ethics, accuracy, and best practices</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Revenue & Funding Transparency</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Affiliate Programs</h3>
              <p className="text-sm text-gray-800">
                We participate in affiliate programs with retailers. Commissions from purchases made through our links help support our editorial operations.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Display Advertising</h3>
              <p className="text-sm text-gray-800">
                We display advertisements from various technology companies. Advertisers have no influence over our editorial content or reviews.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Editorial Budget</h3>
              <p className="text-sm text-gray-800">
                Revenue funds our independent product purchases, professional testing equipment, and staff salaries to maintain editorial independence.
              </p>
            </div>
          </div>

          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> All affiliate links are clearly marked, and we only recommend products we genuinely believe provide value to our readers. 
              Our reviews and recommendations are never influenced by potential commission earnings.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Standards?</h2>
        <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
          We believe in complete transparency and welcome questions about our editorial practices. 
          If you have concerns about our coverage or suggestions for improvement, please reach out.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Contact Editorial Team
          </Link>
          <Link 
            href="/how-we-test"
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Testing Methodology
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-900">
            These editorial standards were last updated on September 7, 2024. 
            We review and update our policies regularly to ensure they reflect best practices in technology journalism.
          </p>
        </div>
      </section>
    </div>
  );
}