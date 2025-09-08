import { z } from 'zod';

const PerplexityMessageSchema = z.object({ role: z.enum(['system', 'user', 'assistant']), content: z.string() });
const PerplexityResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  created: z.number(),
  usage: z.object({ prompt_tokens: z.number(), completion_tokens: z.number(), total_tokens: z.number() }),
  choices: z.array(
    z.object({
      index: z.number(),
      finish_reason: z.string(),
      message: z.object({ role: z.string(), content: z.string() }),
      delta: z.object({ role: z.string().optional(), content: z.string().optional() }).optional(),
    }),
  ),
});

export type PerplexityMessage = z.infer<typeof PerplexityMessageSchema>;
export type PerplexityResponse = z.infer<typeof PerplexityResponseSchema>;

export class PerplexityClient {
  private apiKey?: string;
  private baseUrl = 'https://api.perplexity.ai';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY || undefined;
  }

  private ensureConfigured() {
    if (!this.apiKey) throw new Error('Perplexity API key is required. Set PERPLEXITY_API_KEY.');
  }

  async chat(messages: PerplexityMessage[], options?: { model?: string; temperature?: number; max_tokens?: number; return_citations?: boolean; return_images?: boolean }): Promise<PerplexityResponse> {
    this.ensureConfigured();
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: options?.model || 'llama-3.1-sonar-large-128k-online',
        messages,
        temperature: options?.temperature || 0.2,
        max_tokens: options?.max_tokens || 4000,
        return_citations: options?.return_citations ?? true,
        return_images: options?.return_images ?? false,
      }),
    });
    if (!response.ok) throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${await response.text()}`);
    const data = await response.json();
    return PerplexityResponseSchema.parse(data);
  }

  async generateKeywordClusters(category: string, count = 5) {
    const messages: PerplexityMessage[] = [
      { role: 'system', content: 'You are an SEO expert for a tech blog.' },
      { role: 'user', content: `Generate ${count} keyword clusters for "${category}" as JSON with clusters[].topic, keywords[], intent, difficulty.` },
    ];
    const res = await this.chat(messages, { temperature: 0.2, max_tokens: 2000 });
    const content = res.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not extract JSON');
    return JSON.parse(jsonMatch[0]);
  }

  async researchProduct(productName: string, category: string) {
    const messages: PerplexityMessage[] = [
      { role: 'system', content: 'You are a tech product researcher providing factual data.' },
      { role: 'user', content: `Research ${productName} (${category}). Return JSON with specs, pros, cons, priceRange, competitorComparisons, sources[].` },
    ];
    const res = await this.chat(messages, { temperature: 0.2, max_tokens: 3000, return_citations: true });
    const content = res.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not extract JSON');
    return JSON.parse(jsonMatch[0]);
  }

  async generateNewsDigest(sources: string[], topics: string[]) {
    const messages: PerplexityMessage[] = [
      { role: 'system', content: 'You are a tech news curator.' },
      { role: 'user', content: `Find 5-8 recent tech news items (48h) for topics: ${topics.join(', ')} from sources: ${sources.join(', ')}. Return JSON {"articles":[{title,summary,source,publishedAt,category}]}` },
    ];
    const res = await this.chat(messages, { model: 'llama-3.1-sonar-large-128k-online', temperature: 0.4, max_tokens: 3000, return_citations: true });
    const content = res.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not extract JSON');
    return JSON.parse(jsonMatch[0]);
  }
}

export const perplexity = new PerplexityClient();

