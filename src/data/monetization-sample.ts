// Sample monetization data for development and testing
import {
  AffiliateProvider,
  PriceData,
  ProductComparison,
} from '@/types/monetization';

export const samplePriceData: PriceData[] = [
  {
    provider: AffiliateProvider.AMAZON,
    currentPrice: 999,
    originalPrice: 1099,
    currency: 'USD',
    inStock: true,
    lastUpdated: new Date().toISOString(),
    affiliateUrl:
      'https://amazon.com/dp/B0CHX2F5QT?tag=trendstoday-20&linkCode=ogi&th=1&psc=1',
    shipping: 'Free shipping',
    availability: 'Usually ships in 1-2 days',
  },
  {
    provider: AffiliateProvider.BESTBUY,
    currentPrice: 1049,
    currency: 'USD',
    inStock: true,
    lastUpdated: new Date().toISOString(),
    affiliateUrl:
      'https://bestbuy.7tiv.net/c/1234567/615614/10014?u=https://www.bestbuy.com/site/apple-iphone-15-pro',
    shipping: 'Free shipping on orders $35+',
    availability: 'Pick up today',
  },
  {
    provider: AffiliateProvider.TARGET,
    currentPrice: 1029,
    originalPrice: 1099,
    currency: 'USD',
    inStock: true,
    lastUpdated: new Date().toISOString(),
    affiliateUrl:
      'https://goto.target.com/c/1234567/81938/2092?u=https://www.target.com/p/apple-iphone-15-pro',
    shipping: 'Free 2-day shipping',
    availability: 'Limited stock',
  },
  {
    provider: AffiliateProvider.NEWEGG,
    currentPrice: 1079,
    currency: 'USD',
    inStock: true,
    lastUpdated: new Date().toISOString(),
    affiliateUrl:
      'https://click.linksynergy.com/link?id=abcd1234&offerid=123456.789&type=15&murl=https%3A%2F%2Fwww.newegg.com%2Fp%2F2WC-000M-00001',
    shipping: 'Free shipping',
    availability: 'In stock',
  },
  {
    provider: AffiliateProvider.B_AND_H,
    currentPrice: 1019,
    originalPrice: 1099,
    currency: 'USD',
    inStock: false,
    lastUpdated: new Date().toISOString(),
    affiliateUrl:
      'https://www.bhphotovideo.com/c/product/1740718-REG/apple_mtq03ll_a_iphone_15_pro_128gb.html/BI/12345/KBID/67890',
    shipping: 'Free expedited shipping',
    availability: 'More on the way',
  },
];

export const sampleProductComparisons: ProductComparison[] = [
  {
    productId: 'samsung-galaxy-s24',
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    currentPrice: 899,
    originalPrice: 999,
    rating: 4.2,
    pros: [
      'Excellent battery life',
      'Advanced AI features',
      'Brighter display',
      'More storage options',
    ],
    cons: [
      'Less premium build quality',
      'Camera inconsistency',
      'Bloatware included',
    ],
    affiliateLinks: {
      [AffiliateProvider.AMAZON]:
        'https://amazon.com/dp/B0CMDWC436?tag=trendstoday-20&linkCode=ogi&th=1&psc=1',
      [AffiliateProvider.BESTBUY]:
        'https://bestbuy.7tiv.net/c/1234567/615614/10014?u=https://www.bestbuy.com/site/samsung-galaxy-s24',
      [AffiliateProvider.TARGET]:
        'https://goto.target.com/c/1234567/81938/2092?u=https://www.target.com/p/samsung-galaxy-s24',
    },
    image: '/images/samsung-galaxy-s24.jpg',
    isRecommended: false,
    dealScore: 8.5,
  },
  {
    productId: 'iphone-15',
    name: 'iPhone 15 (Standard)',
    brand: 'Apple',
    currentPrice: 799,
    originalPrice: 829,
    rating: 4.1,
    pros: [
      'Same great cameras',
      'USB-C connectivity',
      '$200 less expensive',
      'Same iOS experience',
    ],
    cons: [
      'Aluminum build (not titanium)',
      'No Action Button',
      'Slower A16 Bionic chip',
      'No telephoto camera',
    ],
    affiliateLinks: {
      [AffiliateProvider.AMAZON]:
        'https://amazon.com/dp/B0CHX1W2V3?tag=trendstoday-20&linkCode=ogi&th=1&psc=1',
      [AffiliateProvider.BESTBUY]:
        'https://bestbuy.7tiv.net/c/1234567/615614/10014?u=https://www.bestbuy.com/site/apple-iphone-15',
      [AffiliateProvider.TARGET]:
        'https://goto.target.com/c/1234567/81938/2092?u=https://www.target.com/p/apple-iphone-15',
    },
    image: '/images/iphone-15.jpg',
    isRecommended: true,
    dealScore: 7.5,
  },
  {
    productId: 'google-pixel-8-pro',
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    currentPrice: 849,
    originalPrice: 999,
    rating: 4.0,
    pros: [
      'Best computational photography',
      'Pure Android experience',
      'Magic Eraser and AI features',
      'Great value for money',
    ],
    cons: [
      'Inconsistent battery life',
      'Build quality concerns',
      'Limited availability',
      'Slower face unlock',
    ],
    affiliateLinks: {
      [AffiliateProvider.AMAZON]:
        'https://amazon.com/dp/B0CGR4F4JC?tag=trendstoday-20&linkCode=ogi&th=1&psc=1',
      [AffiliateProvider.BESTBUY]:
        'https://bestbuy.7tiv.net/c/1234567/615614/10014?u=https://www.bestbuy.com/site/google-pixel-8-pro',
      [AffiliateProvider.TARGET]:
        'https://goto.target.com/c/1234567/81938/2092?u=https://www.target.com/p/google-pixel-8-pro',
    },
    image: '/images/google-pixel-8-pro.jpg',
    isRecommended: false,
    dealScore: 9.2,
  },
  {
    productId: 'oneplus-12',
    name: 'OnePlus 12',
    brand: 'OnePlus',
    currentPrice: 699,
    originalPrice: 799,
    rating: 4.3,
    pros: [
      'Flagship specs at lower price',
      'Super fast charging',
      'Clean OxygenOS',
      'Excellent performance',
    ],
    cons: [
      'Camera not quite flagship level',
      'Limited carrier support',
      'No wireless charging',
      'Build quality could be better',
    ],
    affiliateLinks: {
      [AffiliateProvider.AMAZON]:
        'https://amazon.com/dp/B0CQV7J2K4?tag=trendstoday-20&linkCode=ogi&th=1&psc=1',
      [AffiliateProvider.NEWEGG]:
        'https://click.linksynergy.com/link?id=abcd1234&offerid=123456.789&type=15&murl=https%3A%2F%2Fwww.newegg.com%2Fp%2F2WC-001X-00002',
    },
    image: '/images/oneplus-12.jpg',
    isRecommended: false,
    dealScore: 8.8,
  },
];

// Affiliate link tracking URLs (replace with actual affiliate IDs)
export const affiliateConfig = {
  [AffiliateProvider.AMAZON]: {
    tag: 'trendstoday-20',
    baseUrl: 'https://amazon.com/dp/{asin}',
    trackingParams: 'tag=trendstoday-20&linkCode=ogi&th=1&psc=1',
  },
  [AffiliateProvider.BESTBUY]: {
    publisherId: '1234567',
    baseUrl: 'https://bestbuy.7tiv.net/c/{publisherId}/615614/10014',
    trackingParams: 'u={productUrl}',
  },
  [AffiliateProvider.TARGET]: {
    publisherId: '1234567',
    baseUrl: 'https://goto.target.com/c/{publisherId}/81938/2092',
    trackingParams: 'u={productUrl}',
  },
  [AffiliateProvider.COMMISSION_JUNCTION]: {
    publisherId: 'abcd1234',
    baseUrl: 'https://click.linksynergy.com/link',
    trackingParams:
      'id={publisherId}&offerid={offerId}&type=15&murl={productUrl}',
  },
  [AffiliateProvider.NEWEGG]: {
    publisherId: 'abcd1234',
    baseUrl: 'https://click.linksynergy.com/link',
    trackingParams:
      'id={publisherId}&offerid=123456.789&type=15&murl={productUrl}',
  },
  [AffiliateProvider.B_AND_H]: {
    publisherId: '12345',
    keywordId: '67890',
    baseUrl: 'https://www.bhphotovideo.com/c/product/{productId}',
    trackingParams: 'BI={publisherId}/KBID={keywordId}',
  },
};

// Revenue tracking configuration
export const revenueTracking = {
  googleAnalytics: {
    measurementId: 'G-XXXXXXXXXX', // Replace with actual GA4 measurement ID
    conversionIds: {
      affiliate_click: 'AW-XXXXXXXXX/abcd1234',
      premium_signup: 'AW-XXXXXXXXX/efgh5678',
      newsletter_signup: 'AW-XXXXXXXXX/ijkl9012',
    },
  },
  facebookPixel: {
    pixelId: '1234567890123456', // Replace with actual Facebook Pixel ID
    events: {
      affiliate_click: 'Lead',
      premium_signup: 'Subscribe',
      purchase_intent: 'InitiateCheckout',
    },
  },
};

// Ad placement configuration for Google AdSense
export const adPlacements = {
  header: {
    adSlot: '1234567890',
    format: 'leaderboard' as const,
    enabled: true,
  },
  sidebar: {
    adSlot: '2345678901',
    format: 'skyscraper' as const,
    enabled: true,
  },
  contentTop: {
    adSlot: '3456789012',
    format: 'banner' as const,
    enabled: true,
  },
  contentMiddle: {
    adSlot: '4567890123',
    format: 'rectangle' as const,
    enabled: true,
  },
  contentBottom: {
    adSlot: '5678901234',
    format: 'banner' as const,
    enabled: true,
  },
  footer: {
    adSlot: '6789012345',
    format: 'mobile-banner' as const,
    enabled: true,
  },
};
