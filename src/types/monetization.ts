// Monetization types for Trends Today tech blog

export interface AffiliateLink {
  id: string;
  productId: string;
  provider: AffiliateProvider;
  originalUrl: string;
  affiliateUrl: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  clicks: number;
  conversions: number;
}

export enum AffiliateProvider {
  AMAZON = 'amazon',
  BESTBUY = 'bestbuy',
  COMMISSION_JUNCTION = 'cj',
  TARGET = 'target',
  NEWEGG = 'newegg',
  B_AND_H = 'bandh',
}

export interface PriceData {
  provider: AffiliateProvider;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  inStock: boolean;
  lastUpdated: string;
  affiliateUrl: string;
  shipping?: string;
  availability?: string;
}

export interface DealAlert {
  id: string;
  productId: string;
  userId?: string;
  email: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  notificationsSent: number;
  createdAt: string;
}

export interface PremiumTier {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

export interface AdPlacement {
  id: string;
  location:
    | 'header'
    | 'sidebar'
    | 'content-top'
    | 'content-middle'
    | 'content-bottom'
    | 'footer';
  type: 'banner' | 'native' | 'video' | 'sponsored';
  size: string;
  isActive: boolean;
  provider?: 'adsense' | 'direct';
}

export interface RevenueMetrics {
  affiliateRevenue: number;
  adRevenue: number;
  subscriptionRevenue: number;
  period: string;
  conversionRate: number;
  clickThroughRate: number;
  averageOrderValue: number;
}

export interface ProductComparison {
  productId: string;
  name: string;
  brand: string;
  currentPrice: number;
  originalPrice?: number;
  rating: number;
  pros: string[];
  cons: string[];
  affiliateLinks: Partial<Record<AffiliateProvider, string>>;
  image: string;
  isRecommended?: boolean;
  dealScore?: number;
}
