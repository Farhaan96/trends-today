import { Article } from './content';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPageUrl?: string;
  prevPageUrl?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationInfo;
}

export const ITEMS_PER_PAGE = 12;

/**
 * Paginate an array of items with full pagination metadata
 */
export function paginateItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number = ITEMS_PER_PAGE,
  baseUrl: string = ''
): PaginatedResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const hasNextPage = validCurrentPage < totalPages;
  const hasPrevPage = validCurrentPage > 1;

  return {
    items: paginatedItems,
    pagination: {
      currentPage: validCurrentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage,
      hasPrevPage,
      nextPageUrl: hasNextPage ? `${baseUrl}/page/${validCurrentPage + 1}` : undefined,
      prevPageUrl: hasPrevPage
        ? validCurrentPage === 2
          ? baseUrl || '/'
          : `${baseUrl}/page/${validCurrentPage - 1}`
        : undefined,
    },
  };
}

/**
 * Generate pagination metadata for Next.js head
 */
export function generatePaginationMetadata(
  pagination: PaginationInfo,
  baseUrl: string,
  title: string
) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  const metadata: any = {
    title: currentPage === 1 ? title : `${title} - Page ${currentPage}`,
    alternates: {
      canonical: currentPage === 1 ? baseUrl : `${baseUrl}/page/${currentPage}`,
    },
  };

  // Add prev/next links for pagination
  if (hasNextPage || hasPrevPage) {
    metadata.other = {};

    if (hasPrevPage) {
      metadata.other['prev'] = currentPage === 2 ? baseUrl : `${baseUrl}/page/${currentPage - 1}`;
    }

    if (hasNextPage) {
      metadata.other['next'] = `${baseUrl}/page/${currentPage + 1}`;
    }
  }

  return metadata;
}

/**
 * Generate page numbers for pagination navigation
 */
export function generatePageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  // Always show first page
  pages.push(1);

  if (currentPage <= 4) {
    // Near the beginning
    pages.push(2, 3, 4, 5, '...', totalPages);
  } else if (currentPage >= totalPages - 3) {
    // Near the end
    pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    // In the middle
    pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  }

  return pages;
}

/**
 * Build URLs for different pagination contexts
 */
export function buildPaginationUrls(baseUrl: string, totalPages: number) {
  const urls: string[] = [];

  for (let page = 1; page <= totalPages; page++) {
    if (page === 1) {
      urls.push(baseUrl || '/');
    } else {
      urls.push(`${baseUrl}/page/${page}`);
    }
  }

  return urls;
}

/**
 * Validate page parameter from URL
 */
export function validatePageParam(pageParam: string | undefined): number {
  if (!pageParam) return 1;

  const page = parseInt(pageParam, 10);
  return isNaN(page) || page < 1 ? 1 : page;
}

/**
 * Generate sitemap entries for paginated content
 */
export function generatePaginationSitemapEntries(
  baseUrl: string,
  totalPages: number,
  priority: number = 0.7,
  changefreq: string = 'daily'
) {
  const entries = [];

  for (let page = 1; page <= totalPages; page++) {
    const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
    const pagePriority = page === 1 ? priority : Math.max(0.3, priority - (page - 1) * 0.1);

    entries.push({
      url,
      lastModified: new Date(),
      changeFrequency: changefreq,
      priority: Math.round(pagePriority * 10) / 10,
    });
  }

  return entries;
}