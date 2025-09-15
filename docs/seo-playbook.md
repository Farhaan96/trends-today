# SEO Playbook for Trends Today

This playbook documents the SEO foundation and Core Web Vitals optimizations implemented for trendstoday.ca.

## 🎯 Implementation Overview

We've implemented a comprehensive SEO foundation that keeps your beautiful "Load More" UX while making everything crawlable by search engines.

### Key Achievements ✅

- ✅ **100% SEO Audit Score**
- ✅ **Hybrid Pagination** - Beautiful "Load More" + Crawlable Pages
- ✅ **Comprehensive Structured Data** - Article, Organization, Breadcrumbs
- ✅ **Enhanced Crawlability** - Smart sitemap with priorities
- ✅ **Internal Linking Strategy** - Smart related articles
- ✅ **Sponsored Link Handling** - Automatic rel attributes
- ✅ **Core Web Vitals Optimization** - Font loading, image optimization
- ✅ **Quality Validation** - Automated SEO audit script

## 📁 New Files & Components

### Core Pagination System

- `src/lib/pagination.ts` - Pagination utilities and helpers
- `src/app/page/[page]/page.tsx` - Homepage pagination routes
- `src/app/[category]/page/[page]/page.tsx` - Category pagination routes
- `src/components/ui/PaginationLinks.tsx` - Navigation components

### SEO & Structured Data

- `src/components/seo/ArticleJsonLd.tsx` - Article structured data
- `src/components/article/RelatedArticles.tsx` - Smart related content
- `src/components/ui/ExternalLink.tsx` - Link handling with auto-detection

### Quality Assurance

- `scripts/seo-check.js` - Automated SEO audit script
- `next-sitemap.config.js` - Enhanced with priorities

## 🔧 How It Works

### Hybrid Pagination Strategy

**For Users:** Beautiful "Load More" button experience
**For Search Engines:** Crawlable `/page/2`, `/page/3` URLs

```
User Journey:
Homepage → Click "Load More" → More articles appear
URL updates to /?page=2 for analytics/sharing

Crawler Journey:
Homepage → Discovers links to /page/2, /page/3
Each page renders server-side HTML with full content
```

### Structured Data Implementation

Every article page includes:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": { "@type": "Person", "name": "Author Name" },
  "publisher": { "@type": "Organization", "name": "Trends Today" },
  "datePublished": "2025-01-14T...",
  "mainEntityOfPage": "https://www.trendstoday.ca/category/slug"
}
```

### Link Handling

The `ExternalLink` component automatically detects and handles:

```tsx
// Affiliate links get rel="sponsored"
<ExternalLink href="https://amazon.com/dp/B123?tag=affiliate">
  Product Link (automatically gets rel="sponsored noopener noreferrer")
</ExternalLink>

// Internal links use Next.js Link
<ExternalLink href="/category/article">
  Internal Link (uses Next.js Link for performance)
</ExternalLink>
```

## 📊 SEO Audit & Monitoring

### Running the SEO Audit

```bash
npm run seo:check
```

This validates:

- ✅ Crawlable pagination structure
- ✅ Structured data components
- ✅ Meta tags and canonicals
- ✅ Image optimization setup
- ✅ Core Web Vitals optimization
- ✅ Build success

### Current Score: 100% ✅

All 18 SEO checks passing:

- Robots.txt with sitemap reference
- Next-sitemap configuration
- Pagination routes implemented
- Structured data components present
- Internal linking components
- Image optimization configured
- Font optimization enabled
- DNS preconnect configured

## 🚀 Adding New Content

### Creating SEO-Optimized Articles

When adding new articles, ensure they include:

```mdx
---
title: 'Your Article Title (55-60 chars)'
description: 'Meta description 155-160 chars that includes primary keyword'
publishedAt: '2025-01-14T10:00:00.000Z'
modifiedAt: '2025-01-14T10:00:00.000Z'
author:
  name: 'Author Name'
  bio: 'Author bio'
  avatar: '/images/authors/author.jpg'
image: '/images/articles/article-hero.jpg'
category: 'technology'
keywords: ['keyword1', 'keyword2', 'keyword3']
readingTime: 5
wordCount: 800
---

# Your H1 Title (Only One Per Page)

Your engaging content here...
```

### Internal Linking Best Practices

1. **Related Articles**: Automatically generated based on:
   - Same category (highest priority)
   - Keyword matches
   - Tag matches
   - Title similarity

2. **Manual Links**: Use `ExternalLink` component:

   ```tsx
   import ExternalLink from '@/components/ui/ExternalLink';

   <ExternalLink href="/related-article">
     Link Text with Descriptive Anchor
   </ExternalLink>;
   ```

3. **Sponsored Content**: Use `SponsoredLink`:

   ```tsx
   import { SponsoredLink } from '@/components/ui/ExternalLink';

   <SponsoredLink href="https://affiliate-link.com">
     Product Name
   </SponsoredLink>;
   ```

## 📈 Core Web Vitals Optimization

### Image Optimization

- Uses Next.js Image component with automatic WebP/AVIF
- Explicit width/height prevents layout shift (CLS)
- Lazy loading for below-the-fold images
- Priority loading for hero images

### Font Optimization

- Next.js font loader with display: swap
- Preload critical weights only
- System font fallbacks

### Performance Monitoring

- Vercel Analytics integrated
- Core Web Vitals tracking
- Web Vitals component in layout

## 🔗 URLs for Testing

Test these URLs in Google's Rich Results Test:

1. **Homepage**: https://www.trendstoday.ca
   - Organization schema
   - Website schema
   - Pagination links

2. **Article Page**: https://www.trendstoday.ca/technology/ai-agents-revolution-13-billion-market-taking-over-2025
   - Article schema
   - Breadcrumb schema
   - Related articles

3. **Category Page**: https://www.trendstoday.ca/technology
   - Category listing
   - Internal links

4. **Pagination**: https://www.trendstoday.ca/page/2
   - Server-side rendered
   - Canonical tags
   - Rel next/prev

## 🛠️ Troubleshooting

### Common Issues

**Q: Pagination pages not generating?**
A: Check `generateStaticParams()` in pagination files. Run `npm run build` to see which pages are generated.

**Q: Structured data not appearing?**
A: Test with Google's Rich Results Test. Ensure JSON-LD is properly formatted and includes required fields.

**Q: Links not getting proper rel attributes?**
A: Use `ExternalLink` component instead of regular `<a>` tags. The component auto-detects affiliate links.

### SEO Audit Failures

If `npm run seo:check` fails:

1. **Build Errors**: Fix TypeScript/build issues first
2. **Missing Components**: Ensure all SEO components exist
3. **Configuration Issues**: Check next-sitemap.config.js and next.config.ts

## 📝 Maintenance

### Monthly Tasks

- [ ] Run `npm run seo:check` to validate implementation
- [ ] Test key URLs in Google Rich Results Test
- [ ] Review Core Web Vitals in Google Search Console
- [ ] Update sitemap priorities if needed

### Content Guidelines

- [ ] One H1 per page
- [ ] Meta descriptions 155-160 characters
- [ ] Alt text for all images
- [ ] Internal links with descriptive anchors
- [ ] Proper structured data for all articles

## 🎉 Results Expected

With this implementation, you should see:

1. **Improved Crawlability**: All content discoverable by search engines
2. **Enhanced Rich Results**: Articles appear with rich snippets
3. **Better Core Web Vitals**: Improved LCP, INP, and CLS scores
4. **Strategic Internal Linking**: Increased pages per session
5. **Proper Link Handling**: Appropriate rel attributes for all external links

The hybrid approach ensures you keep the beautiful UX while maximizing SEO potential! 🚀
