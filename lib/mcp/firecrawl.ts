import { z } from 'zod';

const FirecrawlResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      markdown: z.string().optional(),
      html: z.string().optional(),
      metadata: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          language: z.string().optional(),
          keywords: z.string().optional(),
          robots: z.string().optional(),
          ogTitle: z.string().optional(),
          ogDescription: z.string().optional(),
          ogImage: z.string().optional(),
          ogUrl: z.string().optional(),
          sourceURL: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  error: z.string().optional(),
});

export type FirecrawlResponse = z.infer<typeof FirecrawlResponseSchema>;

export class FirecrawlClient {
  private apiKey?: string;
  private baseUrl = 'https://api.firecrawl.dev';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FIRECRAWL_API_KEY || undefined;
  }

  private ensureConfigured() {
    if (!this.apiKey) {
      throw new Error('Firecrawl API key is required. Set FIRECRAWL_API_KEY.');
    }
  }

  async scrapeUrl(
    url: string,
    options?: {
      formats?: ('markdown' | 'html')[];
      includeTags?: string[];
      excludeTags?: string[];
      onlyMainContent?: boolean;
      timeout?: number;
    },
  ): Promise<FirecrawlResponse> {
    this.ensureConfigured();
    const response = await fetch(`${this.baseUrl}/v1/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: options?.formats || ['markdown'],
        includeTags: options?.includeTags,
        excludeTags: options?.excludeTags,
        onlyMainContent: options?.onlyMainContent ?? true,
        timeout: options?.timeout || 30000,
      }),
    });
    if (!response.ok) {
      const t = await response.text();
      throw new Error(`Firecrawl API error: ${response.status} ${response.statusText} - ${t}`);
    }
    const data = await response.json();
    return FirecrawlResponseSchema.parse(data);
  }

  async auditSite(url: string) {
    this.ensureConfigured();
    const response = await fetch(`${this.baseUrl}/v1/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ url, includePageSpeed: true, includeSEO: true, includeAccessibility: true }),
    });
    if (!response.ok) throw new Error(`Firecrawl audit failed: ${response.status}`);
    return response.json();
  }

  async scrapeMultipleUrls(urls: string[], options?: { formats?: ('markdown' | 'html')[]; concurrency?: number; delay?: number }) {
    const concurrency = options?.concurrency || 3;
    const delay = options?.delay || 1000;
    const results: FirecrawlResponse[] = [];
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(batch.map((u) => this.scrapeUrl(u, { formats: options?.formats })));
      for (const r of batchResults) {
        if (r.status === 'fulfilled') results.push(r.value);
        else results.push({ success: false, error: (r.reason as Error).message });
      }
      if (i + concurrency < urls.length) await new Promise((res) => setTimeout(res, delay));
    }
    return results;
  }
}

export const firecrawl = new FirecrawlClient();

