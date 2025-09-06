import { UserIcon } from '@heroicons/react/24/outline';

interface Author {
  name: string;
  bio?: string;
  expertise?: string[];
  twitter?: string;
}

interface AuthorBoxProps {
  author: Author;
  publishedAt: string;
  lastUpdated?: string;
}

export default function AuthorBox({ author, publishedAt, lastUpdated }: AuthorBoxProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 my-8">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{author.name}</h3>
            {author.twitter && (
              <a
                href={`https://twitter.com/${author.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                @{author.twitter}
              </a>
            )}
          </div>
          
          {author.bio && (
            <p className="text-gray-600 text-sm mt-1">{author.bio}</p>
          )}
          
          {author.expertise && author.expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {author.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-3">
            <p>Published: {new Date(publishedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            {lastUpdated && lastUpdated !== publishedAt && (
              <p>Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}