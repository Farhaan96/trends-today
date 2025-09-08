import { Metadata } from 'next';
import Link from 'next/link';
import { 
  BeakerIcon,
  ClockIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  HomeIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  CpuChipIcon,
  CameraIcon,
  Battery0Icon as BatteryIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'How We Test - Our Rigorous Review Methodology | Trends Today',
  description: 'Learn about Trends Today\'s comprehensive testing methodology, professional equipment, standardized procedures, and rigorous evaluation process that ensures trustworthy tech reviews.',
  openGraph: {
    title: 'How We Test - Professional Tech Review Methodology',
    description: 'Discover the rigorous testing process behind our trusted tech reviews.',
    type: 'article',
  },
};

export default function HowWeTestPage() {
  const testingCategories = [
    {
      icon: DevicePhoneMobileIcon,
      title: "Smartphone Testing",
      duration: "14-21 days",
      description: "Comprehensive real-world testing as primary device",
      tests: [
        "Battery life measurement (5 standardized scenarios)",
        "Performance benchmarking (Geekbench, 3DMark, AnTuTu)", 
        "Camera testing (50+ scenarios across lighting conditions)",
        "Display analysis (color accuracy, brightness, refresh rate)",
        "Build quality assessment (materials, durability)",
        "Thermal performance monitoring",
        "Network connectivity testing (5G, WiFi, Bluetooth)"
      ],
      equipment: [
        "Professional light meters and color calibrators",
        "Thermal imaging camera (FLIR E8-XT)",
        "Battery testing equipment (precision power meters)",
        "Anechoic chamber for audio testing",
        "Network analyzers for connectivity testing"
      ]
    },
    {
      icon: ComputerDesktopIcon,
      title: "Laptop Testing",
      duration: "21-28 days",
      description: "Productivity-focused testing with real workflows",
      tests: [
        "Performance benchmarking (Cinebench, Blender, PCMark)",
        "Battery life testing (video playback, productivity, gaming)",
        "Thermal testing under sustained loads",
        "Display quality measurement (color gamut, accuracy)",
        "Keyboard and trackpad evaluation",
        "Port and connectivity testing",
        "Build quality and durability assessment"
      ],
      equipment: [
        "Spyder X Pro color calibrator",
        "Sound level meter for fan noise testing",
        "Thermal probes and monitoring software",
        "Professional benchmark suite",
        "High-precision scales for weight verification"
      ]
    },
    {
      icon: SpeakerWaveIcon,
      title: "Audio Testing",
      duration: "7-14 days",
      description: "Objective measurement combined with subjective evaluation",
      tests: [
        "Frequency response measurement (20Hz-20kHz)",
        "THD+N analysis at various volume levels",
        "Noise isolation/cancellation effectiveness",
        "Spatial audio and soundstage evaluation",
        "Comfort testing (extended wear sessions)",
        "Latency measurement (wireless products)",
        "Battery life testing (wireless products)"
      ],
      equipment: [
        "Audio Precision APx525 analyzer",
        "HEAD acoustics artificial head (HATS)",
        "Anechoic chamber for accurate measurements",
        "Calibrated microphones and measurement rigs",
        "Professional audio interfaces and monitors"
      ]
    },
    {
      icon: HomeIcon,
      title: "Smart Home Testing",
      duration: "14-30 days",
      description: "Long-term reliability and integration testing",
      tests: [
        "Setup and onboarding process evaluation",
        "Cross-platform compatibility testing",
        "Network reliability and range testing",
        "Privacy and security assessment",
        "Integration with major ecosystems",
        "Response time and accuracy measurement",
        "Long-term reliability monitoring"
      ],
      equipment: [
        "Multiple smart home ecosystems (HomeKit, Alexa, Google)",
        "Network analyzers and WiFi testing equipment",
        "Security testing tools and frameworks",
        "Environmental sensors for automation testing",
        "Professional networking equipment"
      ]
    }
  ];

  const scoringCriteria = [
    {
      category: "Design & Build Quality",
      weight: "20%",
      factors: [
        "Materials and construction quality",
        "Fit, finish, and attention to detail", 
        "Ergonomics and usability",
        "Durability and long-term reliability"
      ]
    },
    {
      category: "Performance",
      weight: "30%",
      factors: [
        "Benchmark scores and real-world performance",
        "Thermal management and throttling",
        "Multitasking and memory management",
        "Gaming and graphics performance (where applicable)"
      ]
    },
    {
      category: "Features & Functionality",
      weight: "25%",
      factors: [
        "Core feature implementation and reliability",
        "Software experience and user interface",
        "Unique features and innovations",
        "Ecosystem integration and compatibility"
      ]
    },
    {
      category: "Value for Money",
      weight: "25%",
      factors: [
        "Price competitiveness in market segment",
        "Feature set relative to price point",
        "Build quality and materials for the price",
        "Long-term value and upgrade path"
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          How We Test
        </h1>
        <p className="text-xl text-gray-800 max-w-3xl mx-auto mb-8">
          Our rigorous testing methodology ensures every review is thorough, objective, 
          and trustworthy. Here's exactly how we evaluate every product that comes through our lab.
        </p>
        
        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-600">2-4 Weeks</div>
            <div className="text-sm text-gray-800">Average Testing Period</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <BeakerIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-600">50+ Tests</div>
            <div className="text-sm text-gray-800">Per Product Category</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <CheckBadgeIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-600">100% Independent</div>
            <div className="text-sm text-gray-800">No Manufacturer Influence</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <DocumentTextIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-orange-600">Full Transparency</div>
            <div className="text-sm text-gray-800">Published Methodology</div>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Testing Philosophy</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Real-World Focus</h3>
            <p className="text-gray-800 text-sm">
              We test products the way you'll actually use them, not just in synthetic benchmarks. 
              Our reviewers use devices as their primary tools for weeks to understand real-world performance.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Standardized Methods</h3>
            <p className="text-gray-800 text-sm">
              Every product category follows standardized testing procedures, ensuring consistency 
              and allowing meaningful comparisons between similar products.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Equipment</h3>
            <p className="text-gray-800 text-sm">
              We invest in professional-grade testing equipment used by manufacturers and certification labs, 
              providing measurements you can trust.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Category-Specific Testing</h2>
        
        <div className="space-y-8">
          {testingCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{category.title}</h3>
                      <p className="text-gray-800 mb-2">{category.description}</p>
                      <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {category.duration} testing period
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Testing Procedures</h4>
                      <ul className="space-y-2">
                        {category.tests.map((test, testIndex) => (
                          <li key={testIndex} className="flex items-start text-sm text-gray-900">
                            <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {test}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Professional Equipment</h4>
                      <ul className="space-y-2">
                        {category.equipment.map((equipment, equipIndex) => (
                          <li key={equipIndex} className="flex items-start text-sm text-gray-900">
                            <BeakerIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            {equipment}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Scoring Methodology</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Our 5.0 Rating System</h3>
          <p className="text-gray-900 mb-6">
            Each product receives scores in four key categories, weighted to reflect their importance 
            to the average user. The overall score is calculated using these weighted averages.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scoringCriteria.map((criteria, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm">{criteria.category}</h4>
                  <span className="text-blue-600 font-bold text-sm">{criteria.weight}</span>
                </div>
                <ul className="space-y-1">
                  {criteria.factors.map((factor, factorIndex) => (
                    <li key={factorIndex} className="text-xs text-gray-800">
                      • {factor}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">1.0-1.9</div>
            <div className="text-sm text-red-700 font-medium">Poor</div>
            <div className="text-xs text-gray-800">Significant flaws</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">2.0-2.9</div>
            <div className="text-sm text-orange-700 font-medium">Fair</div>
            <div className="text-xs text-gray-800">Below expectations</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">3.0-3.9</div>
            <div className="text-sm text-yellow-700 font-medium">Good</div>
            <div className="text-xs text-gray-800">Meets expectations</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">4.0-4.9</div>
            <div className="text-sm text-green-700 font-medium">Excellent</div>
            <div className="text-xs text-gray-800">Exceeds expectations</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">5.0</div>
            <div className="text-sm text-blue-700 font-medium">Outstanding</div>
            <div className="text-xs text-gray-800">Best in class</div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Quality Assurance</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Process</h3>
            <div className="space-y-3 text-sm text-gray-900">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
                <span>Initial product evaluation and setup</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
                <span>Comprehensive testing period (2-4 weeks)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</div>
                <span>Data analysis and verification</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</div>
                <span>Draft review writing and fact-checking</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">5</div>
                <span>Editorial review and final approval</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editorial Standards</h3>
            <ul className="space-y-2 text-sm text-gray-900">
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                All products purchased independently or loaned without conditions
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                No influence from manufacturers on review content
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Transparent disclosure of any potential conflicts
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Regular updates to reviews when products receive updates
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Correction policy for any errors or changes
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Have Questions About Our Testing?</h2>
        <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
          We believe in complete transparency. If you have questions about our testing methodology 
          or want to suggest improvements, we'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/editorial-standards"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Editorial Standards
          </Link>
          <Link 
            href="/authors"
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Meet Our Team
          </Link>
        </div>
      </section>
    </div>
  );
}