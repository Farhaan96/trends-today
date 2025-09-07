interface Source {
  title: string;
  url: string;
  publisher?: string;
  accessDate?: string;
}

interface CitationsListProps {
  sources: Source[];
}

export default function CitationsList({ sources }: CitationsListProps) {
  return (
    <div className="bg-gray-50 border-l-4 border-blue-500 p-6 my-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources</h3>
      <ol className="space-y-2">
        {sources.map((source, index) => (
          <li key={index} className="text-sm">
            <span className="font-medium text-gray-900">
              {index + 1}.{' '}
            </span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {source.title}
            </a>
            {source.publisher && (
              <span className="text-gray-800"> - {source.publisher}</span>
            )}
            {source.accessDate && (
              <span className="text-gray-700 text-xs">
                {' '}(Accessed: {source.accessDate})
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}