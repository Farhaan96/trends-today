import Link from 'next/link';
import { generateRelatedLinks, generateClusterLinks, InternalLink } from '@/lib/internal-linking';

interface RelatedContentProps {
  category: string;
  tags?: string[];
  currentUrl: string;
  title?: string;
  maxItems?: number;
  showClusterLinks?: boolean;
}

export default function RelatedContent({
  category,
  tags = [],
  currentUrl,
  title = "Related Articles",
  maxItems = 6,
  showClusterLinks = true
}: RelatedContentProps) {
  // Generate related links
  const relatedLinks = generateRelatedLinks(category, tags, currentUrl, maxItems);
  const clusterLinks = showClusterLinks ? generateClusterLinks(currentUrl) : [];
  
  // Combine and deduplicate links
  const allLinks = [...clusterLinks, ...relatedLinks];
  const uniqueLinks = allLinks.filter((link, index, self) => 
    index === self.findIndex(l => l.url === link.url)
  ).slice(0, maxItems);

  if (uniqueLinks.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueLinks.map((link, index) => (
          <RelatedArticleCard key={index} link={link} />
        ))}
      </div>
    </div>
  );
}

interface RelatedArticleCardProps {
  link: InternalLink;
}

function RelatedArticleCard({ link }: RelatedArticleCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'review':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'comparison':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
          </svg>
        );
      case 'guide':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 12.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-4.586L3.293 7.707A1 1 0 013 7V5z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'review': return 'text-green-600 bg-green-100';
      case 'comparison': return 'text-blue-600 bg-blue-100'; 
      case 'guide': return 'text-purple-600 bg-purple-100';
      case 'news': return 'text-red-600 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <Link href={link.url} className="group block">
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full hover:shadow-md transition-shadow duration-200 hover:border-blue-300">
        <div className="flex items-center mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(link.type)}`}>
            {getTypeIcon(link.type)}
            {link.type.charAt(0).toUpperCase() + link.type.slice(1)}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-2">
          {link.text}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-900">
          <span className="line-clamp-1">{link.context}</span>
          <svg className="w-4 h-4 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// Inline related links component for within content
interface InlineRelatedLinksProps {
  currentUrl: string;
  maxLinks?: number;
  className?: string;
}

export function InlineRelatedLinks({ 
  currentUrl, 
  maxLinks = 3,
  className = "my-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"
}: InlineRelatedLinksProps) {
  const clusterLinks = generateClusterLinks(currentUrl).slice(0, maxLinks);
  
  if (clusterLinks.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h4 className="font-semibold text-blue-900 mb-2">📖 Related Reading:</h4>
      <ul className="space-y-1">
        {clusterLinks.map((link, index) => (
          <li key={index}>
            <Link 
              href={link.url}
              className="text-blue-700 hover:text-blue-900 hover:underline text-sm font-medium"
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Topic cluster navigation component
interface TopicClusterNavProps {
  currentUrl: string;
  title?: string;
}

export function TopicClusterNav({ 
  currentUrl, 
  title = "Complete Guide Series"
}: TopicClusterNavProps) {
  const clusterLinks = generateClusterLinks(currentUrl);
  
  if (clusterLinks.length === 0) {
    return null;
  }

  // Find pillar page
  const pillarPage = clusterLinks.find(link => link.relevanceScore === 100);
  const clusterPages = clusterLinks.filter(link => link.relevanceScore !== 100);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 my-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {title}
      </h3>

      {pillarPage && (
        <div className="mb-4 p-3 bg-white border border-blue-300 rounded-lg">
          <div className="flex items-center mb-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
              📚 Main Guide
            </span>
          </div>
          <Link 
            href={pillarPage.url}
            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
          >
            {pillarPage.text}
          </Link>
        </div>
      )}

      {clusterPages.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Related Topics:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {clusterPages.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                className="flex items-center p-2 bg-white border border-gray-200 rounded hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mr-2 ${getTypeColor(link.type)}`}>
                  {getTypeIcon(link.type)}
                </span>
                <span className="text-sm font-medium text-gray-900 hover:text-blue-700 line-clamp-1">
                  {link.text}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  function getTypeIcon(type: string) {
    switch (type) {
      case 'review':
        return '📝';
      case 'comparison':
        return '⚖️';
      case 'guide':
        return '📋';
      default:
        return '📄';
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'review': return 'text-green-700 bg-green-100';
      case 'comparison': return 'text-blue-700 bg-blue-100'; 
      case 'guide': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-900 bg-gray-100';
    }
  }
}

// Breadcrumb navigation with SEO optimization
interface BreadcrumbsProps {
  items: Array<{
    name: string;
    url: string;
  }>;
  className?: string;
}

export function Breadcrumbs({ items, className = "mb-6" }: BreadcrumbsProps) {
  if (items.length <= 1) {
    return null;
  }

  return (
    <nav className={className} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-gray-800">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 mx-2 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {index === items.length - 1 ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}