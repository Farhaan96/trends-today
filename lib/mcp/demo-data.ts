// Demo data for content generation when MCP APIs are not configured
// This allows the system to work immediately while APIs are being set up

export const demoKeywordData = {
  smartphones: [
    {
      keyword: 'iPhone 15 Pro review',
      volume: 8100,
      kd: 68,
      intent: 'commercial',
      cpc: 2.45,
    },
    {
      keyword: 'Samsung Galaxy S24 review',
      volume: 5400,
      kd: 72,
      intent: 'commercial',
      cpc: 2.12,
    },
    {
      keyword: 'Google Pixel 8 Pro review',
      volume: 2900,
      kd: 58,
      intent: 'commercial',
      cpc: 1.87,
    },
    {
      keyword: 'OnePlus 12 review',
      volume: 1800,
      kd: 54,
      intent: 'commercial',
      cpc: 1.65,
    },
    {
      keyword: 'best smartphones 2025',
      volume: 14800,
      kd: 76,
      intent: 'commercial',
      cpc: 3.21,
    },
    {
      keyword: 'iPhone vs Samsung',
      volume: 12100,
      kd: 65,
      intent: 'commercial',
      cpc: 1.98,
    },
  ],
  laptops: [
    {
      keyword: 'MacBook Pro 14 review',
      volume: 6700,
      kd: 71,
      intent: 'commercial',
      cpc: 3.12,
    },
    {
      keyword: 'Dell XPS 13 review',
      volume: 4200,
      kd: 68,
      intent: 'commercial',
      cpc: 2.87,
    },
    {
      keyword: 'ThinkPad X1 Carbon review',
      volume: 2100,
      kd: 59,
      intent: 'commercial',
      cpc: 2.34,
    },
    {
      keyword: 'best laptops 2025',
      volume: 18900,
      kd: 78,
      intent: 'commercial',
      cpc: 3.89,
    },
  ],
  headphones: [
    {
      keyword: 'Sony WH-1000XM5 review',
      volume: 5100,
      kd: 64,
      intent: 'commercial',
      cpc: 2.21,
    },
    {
      keyword: 'AirPods Max review',
      volume: 3800,
      kd: 69,
      intent: 'commercial',
      cpc: 2.56,
    },
    {
      keyword: 'best headphones 2025',
      volume: 11200,
      kd: 73,
      intent: 'commercial',
      cpc: 2.98,
    },
  ],
};

export const demoProductData = {
  'iPhone 15 Pro Max': {
    specs: {
      display: '6.7-inch Super Retina XDR OLED',
      processor: 'A17 Pro chip',
      camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
      battery: 'Up to 29 hours video playback',
      storage: '256GB, 512GB, 1TB',
      connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3',
    },
    pros: [
      'Exceptional camera system with 5x zoom',
      'Outstanding A17 Pro performance',
      'Premium titanium build quality',
      'Excellent battery life',
      'USB-C connectivity finally added',
    ],
    cons: [
      'Very expensive starting price',
      'Heavy at 221 grams',
      'No significant design changes',
      'Limited RAM for the price',
    ],
    priceRange: '$1199-$1599',
    competitorComparisons: [
      'Samsung Galaxy S24 Ultra',
      'Google Pixel 8 Pro',
      'OnePlus 12',
    ],
    sources: ['apple.com', 'gsmarena.com', 'dxomark.com'],
  },
  'Samsung Galaxy S24 Ultra': {
    specs: {
      display: '6.8-inch Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      camera: '200MP Main, 50MP Periscope, 12MP Ultra Wide',
      battery: '5000mAh with 45W fast charging',
      storage: '256GB, 512GB, 1TB',
      spen: 'Built-in S Pen stylus',
    },
    pros: [
      'Incredible 200MP camera system',
      'Built-in S Pen for productivity',
      'Large 6.8-inch 120Hz display',
      'Excellent build quality with titanium',
      'Great battery life with fast charging',
    ],
    cons: [
      'Expensive premium pricing',
      'Large size not for everyone',
      'Samsung bloatware present',
      'Camera processing can be over-saturated',
    ],
    priceRange: '$1299-$1659',
    competitorComparisons: [
      'iPhone 15 Pro Max',
      'Google Pixel 8 Pro',
      'OnePlus 12',
    ],
    sources: ['samsung.com', 'gsmarena.com', 'dxomark.com'],
  },
  'Google Pixel 8 Pro': {
    specs: {
      display: '6.7-inch LTPO OLED',
      processor: 'Google Tensor G3',
      camera: '50MP Main, 48MP Ultra Wide, 48MP Telephoto',
      battery: '5050mAh with 30W charging',
      storage: '128GB, 256GB, 512GB, 1TB',
      ai: 'Advanced AI photo features',
    },
    pros: [
      'Best-in-class computational photography',
      'Clean Android experience',
      'Excellent AI features',
      'Great value for flagship features',
      'Rapid software updates',
    ],
    cons: [
      'Tensor G3 performance lags competitors',
      'Slower charging speeds',
      'Build quality feels less premium',
      'Fingerprint sensor can be unreliable',
    ],
    priceRange: '$999-$1399',
    competitorComparisons: [
      'iPhone 15 Pro',
      'Samsung Galaxy S24',
      'OnePlus 12',
    ],
    sources: ['store.google.com', 'gsmarena.com', 'dxomark.com'],
  },
  'OnePlus 12': {
    specs: {
      display: '6.82-inch LTPO AMOLED',
      processor: 'Snapdragon 8 Gen 3',
      camera: '50MP Main, 64MP Periscope, 48MP Ultra Wide',
      battery: '5400mAh with 100W SuperVOOC',
      storage: '256GB, 512GB',
      charging: '100W wired, 50W wireless',
    },
    pros: [
      'Blazing fast 100W charging',
      'Excellent price-to-performance ratio',
      'Smooth OxygenOS experience',
      'Great display quality',
      'Strong flagship performance',
    ],
    cons: [
      'Camera quality behind Pixel/iPhone',
      'No wireless charging in base model',
      'Limited availability in some regions',
      'OxygenOS bugs occasionally present',
    ],
    priceRange: '$799-$899',
    competitorComparisons: ['iPhone 15', 'Galaxy S24', 'Pixel 8'],
    sources: ['oneplus.com', 'gsmarena.com', 'androidauthority.com'],
  },
};

export const demoNewsData = [
  {
    title: 'Apple Announces Vision Pro 2 Development for Late 2025',
    summary:
      'Apple confirms it is working on a second-generation Vision Pro with improved displays, lighter design, and significantly reduced pricing expected for Q4 2025.',
    category: 'AR/VR',
    source: 'TechCrunch',
    publishedAt: '2025-01-15T10:30:00Z',
  },
];

export async function simulateApiDelay(
  minMs = 500,
  maxMs = 2000
): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export function isDemoMode(): boolean {
  const hasFirecrawl =
    process.env.FIRECRAWL_API_KEY &&
    !process.env.FIRECRAWL_API_KEY.includes('your-api-key');
  const hasPerplexity =
    process.env.PERPLEXITY_API_KEY &&
    !process.env.PERPLEXITY_API_KEY.includes('your-api-key');
  // If either is missing, run demo
  return !(hasFirecrawl && hasPerplexity);
}

export function getDemoModeWarning(): string {
  return 'Running in DEMO MODE - using simulated data. Configure API keys for live data.';
}
