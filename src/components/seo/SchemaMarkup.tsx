import Script from 'next/script';

interface SchemaMarkupProps {
  schema: any;
  id?: string;
}

export default function SchemaMarkup({ schema, id }: SchemaMarkupProps) {
  return (
    <Script
      id={id || 'schema-markup'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
      strategy="beforeInteractive"
    />
  );
}

// Article Schema Component
interface ArticleSchemaProps {
  title: string;
  description: string;
  publishedAt: string;
  lastUpdated?: string;
  author: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  category: string;
  url: string;
  image?: string;
  wordCount?: number;
  readingTime?: number;
  keywords?: string[];
}

export function ArticleSchema({
  title,
  description,
  publishedAt,
  lastUpdated,
  author,
  category,
  url,
  image,
  wordCount,
  readingTime,
  keywords
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image ? [image] : [],
    "author": {
      "@type": "Person",
      "name": author.name,
      "description": author.bio,
      "image": author.avatar
    },
    "publisher": {
      "@type": "Organization",
      "name": "Trends Today",
      "logo": {
        "@type": "ImageObject",
        "url": "https://trendstoday.ca/images/logo.png"
      }
    },
    "datePublished": publishedAt,
    "dateModified": lastUpdated || publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleSection": category,
    "wordCount": wordCount,
    "timeRequired": readingTime ? `PT${readingTime}M` : undefined,
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "keywords": keywords?.join(', ')
  };

  return <SchemaMarkup schema={schema} id="article-schema" />;
}

// Review Schema Component
interface ReviewSchemaProps {
  title: string;
  description: string;
  publishedAt: string;
  lastUpdated?: string;
  author: {
    name: string;
    bio?: string;
    avatar?: string;
  };
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
    image?: string;
    description?: string;
  };
  review: {
    rating: number;
    maxRating: number;
    reviewBody: string;
    pros?: string[];
    cons?: string[];
  };
}

export function ReviewSchema({
  title,
  description,
  publishedAt,
  lastUpdated,
  author,
  url,
  image,
  product,
  review
}: ReviewSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": product.name,
      "category": product.category,
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "model": product.model,
      "description": product.description,
      "image": product.image,
      "offers": product.price ? {
        "@type": "AggregateOffer",
        "priceCurrency": product.currency || "USD",
        "lowPrice": product.price.split('-')[0].replace(/[^0-9.]/g, ''),
        "highPrice": product.price.includes('-') ? 
          product.price.split('-')[1].replace(/[^0-9.]/g, '') : 
          product.price.replace(/[^0-9.]/g, ''),
        "availability": `https://schema.org/${product.availability || 'InStock'}`,
        "offerCount": "5"
      } : undefined
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": review.maxRating,
      "worstRating": 1
    },
    "name": title,
    "author": {
      "@type": "Person",
      "name": author.name,
      "description": author.bio,
      "image": author.avatar
    },
    "publisher": {
      "@type": "Organization",
      "name": "Trends Today",
      "logo": {
        "@type": "ImageObject",
        "url": "https://trendstoday.ca/images/logo.png"
      }
    },
    "datePublished": publishedAt,
    "dateModified": lastUpdated || publishedAt,
    "description": description,
    "reviewBody": review.reviewBody,
    "url": url,
    "inLanguage": "en-US",
    "positiveNotes": review.pros,
    "negativeNotes": review.cons
  };

  return <SchemaMarkup schema={schema} id="review-schema" />;
}

// Product Schema Component
interface ProductSchemaProps {
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
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export function ProductSchema({
  name,
  description,
  brand,
  model,
  category,
  image,
  price,
  currency = "USD",
  availability = "InStock",
  sku,
  aggregateRating
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "model": model,
    "category": category,
    "image": image,
    "sku": sku,
    "offers": price ? {
      "@type": "AggregateOffer",
      "priceCurrency": currency,
      "lowPrice": price.split('-')[0].replace(/[^0-9.]/g, ''),
      "highPrice": price.includes('-') ? 
        price.split('-')[1].replace(/[^0-9.]/g, '') : 
        price.replace(/[^0-9.]/g, ''),
      "availability": `https://schema.org/${availability}`,
      "offerCount": "5"
    } : undefined,
    "aggregateRating": aggregateRating ? {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": 5,
      "worstRating": 1
    } : undefined
  };

  return <SchemaMarkup schema={schema} id="product-schema" />;
}

// Breadcrumb Schema Component
interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return <SchemaMarkup schema={schema} id="breadcrumb-schema" />;
}

// FAQ Schema Component
interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return <SchemaMarkup schema={schema} id="faq-schema" />;
}

// Organization Schema Component  
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Trends Today",
    "alternateName": "Trends Today Tech Blog",
    "url": "https://trendstoday.ca",
    "logo": {
      "@type": "ImageObject",
      "url": "https://trendstoday.ca/images/logo.png",
      "width": 400,
      "height": 100
    },
    "description": "Your trusted source for in-depth tech reviews, product comparisons, and comprehensive buying guides. Stay ahead with the latest tech trends.",
    "foundingDate": "2025",
    "founder": {
      "@type": "Person",
      "name": "Trends Today Editorial Team"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-TRENDS",
      "contactType": "customer service",
      "email": "contact@trendstoday.ca"
    },
    "sameAs": [
      "https://twitter.com/trendstoday",
      "https://facebook.com/trendstoday", 
      "https://linkedin.com/company/trends-today",
      "https://youtube.com/@trendstoday"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CA",
      "addressRegion": "ON"
    }
  };

  return <SchemaMarkup schema={schema} id="organization-schema" />;
}

// Website Schema Component
export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Trends Today",
    "alternateName": "Trends Today Tech Reviews",
    "url": "https://trendstoday.ca",
    "description": "Your trusted source for in-depth tech reviews, product comparisons, and comprehensive buying guides.",
    "publisher": {
      "@type": "Organization",
      "name": "Trends Today",
      "logo": {
        "@type": "ImageObject",
        "url": "https://trendstoday.ca/images/logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://trendstoday.ca/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return <SchemaMarkup schema={schema} id="website-schema" />;
}