import Link from 'next/link';
import { PaginationInfo, generatePageNumbers } from '@/lib/pagination';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationLinksProps {
  pagination: PaginationInfo;
  baseUrl: string;
  className?: string;
  showIfSinglePage?: boolean;
}

export default function PaginationLinks({
  pagination,
  baseUrl,
  className = '',
  showIfSinglePage = false,
}: PaginationLinksProps) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  // Don't show pagination if there's only one page (unless forced)
  if (totalPages <= 1 && !showIfSinglePage) {
    return null;
  }

  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  const getPageUrl = (page: number) => {
    if (page === 1) {
      return baseUrl || '/';
    }
    return `${baseUrl}/page/${page}`;
  };

  return (
    <nav
      className={`flex items-center justify-between border-t border-gray-200 pt-6 ${className}`}
      aria-label="Pagination"
    >
      {/* Previous Page Link */}
      <div className="flex flex-1 justify-start">
        {hasPrevPage ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
            rel="prev"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Previous
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed">
            <ChevronLeftIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Previous
          </span>
        )}
      </div>

      {/* Page Numbers */}
      <div className="hidden md:flex">
        <div
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          role="group"
        >
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300"
                >
                  ...
                </span>
              );
            }

            const page = pageNum as number;
            const isCurrentPage = page === currentPage;
            const url = getPageUrl(page);

            return (
              <Link
                key={page}
                href={url}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border transition-colors ${
                  isCurrentPage
                    ? 'z-10 bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                } ${index === 0 ? 'rounded-l-md' : ''} ${
                  index === pageNumbers.length - 1 ? 'rounded-r-md' : ''
                }`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {page}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Page Info */}
      <div className="flex md:hidden">
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Next Page Link */}
      <div className="flex flex-1 justify-end">
        {hasNextPage ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
            rel="next"
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-2" aria-hidden="true" />
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed">
            Next
            <ChevronRightIcon className="h-4 w-4 ml-2" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}

/**
 * Subtle pagination links for footer or sidebar
 * These are specifically for crawlers and don't interfere with UX
 */
export function SubtlePaginationLinks({
  pagination,
  baseUrl,
  className = '',
}: PaginationLinksProps) {
  const { currentPage, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const getPageUrl = (page: number) => {
    if (page === 1) {
      return baseUrl || '/';
    }
    return `${baseUrl}/page/${page}`;
  };

  return (
    <nav
      className={`text-xs text-gray-400 ${className}`}
      aria-label="All pages"
    >
      <p className="mb-2 text-gray-500">All pages:</p>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={`px-2 py-1 rounded transition-colors ${
              page === currentPage
                ? 'bg-gray-200 text-gray-700 font-medium'
                : 'hover:bg-gray-100 hover:text-gray-600'
            }`}
            aria-label={`Go to page ${page}`}
          >
            {page}
          </Link>
        ))}
      </div>
    </nav>
  );
}
