export { FirecrawlClient, firecrawl } from './firecrawl';
export { PerplexityClient, perplexity } from './perplexity';
// DALL-E disabled - using gpt-image-1 via utils/ai-image-generator.js instead
import type { FirecrawlClient as FirecrawlClientType } from './firecrawl';
import type { PerplexityClient as PerplexityClientType } from './perplexity';
import { FirecrawlClient as FirecrawlClientCtor } from './firecrawl';
import { PerplexityClient as PerplexityClientCtor } from './perplexity';
export {
  demoKeywordData,
  demoProductData,
  demoNewsData,
  isDemoMode,
  getDemoModeWarning,
  simulateApiDelay,
} from './demo-data';

class DataForSEOLite {
  async batchKeywordAnalysis(keywords: string[]) {
    console.warn(
      'DataForSEO not configured. Returning empty keyword analysis.'
    );
    return keywords.map((k) => ({
      keyword: k,
      volume: 0,
      kd: 0,
      cpc: 0,
      competition: 'unknown',
      intent: 'informational',
      notes: 'No data',
    }));
  }
  async getSERPAnalysis() {
    return { topPages: [] };
  }
  async getCompetitorAnalysis() {
    return { topKeywords: [] };
  }
}

export class MCPClient {
  public firecrawl: FirecrawlClientType;
  public perplexity: PerplexityClientType;
  public dataForSEO: DataForSEOLite;

  constructor(options?: { firecrawlKey?: string; perplexityKey?: string }) {
    this.firecrawl = new FirecrawlClientCtor(options?.firecrawlKey);
    this.perplexity = new PerplexityClientCtor(options?.perplexityKey);
    this.dataForSEO = new DataForSEOLite();
  }

  async healthCheck() {
    const errors: string[] = [];
    let firecrawlHealthy = false;
    let perplexityHealthy = false;
    try {
      await this.firecrawl.scrapeUrl('https://example.com');
      firecrawlHealthy = true;
    } catch (e: unknown) {
      errors.push(
        `Firecrawl: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
    try {
      await this.perplexity.chat([{ role: 'user', content: 'Hello' }], {
        max_tokens: 5,
      });
      perplexityHealthy = true;
    } catch (e: unknown) {
      errors.push(
        `Perplexity: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
    return {
      firecrawl: firecrawlHealthy,
      perplexity: perplexityHealthy,
      dataForSEO: true,
      errors,
    };
  }

  async getComprehensiveProductData(productName: string, category: string) {
    const {
      isDemoMode,
      demoProductData,
      demoKeywordData,
      simulateApiDelay,
      getDemoModeWarning,
    } = await import('./demo-data');
    if (isDemoMode()) {
      console.log(getDemoModeWarning());
      await simulateApiDelay();
      const research = demoProductData[
        productName as keyof typeof demoProductData
      ] || {
        specs: {},
        pros: [],
        cons: [],
        priceRange: '',
        competitorComparisons: [],
        sources: [],
      };
      const keywordData =
        demoKeywordData[category as keyof typeof demoKeywordData] || [];
      return {
        research: { ...research, productName },
        keywordData: keywordData.slice(0, 5),
        competitorUrls: [],
        scrapedContent: [],
      };
    }
    const research = await this.perplexity.researchProduct(
      productName,
      category
    );
    const keywords = [
      `${productName} review`,
      `${productName} vs`,
      `best ${category} 2025`,
      `${productName} specs`,
      `${productName} price`,
    ];
    const keywordData = await this.dataForSEO.batchKeywordAnalysis(keywords);
    return { research, keywordData, competitorUrls: [], scrapedContent: [] };
  }

  async generateContentIdeas(category: string, count = 10) {
    const clusters = await this.perplexity.generateKeywordClusters(
      category,
      count
    );
    const allKeywords = clusters.clusters.flatMap(
      (c: { keywords: string[] }) => c.keywords
    );
    const keywordOpportunities =
      await this.dataForSEO.batchKeywordAnalysis(allKeywords);
    return {
      reviews: allKeywords
        .filter((k: string) => k.includes('review') && !k.includes('vs'))
        .slice(0, count),
      comparisons: allKeywords
        .filter((k: string) => k.includes('vs') || k.includes('compare'))
        .slice(0, count),
      buyingGuides: allKeywords
        .filter((k: string) => k.includes('best') || k.includes('guide'))
        .slice(0, count),
      news: allKeywords
        .filter((k: string) => k.includes('news') || k.includes('update'))
        .slice(0, count),
      keywordOpportunities,
    };
  }
}

export const mcp = new MCPClient();
