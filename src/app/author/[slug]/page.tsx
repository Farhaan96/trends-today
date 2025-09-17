import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  // GlobeAltIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import authorsData from '../../../../data/authors.json';

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

export async function generateStaticParams() {
  const authors = authorsData as Record<string, Author>;
  return Object.keys(authors).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const authors = authorsData as Record<string, Author>;
  const author = authors[params.slug];

  if (!author) {
    return {
      title: 'Author Not Found | Trends Today',
    };
  }

  return {
    title: `${author.name} - ${author.title} | Trends Today`,
    description: `Meet ${author.name}, ${author.title} at Trends Today. ${author.bio}`,
    openGraph: {
      title: `${author.name} - Technology Expert at Trends Today`,
      description: author.bio,
      type: 'profile',
      images: [author.avatar],
    },
  };
}

export default function AuthorPage({ params }: { params: { slug: string } }) {
  const authors = authorsData as Record<string, Author>;
  const author = authors[params.slug];

  if (!author) {
    notFound();
  }

  const socialLinks = [
    {
      platform: 'X',
      icon: '𝕏',
      url: author.socialMedia.twitter
        ? `https://x.com/${author.socialMedia.twitter}`
        : null,
    },
    {
      platform: 'LinkedIn',
      icon: 'in',
      url: author.socialMedia.linkedin
        ? `https://linkedin.com/in/${author.socialMedia.linkedin}`
        : null,
    },
    {
      platform: 'Email',
      icon: '✉',
      url: author.socialMedia.email
        ? `mailto:${author.socialMedia.email}`
        : null,
    },
  ].filter((link) => link.url);

  const joinYear = new Date(author.joinDate).getFullYear();
  const yearsAtTrends = new Date().getFullYear() - joinYear;

  return (
    <article className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden">
                {author.avatar ? (
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center">
                <CheckBadgeIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {author.name}
            </h1>
            <h2 className="text-xl text-blue-600 font-semibold mb-4">
              {author.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="flex items-center text-gray-800">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {author.location}
              </div>
              <div className="flex items-center text-gray-800">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {yearsAtTrends} years at Trends Today
              </div>
              <div className="flex items-center text-gray-800">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                {author.reviewCount} reviews published
              </div>
            </div>

            <p className="text-gray-900 leading-relaxed mb-6">{author.bio}</p>

            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
              About {author.name.split(' ')[0]}
            </h3>
            <div className="prose prose-slate prose-slate max-w-none">
              {author.longBio.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-900 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="w-6 h-6 mr-2 text-blue-600" />
              Credentials & Background
            </h3>
            <div className="space-y-3">
              {author.credentials.map((credential, index) => (
                <div key={index} className="flex items-start">
                  <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-900">{credential}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Reviews
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-800 text-center py-8">
                Loading recent reviews by {author.name}...
              </p>
              <div className="text-center">
                <Link
                  href="/reviews"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Reviews
                </Link>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Areas of Expertise
            </h4>
            <div className="space-y-2">
              {author.expertise.map((skill, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-900 text-sm">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Specializations
            </h4>
            <div className="flex flex-wrap gap-2">
              {author.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LanguageIcon className="w-5 h-5 mr-2" />
              Languages
            </h4>
            <div className="space-y-1">
              {author.languages.map((language, index) => (
                <div key={index} className="text-gray-900 text-sm">
                  {language}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Contact {author.name.split(' ')[0]}
            </h4>
            <p className="text-sm text-gray-800 mb-4">
              Have questions about a review or want to suggest a product for
              testing?
            </p>
            {author.socialMedia.email && (
              <a
                href={`mailto:${author.socialMedia.email}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Send Message
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
