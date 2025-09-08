// Schema.org TypeScript definitions for structured data

export interface BaseSchema {
  "@context"?: "https://schema.org"; // optional to allow nested objects without @context
  "@type": string;
}

export interface ImageObjectSchema extends BaseSchema {
  "@type": "ImageObject";
  url: string;
  width?: number;
  height?: number;
  caption?: string;
  name?: string;
}

export interface PersonSchema extends BaseSchema {
  "@type": "Person";
  name: string;
  description?: string;
  image?: string;
  url?: string;
  jobTitle?: string;
  worksFor?: OrganizationSchema | string;
  sameAs?: string[];
  email?: string;
  telephone?: string;
}

export interface BrandSchema extends BaseSchema {
  "@type": "Brand";
  name: string;
  logo?: ImageObjectSchema;
  url?: string;
}

export interface OrganizationSchema extends BaseSchema {
  "@type": "Organization";
  name: string;
  alternateName?: string;
  description?: string;
  url: string;
  logo?: ImageObjectSchema;
  foundingDate?: string;
  founder?: PersonSchema;
  contactPoint?: ContactPointSchema;
  address?: PostalAddressSchema;
  sameAs?: string[];
  email?: string;
  telephone?: string;
}

export interface ContactPointSchema extends BaseSchema {
  "@type": "ContactPoint";
  telephone?: string;
  email?: string;
  contactType: string;
  areaServed?: string;
  availableLanguage?: string;
}

export interface PostalAddressSchema extends BaseSchema {
  "@type": "PostalAddress";
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
}

export interface GeoCoordinatesSchema extends BaseSchema {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
}

export interface WebSiteSchema extends BaseSchema {
  "@type": "WebSite";
  name: string;
  alternateName?: string;
  url: string;
  description?: string;
  publisher?: OrganizationSchema;
  potentialAction?: SearchActionSchema;
  sameAs?: string[];
}

export interface SearchActionSchema extends BaseSchema {
  "@type": "SearchAction";
  target: EntryPointSchema;
  "query-input": string;
}

export interface EntryPointSchema extends BaseSchema {
  "@type": "EntryPoint";
  urlTemplate: string;
}

export interface WebPageSchema extends BaseSchema {
  "@type": "WebPage";
  "@id": string;
  url?: string;
  name?: string;
  description?: string;
  isPartOf?: WebSiteSchema;
  primaryImageOfPage?: ImageObjectSchema;
  datePublished?: string;
  dateModified?: string;
}

export interface ArticleSchema extends BaseSchema {
  "@type": "Article" | "NewsArticle" | "BlogPosting" | "TechArticle";
  headline: string;
  description: string;
  image?: string[];
  author: PersonSchema;
  publisher: OrganizationSchema;
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: WebPageSchema;
  articleSection?: string;
  wordCount?: number;
  timeRequired?: string;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  keywords?: string[];
  about?: ThingSchema[];
  mentions?: ThingSchema[];
}

export interface ThingSchema extends BaseSchema {
  "@type": "Thing";
  name: string;
  description?: string;
  url?: string;
  sameAs?: string[];
}

export interface RatingSchema extends BaseSchema {
  "@type": "Rating";
  ratingValue: number;
  bestRating: number;
  worstRating?: number;
}

export interface AggregateRatingSchema extends BaseSchema {
  "@type": "AggregateRating";
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface OfferSchema extends BaseSchema {
  "@type": "Offer" | "AggregateOffer";
  price?: string;
  priceCurrency: string;
  lowPrice?: string;
  highPrice?: string;
  availability: string;
  validFrom?: string;
  validThrough?: string;
  seller?: OrganizationSchema;
  offerCount?: string;
  url?: string;
}

export interface ProductSchema extends BaseSchema {
  "@type": "Product";
  name: string;
  description: string;
  brand: BrandSchema;
  model?: string;
  category?: string;
  image?: string;
  sku?: string;
  gtin?: string;
  mpn?: string;
  offers?: OfferSchema;
  aggregateRating?: AggregateRatingSchema;
  review?: Partial<ReviewSchema>[];
  manufacturer?: OrganizationSchema;
  releaseDate?: string;
}

export interface ReviewSchema extends BaseSchema {
  "@type": "Review";
  itemReviewed: ProductSchema;
  reviewRating: RatingSchema;
  name: string;
  author: PersonSchema;
  publisher: OrganizationSchema;
  datePublished: string;
  dateModified?: string;
  description?: string;
  reviewBody: string;
  url?: string;
  inLanguage?: string;
  positiveNotes?: string[];
  negativeNotes?: string[];
}

export interface ListItemSchema extends BaseSchema {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListSchema extends BaseSchema {
  "@type": "BreadcrumbList";
  itemListElement: ListItemSchema[];
}

export interface QuestionSchema extends BaseSchema {
  "@type": "Question";
  name: string;
  acceptedAnswer: AnswerSchema;
  answerCount?: number;
  upvoteCount?: number;
  dateCreated?: string;
}

export interface AnswerSchema extends BaseSchema {
  "@type": "Answer";
  text: string;
  upvoteCount?: number;
  dateCreated?: string;
  author?: PersonSchema;
}

export interface FAQPageSchema extends BaseSchema {
  "@type": "FAQPage";
  mainEntity: QuestionSchema[];
}

export interface HowToSchema extends BaseSchema {
  "@type": "HowTo";
  name: string;
  description: string;
  image?: ImageObjectSchema[];
  estimatedCost?: MonetaryAmountSchema;
  supply?: HowToSupplySchema[];
  tool?: HowToToolSchema[];
  step: HowToStepSchema[];
  totalTime?: string;
  yield?: string;
}

export interface HowToStepSchema extends BaseSchema {
  "@type": "HowToStep";
  name: string;
  text: string;
  image?: ImageObjectSchema;
  url?: string;
}

export interface HowToSupplySchema extends BaseSchema {
  "@type": "HowToSupply";
  name: string;
}

export interface HowToToolSchema extends BaseSchema {
  "@type": "HowToTool";
  name: string;
}

export interface MonetaryAmountSchema extends BaseSchema {
  "@type": "MonetaryAmount";
  currency: string;
  value: number;
}

export interface LocalBusinessSchema extends BaseSchema {
  "@type": "LocalBusiness";
  name: string;
  description: string;
  url: string;
  telephone?: string;
  email?: string;
  address: PostalAddressSchema;
  geo?: GeoCoordinatesSchema;
  openingHours?: string;
  priceRange?: string;
  paymentAccepted?: string[];
  currenciesAccepted?: string[];
}

export interface VideoObjectSchema extends BaseSchema {
  "@type": "VideoObject";
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  embedUrl?: string;
  contentUrl?: string;
  width?: number;
  height?: number;
}

export interface ItemListSchema extends BaseSchema {
  "@type": "ItemList";
  itemListElement: (ListItemSchema | ThingSchema)[];
  numberOfItems?: number;
  itemListOrder?: "ascending" | "descending" | "unordered";
}

export interface SoftwareApplicationSchema extends BaseSchema {
  "@type": "SoftwareApplication" | "WebApplication" | "MobileApplication";
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: OfferSchema;
  aggregateRating?: AggregateRatingSchema;
  screenshot?: ImageObjectSchema[];
  softwareVersion?: string;
  fileSize?: string;
  downloadUrl?: string;
  installUrl?: string;
}
