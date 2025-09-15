// Demo data and utilities for content generation (CommonJS version)

const demoKeywordData = {
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
      keyword: 'best laptops 2025',
      volume: 18900,
      kd: 78,
      intent: 'commercial',
      cpc: 3.89,
    },
  ],
};

const demoProductData = {
  'iPhone 16 Pro': {
    specs: {
      display: '6.3-inch Super Retina XDR OLED',
      processor: 'A18 Pro chip',
      camera: '48MP Fusion camera',
      battery: 'Up to 33 hours video playback',
      storage: '128GB, 256GB, 512GB, 1TB',
      materials: 'Titanium with Ceramic Shield',
    },
    pros: [
      'Revolutionary A18 Pro chip delivers incredible performance',
      'Professional-grade 48MP Fusion camera system',
      'Premium titanium build with superior durability',
      'Customizable Action Button with Lock Screen controls',
      'USB-C compatibility for universal charging',
      'Outstanding 33-hour video battery life',
    ],
    cons: [
      'Premium pricing starting at $999',
      'Incremental design updates from previous generation',
      'No significant camera hardware changes',
    ],
    priceRange: '$999-$1199',
    competitorComparisons: [
      'Samsung Galaxy S24 Ultra',
      'Google Pixel 9 Pro',
      'OnePlus 12',
    ],
    sources: ['apple.com', 'techcrunch.com', 'theverge.com', 'gsmarena.com'],
  },
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
  'Xiaomi 14 Ultra': {
    specs: {
      display: '6.73-inch LTPO AMOLED',
      processor: 'Snapdragon 8 Gen 3',
      camera: '50MP Main with Leica optics',
      battery: '5300mAh with 90W charging',
      storage: '256GB, 512GB, 1TB',
      special: 'Leica camera partnership',
    },
    pros: [
      'Outstanding Leica-tuned cameras',
      'Premium build with ceramic back',
      'Excellent display quality',
      'Fast 90W charging',
      'Great value for flagship features',
    ],
    cons: [
      'Limited global availability',
      'MIUI can feel overwhelming',
      'No wireless charging',
      'Software update consistency concerns',
    ],
    priceRange: '$899-$1199',
    competitorComparisons: ['iPhone 15 Pro', 'Galaxy S24+', 'OnePlus 12'],
    sources: ['mi.com', 'gsmarena.com', 'androidcentral.com'],
  },
};

class DemoMCPClient {
  async getComprehensiveProductData(productName, category) {
    console.log(
      '⚠️  Running in DEMO MODE - using simulated data. Configure API keys for live data.'
    );
    console.log(`🔍 Demo: Researching ${productName}...`);

    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1500 + 500)
    );

    // Use demo data
    const research = demoProductData[productName] || {
      specs: {
        display: '6.1-inch display',
        processor: 'Advanced chip',
        camera: 'Multi-lens system',
      },
      pros: ['Great performance', 'Good build quality', 'Nice design'],
      cons: ['Expensive', 'Battery could be better'],
      priceRange: '$699-$999',
      competitorComparisons: ['Competitor A', 'Competitor B'],
      sources: ['manufacturer.com', 'techsite.com'],
    };

    const keywordData =
      demoKeywordData[category] || demoKeywordData.smartphones;

    return {
      research: { ...research, productName },
      keywordData: keywordData.slice(0, 5),
      competitorUrls: [
        'https://example.com/review1',
        'https://example.com/review2',
      ],
      scrapedContent: [
        {
          success: true,
          data: {
            markdown:
              'Demo competitor content about product features and performance...',
          },
        },
      ],
    };
  }

  async dataForSEO() {
    return {
      batchKeywordAnalysis: async (keywords) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return keywords.map((keyword) => ({
          keyword,
          volume: Math.floor(Math.random() * 10000) + 500,
          kd: Math.floor(Math.random() * 80) + 20,
          cpc: Math.random() * 3 + 1,
          competition: 'medium',
          intent: 'commercial',
        }));
      },
    };
  }
}

function isDemoMode() {
  // Check if we have real API keys (not placeholders)
  const hasFirecrawl =
    process.env.FIRECRAWL_API_KEY &&
    process.env.FIRECRAWL_API_KEY.startsWith('fc-') &&
    process.env.FIRECRAWL_API_KEY.length > 10;

  const hasPerplexity =
    process.env.PERPLEXITY_API_KEY &&
    process.env.PERPLEXITY_API_KEY.startsWith('pplx-') &&
    process.env.PERPLEXITY_API_KEY.length > 10;

  const hasDataForSEO =
    process.env.DATAFORSEO_LOGIN &&
    !process.env.DATAFORSEO_LOGIN.includes('your_login') &&
    process.env.DATAFORSEO_PASSWORD &&
    !process.env.DATAFORSEO_PASSWORD.includes('your_password');

  // If we have at least Firecrawl, we can do some live generation
  // Full live mode requires all three APIs
  return !hasFirecrawl;
}

module.exports = {
  demoKeywordData,
  demoProductData,
  DemoMCPClient,
  isDemoMode,
  mcp: new DemoMCPClient(),
};
