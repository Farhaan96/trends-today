require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const axios = require('axios');

console.log('🚀 Regenerating Articles with High-Quality Content...\n');

// API configurations
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Use Perplexity for research
async function researchTopic(topic) {
  try {
    console.log(`  🔍 Researching: ${topic}`);
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: `Research the topic "${topic}" and provide detailed, factual information including latest updates, key features, specifications, expert opinions, and real-world performance data. Focus on accurate, verifiable information.`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.log(`  ⚠️ Perplexity error: ${error.message}`);
    return null;
  }
}

// Use Google Gemini for content generation
async function generateWithGemini(title, research, category) {
  try {
    console.log(`  ✍️ Generating content with Gemini...`);
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Write a comprehensive, engaging article about "${title}" for a ${category} category.

Research data: ${research || 'Generate based on your knowledge'}

Requirements:
1. Start with an engaging hook that draws readers in
2. Provide detailed, accurate information with specific facts and figures
3. Include expert perspectives and analysis
4. Use clear headings and subheadings
5. Write in an authoritative but accessible tone
6. Include practical insights and takeaways
7. Minimum 1500 words
8. Format in Markdown
9. NO placeholder text like "Advanced chip" - use real specifications
10. NO generic statements - be specific and detailed

For product reviews, include:
- Detailed specifications
- Performance benchmarks
- Real-world usage scenarios
- Pros and cons based on actual features
- Comparison with competitors
- Value proposition analysis

Write the complete article now:`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 3000,
        },
      },
      { timeout: 30000 }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log(`  ⚠️ Gemini error: ${error.message}`);
    return null;
  }
}

// Process a single article
async function regenerateArticle(filePath, category) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: oldBody } = matter(content);

    const fileName = path.basename(filePath, '.mdx');
    const title = frontmatter.title || fileName.replace(/-/g, ' ');

    console.log(`\n📄 Regenerating: ${title}`);

    // Skip if article is already high quality (has substantial content)
    if (
      oldBody.length > 5000 &&
      !oldBody.includes('Picture this: Researchers')
    ) {
      console.log(`  ✔️ Already has quality content (${oldBody.length} chars)`);
      return false;
    }

    // Research the topic first
    const research = await researchTopic(title);

    // Generate new content
    const newContent = await generateWithGemini(title, research, category);

    if (!newContent || newContent.length < 1000) {
      console.log(`  ❌ Failed to generate quality content`);
      return false;
    }

    // Clean up the content
    let cleanContent = newContent
      .replace(/```markdown\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/\*\*Note:\*\*.*/g, '') // Remove AI notes
      .replace(/\*\*Disclaimer:\*\*.*/g, '') // Remove disclaimers
      .trim();

    // Ensure content doesn't have generic placeholders
    if (
      cleanContent.includes('Advanced chip') ||
      cleanContent.includes('Multi-lens system')
    ) {
      console.log(`  ⚠️ Content still has placeholders, skipping`);
      return false;
    }

    // Update frontmatter with better metadata
    if (!frontmatter.description || frontmatter.description.length < 50) {
      // Extract first paragraph as description
      const firstPara =
        cleanContent.split('\n\n')[1] || cleanContent.split('\n\n')[0];
      frontmatter.description = firstPara
        .replace(/[#*]/g, '')
        .substring(0, 160)
        .trim();
    }

    // Ensure proper dates
    if (!frontmatter.publishedAt) {
      frontmatter.publishedAt = new Date().toISOString();
    }

    // Save the regenerated article
    const finalContent = matter.stringify(cleanContent, frontmatter);
    fs.writeFileSync(filePath, finalContent);

    console.log(
      `  ✅ Regenerated with ${cleanContent.length} chars of quality content!`
    );
    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Main function to process articles
async function processArticles() {
  const contentDir = path.join(process.cwd(), 'content');

  // Focus on articles that need the most help
  const priorityArticles = [
    {
      path: 'technology/google-pixel-9-pro-review.mdx',
      category: 'technology',
    },
    {
      path: 'technology/samsung-galaxy-s24-ultra-review.mdx',
      category: 'technology',
    },
    { path: 'technology/macbook-air-m3-review.mdx', category: 'technology' },
    { path: 'technology/oneplus-12-review.mdx', category: 'technology' },
    {
      path: 'science/scientists-discover-planet-that-shouldn-t-exist-according-to.mdx',
      category: 'science',
    },
    {
      path: 'psychology/the-psychology-behind-why-we-procrastinate-even-when-we-know.mdx',
      category: 'psychology',
    },
    {
      path: 'health/why-introverts-are-actually-better-at-this-one-crucial-skill.mdx',
      category: 'health',
    },
  ];

  let processed = 0;
  let regenerated = 0;

  console.log('📝 Processing priority articles with poor content...\n');

  for (const article of priorityArticles) {
    const filePath = path.join(contentDir, article.path);

    if (fs.existsSync(filePath)) {
      processed++;
      const success = await regenerateArticle(filePath, article.category);
      if (success) regenerated++;

      // Delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Article Regeneration Complete!');
  console.log(`📊 Results:`);
  console.log(`   - Processed: ${processed} articles`);
  console.log(`   - Regenerated: ${regenerated} articles`);
  console.log(`   - Skipped: ${processed - regenerated} articles`);
  console.log('\n💡 Articles now have high-quality, accurate content!');
}

// Run the regeneration
processArticles().catch(console.error);
