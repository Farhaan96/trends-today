#!/usr/bin/env node

/**
 * Benchmarks Trendstoday.ca against major tech blogs using MCP (Firecrawl + Perplexity)
 * - Scrapes homepages and computes structural/SEO metrics
 * - Optionally asks Perplexity to produce prioritized recommendations
 * - Writes a markdown report to reports/competitor-audit-<timestamp>.md
 */

const fs = require('fs').promises;
const path = require('path');
// Load environment variables from .env.local for CLI use
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch {}

const hasLivePerplexity = !!process.env.PERPLEXITY_API_KEY;
const hasLiveFirecrawl = !!process.env.FIRECRAWL_API_KEY;
let demoMcp = null;
try { demoMcp = require('../lib/mcp/demo.js'); } catch {}

const SITES = [
  { name: 'Trends Today', url: 'https://www.trendstoday.ca/' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/' },
  { name: 'The Verge', url: 'https://www.theverge.com/' },
  { name: 'Android Authority', url: 'https://www.androidauthority.com/' },
  { name: 'GSMArena', url: 'https://www.gsmarena.com/' },
];

function basicMetrics(markdown = '', metadata = {}) {
  const text = markdown || '';
  const headings = text.match(/^#{1,6}\s+.+$/gm) || [];
  const h1 = text.match(/^#\s+.+$/gm) || [];
  const links = text.match(/\[[^\]]+\]\(([^)]+)\)/g) || [];
  const images = text.match(/!\[[^\]]*\]\(([^)]+)\)/g) || [];
  const words = text.split(/\s+/).filter(Boolean).length;
  const navHits = (text.match(/\b(reviews|news|best|compare|how to|guide|features|opinion|deals)\b/gi) || []).length;
  const hasSubscribe = /subscribe|newsletter|sign up/i.test(text);
  const hasAffiliate = /affiliate|sponsor|buy now|price/i.test(text);
  const hasSchema = /\"@context\":\s*\"https?:\/\/schema.org\"/.test(text) || /script type=\"application\/ld\+json\"/i.test(text);

  return {
    title: metadata?.title || 'N/A',
    description: metadata?.description || 'N/A',
    contentLength: text.length,
    wordCount: words,
    headingCount: headings.length,
    h1Count: h1.length,
    linkCount: links.length,
    imageCount: images.length,
    navSignals: navHits,
    hasSubscribe,
    hasAffiliate,
    hasSchema,
  };
}

async function scrapeSite(url) {
  // Use live Firecrawl API directly when configured
  if (hasLiveFirecrawl) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true, timeout: 30000 }),
      });
      if (!response.ok) {
        const t = await response.text();
        return { ok: false, error: `Firecrawl HTTP ${response.status}: ${t}` };
      }
      const data = await response.json();
      if (data.success && data.data) {
        return { ok: true, markdown: data.data.markdown || '', metadata: data.data.metadata || {} };
      }
      return { ok: false, error: data.error || 'Unknown scrape error' };
    } catch (e) {
      return { ok: false, error: e.message || 'Scrape failed' };
    }
  }
  // Fallback demo mode
  return { ok: false, error: 'Firecrawl not configured' };
}

function summarizeMetrics(name, url, metrics) {
  return `- Site: ${name} (${url})
  - Title: ${metrics.title}
  - Description: ${metrics.description}
  - Words: ${metrics.wordCount}
  - Headings: ${metrics.headingCount} (H1: ${metrics.h1Count})
  - Links: ${metrics.linkCount}
  - Images: ${metrics.imageCount}
  - Nav Signals: ${metrics.navSignals}
  - Schema JSON-LD: ${metrics.hasSchema}
  - Newsletter/Subscribe: ${metrics.hasSubscribe}
  - Affiliate/Buy Signals: ${metrics.hasAffiliate}`;
}

async function generateRecommendations(context) {
  if (!hasLivePerplexity) {
    return 'Perplexity not configured; add PERPLEXITY_API_KEY to get AI recommendations.';
  }
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        temperature: 0.3,
        max_tokens: 1200,
        return_citations: true,
        messages: [
          { role: 'system', content: 'You are a senior SEO/UX editor for a tech news+reviews site.' },
          { role: 'user', content: `Here are benchmarking metrics comparing a target site against competitors. Provide: 1) Top 8 prioritized actions (clear, specific), 2) Quick wins in 7 days, 3) Longer-term initiatives (architecture/content), 4) Risks. Keep it concise and actionable.\n\n${context}` },
        ],
      }),
    });
    if (!response.ok) return `Perplexity HTTP ${response.status}: ${await response.text()}`;
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No recommendations generated.';
  } catch (e) {
    return `Failed to get recommendations: ${e.message}`;
  }
}

async function main() {
  const outDir = path.join(__dirname, '..', 'reports');
  await fs.mkdir(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(outDir, `competitor-audit-${ts}.md`);

  const results = [];
  console.log('🔎 Benchmarking sites...');
  for (const site of SITES) {
    console.log(`• Scraping ${site.name} - ${site.url}`);
    const scraped = await scrapeSite(site.url);
    if (!scraped.ok) {
      results.push({ site, error: scraped.error });
      continue;
    }
    const metrics = basicMetrics(scraped.markdown, scraped.metadata);
    results.push({ site, metrics });
    // Small politeness delay
    await new Promise((r) => setTimeout(r, 750));
  }

  const summaryBlocks = results.map((r) => {
    if (r.error) return `### ${r.site.name}\n- Error: ${r.error}`;
    return `### ${r.site.name}\n${summarizeMetrics(r.site.name, r.site.url, r.metrics)}`;
  });

  // Build recommendation context
  const context = summaryBlocks.join('\n\n');
  const recs = await generateRecommendations(context);

  const report = `# Trends Today Competitor Benchmark\n\nGenerated: ${new Date().toLocaleString()}\n\n## Sites Audited\n${SITES.map((s) => `- ${s.name} (${s.url})`).join('\n')}\n\n## Snapshot Metrics\n\n${summaryBlocks.join('\n\n')}\n\n---\n\n## Prioritized Recommendations\n\n${recs}\n\n---\n\n## Notes\n- Firecrawl configured: ${hasLiveFirecrawl}\n- Perplexity configured: ${hasLivePerplexity}\n- This uses the assigned MCP APIs via HTTPS.\n- Next steps: audit category/article templates for CWV and schema depth.\n`;

  await fs.writeFile(outPath, report, 'utf-8');
  console.log(`\n✅ Wrote report: ${outPath}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Benchmark failed:', e);
    process.exit(1);
  });
}
