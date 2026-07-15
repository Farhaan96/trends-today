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
    <nav className={`pagination ${className}`} aria-label="Pagination">
      {/* Previous Page Link */}
      <div className="pagination__edge">
        {hasPrevPage ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="pagination__button"
            rel="prev"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Previous
          </Link>
        ) : (
          <span className="pagination__button is-disabled">
            <ChevronLeftIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Previous
          </span>
        )}
      </div>

      {/* Page Numbers */}
      <div className="pagination__numbers-wrap">
        <div className="pagination__numbers" role="group">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="pagination__ellipsis"
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
                className={`pagination__number ${isCurrentPage ? 'is-current' : ''}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {page}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Page Info */}
      <div className="pagination__mobile-info">
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Next Page Link */}
      <div className="pagination__edge pagination__edge--next">
        {hasNextPage ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="pagination__button"
            rel="next"
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-2" aria-hidden="true" />
          </Link>
        ) : (
          <span className="pagination__button is-disabled">
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
    <nav className={`subtle-pagination ${className}`} aria-label="All pages">
      <p>All pages</p>
      <div className="subtle-pagination__links">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={page === currentPage ? 'is-current' : ''}
            aria-label={`Go to page ${page}`}
          >
            {page}
          </Link>
        ))}
      </div>
    </nav>
  );
}
