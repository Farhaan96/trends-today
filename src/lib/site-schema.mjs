export const organizationSchema = Object.freeze({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Trends Today',
  url: 'https://www.trendstoday.ca',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.trendstoday.ca/images/logo.png',
    width: 400,
    height: 100,
  },
  description:
    'An independent publication covering useful local news, transit, events, food, housing, and sports across Vancouver, the Lower Mainland, and the Fraser Valley.',
});

export const websiteSchema = Object.freeze({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Trends Today',
  url: 'https://www.trendstoday.ca',
  description:
    'Useful local reporting from Vancouver, the Lower Mainland, and the Fraser Valley.',
  publisher: organizationSchema,
});
