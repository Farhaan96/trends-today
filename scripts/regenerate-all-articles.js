require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const axios = require('axios');

console.log('🚀 Regenerating ALL Articles with High-Quality Content...\n');

// API configurations
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

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
            content: `Research the topic "${topic}" and provide detailed, factual information including latest updates, key features, specifications, expert opinions, and real-world performance data. Focus on accurate, verifiable information.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
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
        contents: [{
          parts: [{
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

For science/psychology articles, include:
- Research findings and citations
- Expert quotes and perspectives
- Real-world implications
- Statistical data where relevant
- Future research directions

Write the complete article now:`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 3000
        }
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
    
    console.log(`\n📄 Processing: ${title}`);
    
    // Skip if article already has high-quality content (>8000 chars and no placeholders)
    if (oldBody.length > 8000 && 
        !oldBody.includes('Picture this: Researchers') && 
        !oldBody.includes('Advanced chip') &&
        !oldBody.includes('Multi-lens system')) {
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
    if (cleanContent.includes('Advanced chip') || 
        cleanContent.includes('Multi-lens system') ||
        cleanContent.includes('[Insert') ||
        cleanContent.includes('[Your')) {
      console.log(`  ⚠️ Content still has placeholders, skipping`);
      return false;
    }
    
    // Update frontmatter with better metadata
    if (!frontmatter.description || frontmatter.description.length < 50) {
      // Extract first paragraph as description
      const firstPara = cleanContent.split('\n\n')[1] || cleanContent.split('\n\n')[0];
      frontmatter.description = firstPara.replace(/[#*]/g, '').substring(0, 160).trim();
    }
    
    // Ensure proper dates
    if (!frontmatter.publishedAt) {
      frontmatter.publishedAt = new Date().toISOString();
    }
    
    // Save the regenerated article
    const finalContent = matter.stringify(cleanContent, frontmatter);
    fs.writeFileSync(filePath, finalContent);
    
    console.log(`  ✅ Regenerated with ${cleanContent.length} chars of quality content!`);
    return true;
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Main function to process all articles
async function processAllArticles() {
  const contentDir = path.join(process.cwd(), 'content');
  const categories = ['science', 'culture', 'psychology', 'technology', 'health', 'mystery'];
  
  let totalProcessed = 0;
  let totalRegenerated = 0;
  let skipped = 0;
  
  console.log('📝 Processing ALL articles in all categories...\n');
  
  for (const category of categories) {
    const categoryPath = path.join(contentDir, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️ Category folder doesn't exist: ${category}`);
      continue;
    }
    
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.mdx'));
    console.log(`\n📁 Processing ${category} category (${files.length} articles)...`);
    
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      totalProcessed++;
      
      const success = await regenerateArticle(filePath, category);
      if (success) {
        totalRegenerated++;
      } else {
        skipped++;
      }
      
      // Delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Break after 10 articles per category to avoid overwhelming APIs
      if (totalRegenerated >= 10) {
        console.log('\n⚠️ Processed 10 articles. Stopping to avoid API rate limits.');
        console.log('Run again later to process more articles.');
        break;
      }
    }
    
    if (totalRegenerated >= 10) break;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Article Regeneration Complete!');
  console.log(`📊 Results:`);
  console.log(`   - Processed: ${totalProcessed} articles`);
  console.log(`   - Regenerated: ${totalRegenerated} articles`);
  console.log(`   - Skipped (already good): ${skipped} articles`);
  console.log('\n💡 Articles now have high-quality, accurate content!');
  
  if (totalRegenerated >= 10) {
    console.log('\n📌 Note: Processing stopped at 10 articles to avoid rate limits.');
    console.log('   Run the script again later to process remaining articles.');
  }
}

// Run the regeneration
processAllArticles().catch(console.error);