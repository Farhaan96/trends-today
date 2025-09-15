import {
  ArticleSchema,
  ReviewSchema,
  ProductSchema,
  OrganizationSchema,
  BreadcrumbListSchema,
  FAQPageSchema,
  LocalBusinessSchema,
  PersonSchema,
  WebSiteSchema,
} from '@/types/schema';

// Organization Schema for the site
export const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Trends Today',
  alternateName: 'Trends Today Tech Blog',
  url: 'https://trendstoday.ca',
  logo: {
    '@type': 'ImageObject',
    url: 'https://trendstoday.ca/images/logo.png',
    width: 400,
    height: 100,
  },
  description:
    'Your trusted source for in-depth tech reviews, product comparisons, and comprehensive buying guides. Stay ahead with the latest tech trends.',
  foundingDate: '2025',
  founder: {
    '@type': 'Person',
    name: 'Trends Today Editorial Team',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-800-TRENDS',
    contactType: 'customer service',
    email: 'contact@trendstoday.ca',
  },
  sameAs: [
    'https://twitter.com/trendstoday',
    'https://facebook.com/trendstoday',
    'https://linkedin.com/company/trends-today',
    'https://youtube.com/@trendstoday',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CA',
    addressRegion: 'ON',
  },
};

// Website Schema
export const websiteSchema: WebSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Trends Today',
  alternateName: 'Trends Today Tech Reviews',
  url: 'https://trendstoday.ca',
  description:
    'Your trusted source for in-depth tech reviews, product comparisons, and comprehensive buying guides.',
  publisher: organizationSchema,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://trendstoday.ca/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// Generate Article Schema
export function generateArticleSchema(data: {
  title: string;
  description: string;
  publishedAt: string;
  lastUpdated?: string;
  author: { name: string; bio?: string; avatar?: string };
  category: string;
  url: string;
  image?: string;
  wordCount?: number;
  readingTime?: number;
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.image ? [data.image] : [],
    author: {
      '@type': 'Person',
      name: data.author.name,
      description: data.author.bio,
      image: data.author.avatar,
    },
    publisher: organizationSchema,
    datePublished: data.publishedAt,
    dateModified: data.lastUpdated || data.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url,
    },
    articleSection: data.category,
    wordCount: data.wordCount,
    timeRequired: data.readingTime ? `PT${data.readingTime}M` : undefined,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };
}

// Generate Review Schema
export function generateReviewSchema(data: {
  title: string;
  description: string;
  publishedAt: string;
  lastUpdated?: string;
  author: { name: string; bio?: string; avatar?: string };
  url: string;
  image?: string;
  product: {
    name: string;
    category: string;
    brand: string;
    model: string;
    price?: string;
    currency?: string;
    availability?: string;
    sku?: string;
    gtin?: string;
    mpn?: string;
    image?: string;
    description?: string;
  };
  review: {
    rating: number;
    maxRating: number;
    worstRating?: number;
    reviewBody: string;
    pros?: string[];
    cons?: string[];
  };
}): ReviewSchema {
  const itemReviewed: any = {
    '@type': 'Product',
    name: data.product.name,
    category: data.product.category,
    brand: {
      '@type': 'Brand',
      name: data.product.brand,
    },
    model: data.product.model,
    description: data.product.description,
    sku: data.product.sku,
    gtin: data.product.gtin,
    mpn: data.product.mpn,
    offers: data.product.price
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: data.product.currency || 'USD',
          lowPrice: data.product.price.split('-')[0].replace(/[^0-9.]/g, ''),
          highPrice: data.product.price.includes('-')
            ? data.product.price.split('-')[1].replace(/[^0-9.]/g, '')
            : data.product.price.replace(/[^0-9.]/g, ''),
          availability: `https://schema.org/${data.product.availability || 'InStock'}`,
          offerCount: '5',
        }
      : undefined,
  };
  if (data.product.image) {
    itemReviewed.image = data.product.image;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: itemReviewed,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: data.review.rating,
      bestRating: data.review.maxRating,
      worstRating: data.review.worstRating || 1,
    },
    name: data.title,
    author: {
      '@type': 'Person',
      name: data.author.name,
      description: data.author.bio,
      image: data.author.avatar,
    },
    publisher: organizationSchema,
    datePublished: data.publishedAt,
    dateModified: data.lastUpdated || data.publishedAt,
    description: data.description,
    reviewBody: data.review.reviewBody,
    url: data.url,
    inLanguage: 'en-US',
    positiveNotes: data.review.pros,
    negativeNotes: data.review.cons,
  };
}

// Generate Breadcrumb Schema
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{
    name: string;
    url: string;
  }>
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Generate FAQ Schema
export function generateFAQSchema(
  faqs: Array<{
    question: string;
    answer: string;
  }>
): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate Product Schema
export function generateProductSchema(data: {
  name: string;
  description: string;
  brand: string;
  model: string;
  category: string;
  image?: string;
  price?: string;
  currency?: string;
  availability?: string;
  sku?: string;
  gtin?: string;
  mpn?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    ratingValue: number;
  }>;
}): ProductSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    brand: {
      '@type': 'Brand',
      name: data.brand,
    },
    model: data.model,
    category: data.category,
    image: data.image,
    sku: data.sku,
    gtin: data.gtin,
    mpn: data.mpn,
    offers: data.price
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: data.currency || 'USD',
          lowPrice: data.price.split('-')[0].replace(/[^0-9.]/g, ''),
          highPrice: data.price.includes('-')
            ? data.price.split('-')[1].replace(/[^0-9.]/g, '')
            : data.price.replace(/[^0-9.]/g, ''),
          availability: `https://schema.org/${data.availability || 'InStock'}`,
          offerCount: '5',
        }
      : undefined,
    aggregateRating: data.aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: data.aggregateRating.ratingValue,
          reviewCount: data.aggregateRating.reviewCount,
          bestRating: data.aggregateRating.bestRating || 5,
          worstRating: data.aggregateRating.worstRating || 1,
        }
      : undefined,
    review: data.reviews?.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.datePublished,
      reviewBody: review.reviewBody,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.ratingValue,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };
}

// Generate Person Schema (Author)
export function generatePersonSchema(data: {
  name: string;
  bio?: string;
  avatar?: string;
  url?: string;
  jobTitle?: string;
  worksFor?: string;
  sameAs?: string[];
}): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    description: data.bio,
    image: data.avatar,
    url: data.url,
    jobTitle: data.jobTitle,
    worksFor: data.worksFor ? data.worksFor : organizationSchema,
    sameAs: data.sameAs,
  };
}

// Generate Local Business Schema (if applicable)
export function generateLocalBusinessSchema(): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Trends Today',
    description: 'Tech reviews and buying guides',
    url: 'https://trendstoday.ca',
    telephone: '+1-800-TRENDS',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CA',
      addressRegion: 'ON',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.6532,
      longitude: -79.3832,
    },
    openingHours: 'Mo,Tu,We,Th,Fr,Sa,Su 00:00-23:59',
    priceRange: 'Free',
  };
}

// Helper function to combine multiple schemas
export function combineSchemas(...schemas: any[]): any {
  if (schemas.length === 1) {
    return schemas[0];
  }

  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}

// Export all schemas as a combined JSON-LD
export function getAllBaseSchemas() {
  return combineSchemas(organizationSchema, websiteSchema);
}
