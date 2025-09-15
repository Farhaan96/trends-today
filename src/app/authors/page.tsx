import { Metadata } from 'next';
import Link from 'next/link';
// import Image from 'next/image';
import {
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import authorsData from '../../../data/authors.json';

export const metadata: Metadata = {
  title: 'Our Editorial Team - Meet the Tech Experts | Trends Today',
  description:
    "Meet the experienced technology journalists and experts behind Trends Today's in-depth reviews and analysis. Our team brings decades of combined expertise in mobile technology, audio, computing, and smart home devices.",
  openGraph: {
    title: 'Editorial Team - Technology Experts at Trends Today',
    description:
      'Meet our team of experienced technology journalists and industry experts.',
    type: 'website',
  },
};

interface Author {
  id: string;
  name: string;
  title: string;
  bio: string;
  longBio: string;
  expertise: string[];
  credentials: string[];
  socialMedia: {
    twitter?: string;
    linkedin?: string;
    email?: string;
    [key: string]: string | undefined;
  };
  avatar: string;
  specializations: string[];
  reviewCount: number;
  joinDate: string;
  location: string;
  languages: string[];
}

export default function AuthorsPage() {
  const authors = Object.values(authorsData as Record<string, Author>);

  const totalReviews = authors.reduce(
    (sum, author) => sum + author.reviewCount,
    0
  );
  const totalExperience = authors.reduce((sum, author) => {
    const yearsMatch = author.bio.match(/(\d+)\s*years?/i);
    return sum + (yearsMatch ? parseInt(yearsMatch[1]) : 0);
  }, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Our Editorial Team
        </h1>
        <p className="text-xl text-gray-800 max-w-3xl mx-auto mb-8">
          Meet the experienced technology journalists and industry experts who
          bring you in-depth reviews, comprehensive testing, and trustworthy
          recommendations.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {totalExperience}+
            </div>
            <div className="text-sm text-gray-800">
              Combined Years of Experience
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {totalReviews}+
            </div>
            <div className="text-sm text-gray-800">Published Reviews</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {authors.length}
            </div>
            <div className="text-sm text-gray-800">Expert Reviewers</div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {authors.map((author) => {
          const _joinYear = new Date(author.joinDate).getFullYear();
          // const yearsAtTrends = new Date().getFullYear() - joinYear;

          return (
            <div
              key={author.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <UserIcon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                        <CheckBadgeIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {author.name}
                    </h3>
                    <p className="text-blue-600 font-semibold text-sm mb-3">
                      {author.title}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-800">
                      <div className="flex items-center">
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        {author.location}
                      </div>
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-3 h-3 mr-1" />
                        {author.reviewCount} reviews
                      </div>
                    </div>

                    <p className="text-gray-800 text-sm leading-relaxed mb-4 line-clamp-3">
                      {author.bio}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {author.expertise.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900"
                        >
                          {skill}
                        </span>
                      ))}
                      {author.expertise.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                          +{author.expertise.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-900">
                        <AcademicCapIcon className="w-3 h-3 mr-1" />
                        {author.credentials.length} credentials
                      </div>
                      <Link
                        href={`/author/${author.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Trust Our Reviews?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Industry Expertise
            </h3>
            <p className="text-sm text-gray-800">
              Our team includes former engineers from Apple, Samsung, Google,
              and other leading tech companies.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckBadgeIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Rigorous Testing
            </h3>
            <p className="text-sm text-gray-800">
              Every product undergoes weeks of real-world testing using
              professional equipment and standardized methodologies.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Transparent Process
            </h3>
            <p className="text-sm text-gray-800">
              We document our testing methodology, cite our sources, and
              maintain editorial independence from manufacturers.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/how-we-test"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Learn About Our Testing Process
          </Link>
        </div>
      </section>
    </div>
  );
}
