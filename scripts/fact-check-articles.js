require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const matter = require('gray-matter');

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

// Most cost-effective Perplexity model
const MODEL = 'sonar-small';

async function factCheckWithPerplexity(claim, context = '') {
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a fact-checker. Verify the following claim and provide sources. Be concise and accurate.',
          },
          {
            role: 'user',
            content: `Fact-check this claim: "${claim}"${context ? `\nContext: ${context}` : ''}\n\nProvide: 1) Is it true/false/partially true? 2) Correct information if needed 3) 2-3 credible sources`,
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
        return_citations: true,
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API error:', error.message);
    return null;
  }
}

async function extractKeyFacts(content) {
  // Extract key factual claims from the article
  const facts = [];

  // Look for specific patterns
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(billion|million|thousand|percent|%)/gi,
    /(?:costs?|priced?|worth)\s*\$?\d+(?:,\d{3})*(?:\.\d+)?/gi,
    /(?:launched?|released?|announced?)\s+(?:in|on)?\s*\d{4}/gi,
    /(?:first|largest|fastest|most)\s+\w+\s+(?:in|of)\s+\w+/gi,
    /\d+(?:\.\d+)?\s*(?:TB|GB|MB|hours?|minutes?|seconds?|years?|months?|days?)/gi,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      facts.push(...matches);
    }
  });

  // Also extract sentences with specific keywords
  const sentences = content.split(/[.!?]+/);
  const keywordPatterns = [
    /study|research|report|survey/i,
    /according to|reports?|claims?|states?/i,
    /scientists?|researchers?|experts?/i,
    /breakthrough|discovery|innovation/i,
  ];

  sentences.forEach((sentence) => {
    if (
      keywordPatterns.some((pattern) => pattern.test(sentence)) &&
      sentence.length > 20
    ) {
      facts.push(sentence.trim());
    }
  });

  // Return unique facts, limit to top 5 most important
  return [...new Set(facts)].slice(0, 5);
}

async function processArticle(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    console.log(`\n📄 Processing: ${path.basename(filePath)}`);
    console.log(`   Title: ${frontmatter.title || 'Untitled'}`);

    // Extract key facts to check
    const facts = extractKeyFacts(body);

    if (facts.length === 0) {
      console.log('   ⚠️  No specific facts found to verify');
      return { file: filePath, status: 'no-facts' };
    }

    console.log(`   📊 Found ${facts.length} facts to verify`);

    const results = [];
    let needsUpdate = false;
    const citations = new Set();

    // Fact-check each claim
    for (let i = 0; i < facts.length; i++) {
      const fact = facts[i];
      console.log(
        `   🔍 Checking fact ${i + 1}/${facts.length}: "${fact.substring(0, 50)}..."`
      );

      const result = await factCheckWithPerplexity(fact, frontmatter.title);

      if (result) {
        results.push({ fact, verification: result });

        // Extract citations from the result
        const urlPattern = /https?:\/\/[^\s]+/g;
        const urls = result.match(urlPattern);
        if (urls) {
          urls.forEach((url) => citations.add(url));
        }

        // Check if fact needs correction
        if (
          result.toLowerCase().includes('false') ||
          result.toLowerCase().includes('incorrect')
        ) {
          needsUpdate = true;
          console.log(`      ❌ Fact needs correction`);
        } else if (result.toLowerCase().includes('partially')) {
          console.log(`      ⚠️  Fact partially correct`);
        } else {
          console.log(`      ✅ Fact verified`);
        }
      }

      // Rate limiting - wait 1 second between API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Add citations to the article if not already present
    if (
      citations.size > 0 &&
      !body.includes('## Sources') &&
      !body.includes('## References')
    ) {
      console.log(`   📚 Adding ${citations.size} citations to article`);

      const citationSection = `\n\n## Sources\n\n${Array.from(citations)
        .map((url, i) => `${i + 1}. [${url}](${url})`)
        .join('\n')}`;

      const updatedContent = matter.stringify(
        body + citationSection,
        frontmatter
      );
      await fs.writeFile(filePath, updatedContent);
    }

    return {
      file: filePath,
      status: needsUpdate ? 'needs-update' : 'verified',
      results,
      citations: Array.from(citations),
    };
  } catch (error) {
    console.error(`   ❌ Error processing ${filePath}:`, error.message);
    return { file: filePath, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('🔍 Starting Article Fact-Checking Process');
  console.log(`📝 Using Perplexity model: ${MODEL} (most cost-effective)`);
  console.log('='.repeat(60));

  // Get all MDX files
  const articlePaths = [
    'content/technology/ai-agents-revolution-13-billion-market-taking-over-2025.mdx',
    'content/technology/quantum-computing-2025-commercial-breakthrough.mdx',
    'content/space/toi-2431-b-impossible-planet-defies-physics-nasa-discovery.mdx',
    'content/psychology/why-introverts-excel-at-deep-work-psychology-research-2025.mdx',
    'content/health/precision-medicine-revolution-2025.mdx',
  ];

  const results = [];

  for (const articlePath of articlePaths.slice(0, 3)) {
    // Process first 3 articles to save API costs
    const fullPath = path.join(process.cwd(), articlePath);

    try {
      await fs.access(fullPath);
      const result = await processArticle(fullPath);
      results.push(result);
    } catch (error) {
      console.log(`   ⚠️  File not found: ${articlePath}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FACT-CHECKING SUMMARY\n');

  const verified = results.filter((r) => r.status === 'verified').length;
  const needsUpdate = results.filter((r) => r.status === 'needs-update').length;
  const errors = results.filter((r) => r.status === 'error').length;

  console.log(`✅ Verified: ${verified} articles`);
  console.log(`⚠️  Needs Update: ${needsUpdate} articles`);
  console.log(`❌ Errors: ${errors} articles`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    model: MODEL,
    summary: { verified, needsUpdate, errors },
    details: results,
  };

  await fs.writeFile('fact-check-report.json', JSON.stringify(report, null, 2));

  console.log('\n📄 Detailed report saved to fact-check-report.json');
}

main().catch(console.error);
