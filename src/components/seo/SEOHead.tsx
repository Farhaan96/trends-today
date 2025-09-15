import Head from 'next/head';

interface SEOHeadProps {
  // Basic SEO
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;

  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'video';
  ogUrl?: string;

  // Twitter
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';

  // Article specific
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  section?: string;
  tags?: string[];

  // Language and locale
  language?: string;
  locale?: string;
  alternateLanguages?: Array<{
    href: string;
    hrefLang: string;
  }>;

  // Additional meta
  robots?: string;
  viewport?: string;
  themeColor?: string;

  // JSON-LD Schema
  jsonLd?: any;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonical,

  // Open Graph
  ogTitle,
  ogDescription,
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  ogUrl,

  // Twitter
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = 'summary_large_image',

  // Article specific
  author,
  publishedAt,
  modifiedAt,
  section,
  tags = [],

  // Language and locale
  language = 'en',
  locale = 'en_US',
  alternateLanguages = [],

  // Additional meta
  robots = 'index,follow',
  viewport = 'width=device-width,initial-scale=1',
  themeColor = '#0070f3',

  // JSON-LD Schema
  jsonLd,
}: SEOHeadProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendstoday.ca';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : undefined;
  const fullOgUrl = ogUrl || fullCanonical || siteUrl;
  const fullOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${siteUrl}${ogImage}`;
  const fullTwitterImage = twitterImage
    ? twitterImage.startsWith('http')
      ? twitterImage
      : `${siteUrl}${twitterImage}`
    : fullOgImage;

  // Generate optimized title
  const pageTitle = title.includes('Trends Today')
    ? title
    : `${title} | Trends Today`;
  const finalOgTitle = ogTitle || title;
  const finalTwitterTitle = twitterTitle || finalOgTitle;

  // Generate optimized descriptions
  const finalOgDescription = ogDescription || description;
  const finalTwitterDescription = twitterDescription || finalOgDescription;

  // Combine all keywords
  const allKeywords = [
    ...keywords,
    ...tags,
    'tech reviews',
    'product comparisons',
    'buying guides',
    'technology news',
  ]
    .filter(Boolean)
    .slice(0, 10); // Limit to 10 keywords

  return (
    <Head>
      {/* Basic SEO Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {allKeywords.length > 0 && (
        <meta name="keywords" content={allKeywords.join(', ')} />
      )}

      {/* Canonical URL */}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Language and Locale */}
      <meta httpEquiv="content-language" content={language} />
      <meta property="og:locale" content={locale} />

      {/* Alternate Languages */}
      {alternateLanguages.map((lang) => (
        <link
          key={lang.hrefLang}
          rel="alternate"
          hrefLang={lang.hrefLang}
          href={lang.href}
        />
      ))}

      {/* Robots and Crawling */}
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="bingbot" content={robots} />

      {/* Viewport and Mobile */}
      <meta name="viewport" content={viewport} />
      <meta name="theme-color" content={themeColor} />

      {/* Author and Publication Info */}
      {author && <meta name="author" content={author} />}
      {publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {modifiedAt && (
        <meta property="article:modified_time" content={modifiedAt} />
      )}
      {section && <meta property="article:section" content={section} />}

      {/* Article Tags */}
      {tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content={finalOgTitle} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:site_name" content="Trends Today" />

      {/* Additional OG Image Properties */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@trendstoday" />
      <meta name="twitter:creator" content="@trendstoday" />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={fullTwitterImage} />
      <meta name="twitter:image:alt" content={finalTwitterTitle} />

      {/* Additional Meta Tags for Rich Results */}
      <meta name="application-name" content="Trends Today" />
      <meta name="apple-mobile-web-app-title" content="Trends Today" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd, null, 0),
          }}
        />
      )}
    </Head>
  );
}

// Specialized SEO components for different content types

interface ArticleSEOProps extends Omit<SEOHeadProps, 'ogType'> {
  readingTime?: number;
  wordCount?: number;
  category?: string;
}

export function ArticleSEO({
  readingTime,
  wordCount,
  category,
  ...props
}: ArticleSEOProps) {
  return (
    <SEOHead
      {...props}
      ogType="article"
      section={category}
      description={`${props.description}${readingTime ? ` • ${readingTime} min read` : ''}${wordCount ? ` • ${wordCount} words` : ''}`}
    />
  );
}

interface ReviewSEOProps extends Omit<SEOHeadProps, 'ogType'> {
  productName: string;
  rating?: number;
  maxRating?: number;
  price?: string;
}

export function ReviewSEO({
  productName,
  rating,
  maxRating = 5,
  price,
  ...props
}: ReviewSEOProps) {
  const ratingText = rating ? ` • Rated ${rating}/${maxRating}` : '';
  const priceText = price ? ` • ${price}` : '';

  return (
    <SEOHead
      {...props}
      ogType="article"
      title={`${productName} Review${ratingText} | Trends Today`}
      description={`${props.description}${ratingText}${priceText}`}
      keywords={[
        ...(props.keywords || []),
        productName.toLowerCase(),
        'review',
        'rating',
      ]}
    />
  );
}

interface ProductSEOProps extends Omit<SEOHeadProps, 'ogType'> {
  productName: string;
  brand: string;
  price?: string;
  availability?: string;
}

export function ProductSEO({
  productName,
  brand,
  price,
  availability,
  ...props
}: ProductSEOProps) {
  const priceText = price ? ` • ${price}` : '';
  const availabilityText = availability ? ` • ${availability}` : '';

  return (
    <SEOHead
      {...props}
      ogType="product"
      title={`${productName} by ${brand}${priceText} | Trends Today`}
      description={`${props.description}${priceText}${availabilityText}`}
      keywords={[
        ...(props.keywords || []),
        productName.toLowerCase(),
        brand.toLowerCase(),
        'buy',
        'price',
      ]}
    />
  );
}
