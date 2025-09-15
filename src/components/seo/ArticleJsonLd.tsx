import Script from 'next/script';

interface Author {
  name: string;
  bio?: string;
  avatar?: string;
  url?: string;
}

interface ArticleJsonLdProps {
  headline: string;
  description: string;
  image?: string;
  author: Author | string;
  publishedAt: string;
  modifiedAt?: string;
  category: string;
  url: string;
  wordCount?: number;
  readingTime?: number;
  keywords?: string[];
}

export default function ArticleJsonLd({
  headline,
  description,
  image,
  author,
  publishedAt,
  modifiedAt,
  category,
  url,
  wordCount,
  readingTime,
  keywords,
}: ArticleJsonLdProps) {
  const authorData = typeof author === 'string'
    ? { name: author }
    : author;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: image ? [image] : undefined,
    author: {
      '@type': 'Person',
      name: authorData.name,
      description: authorData.bio,
      image: authorData.avatar,
      url: authorData.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Trends Today',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.trendstoday.ca/images/logo.png',
        width: 400,
        height: 100,
      },
      url: 'https://www.trendstoday.ca',
      sameAs: [
        'https://twitter.com/trendstoday',
        'https://facebook.com/trendstoday',
        'https://linkedin.com/company/trends-today',
      ],
    },
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: category,
    wordCount,
    timeRequired: readingTime ? `PT${readingTime}M` : undefined,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    keywords: keywords?.join(', '),
    potentialAction: {
      '@type': 'ReadAction',
      target: url,
    },
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Script
      id="article-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanSchema, null, 0),
      }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * NewsArticle schema variant for news content
 */
interface NewsArticleJsonLdProps extends ArticleJsonLdProps {
  dateline?: string;
  isBreakingNews?: boolean;
}

export function NewsArticleJsonLd({
  dateline,
  isBreakingNews,
  ...props
}: NewsArticleJsonLdProps) {
  const authorData = typeof props.author === 'string'
    ? { name: props.author }
    : props.author;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: props.headline,
    description: props.description,
    image: props.image ? [props.image] : undefined,
    author: {
      '@type': 'Person',
      name: authorData.name,
      description: authorData.bio,
      image: authorData.avatar,
      url: authorData.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Trends Today',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.trendstoday.ca/images/logo.png',
        width: 400,
        height: 100,
      },
      url: 'https://www.trendstoday.ca',
    },
    datePublished: props.publishedAt,
    dateModified: props.modifiedAt || props.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': props.url,
    },
    articleSection: props.category,
    wordCount: props.wordCount,
    timeRequired: props.readingTime ? `PT${props.readingTime}M` : undefined,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    keywords: props.keywords?.join(', '),
    dateline,
    isBreakingNews,
    potentialAction: {
      '@type': 'ReadAction',
      target: props.url,
    },
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Script
      id="news-article-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanSchema, null, 0),
      }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * BlogPosting schema for blog-style content
 */
export function BlogPostingJsonLd(props: ArticleJsonLdProps) {
  const authorData = typeof props.author === 'string'
    ? { name: props.author }
    : props.author;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: props.headline,
    description: props.description,
    image: props.image ? [props.image] : undefined,
    author: {
      '@type': 'Person',
      name: authorData.name,
      description: authorData.bio,
      image: authorData.avatar,
      url: authorData.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Trends Today',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.trendstoday.ca/images/logo.png',
        width: 400,
        height: 100,
      },
      url: 'https://www.trendstoday.ca',
    },
    datePublished: props.publishedAt,
    dateModified: props.modifiedAt || props.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': props.url,
    },
    articleSection: props.category,
    wordCount: props.wordCount,
    timeRequired: props.readingTime ? `PT${props.readingTime}M` : undefined,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    keywords: props.keywords?.join(', '),
    potentialAction: {
      '@type': 'ReadAction',
      target: props.url,
    },
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Script
      id="blog-posting-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanSchema, null, 0),
      }}
      strategy="beforeInteractive"
    />
  );
}