#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { DalleClient } = require('../lib/mcp/dalle.js');
require('dotenv').config({ path: '.env.local' });

async function generateDalleImages() {
  console.log('🎨 Generating DALL-E Images for All Articles...\n');

  try {
    // Initialize DALL-E client
    const dalle = new DalleClient();
    console.log('✅ DALL-E client initialized');

    // Health check
    const isHealthy = await dalle.healthCheck();
    if (!isHealthy) {
      console.log('❌ DALL-E health check failed. Please check your API key and credits.');
      return;
    }
    console.log('✅ DALL-E health check passed\n');

    // Find all MDX files
    const contentDir = path.join(__dirname, '../content');
    const categories = ['technology', 'psychology', 'science', 'health', 'space', 'culture'];
    
    let totalArticles = 0;
    let processedArticles = 0;
    let generatedImages = 0;

    for (const category of categories) {
      const categoryDir = path.join(contentDir, category);
      
      try {
        const files = await fs.readdir(categoryDir);
        const mdxFiles = files.filter(file => file.endsWith('.mdx'));
        
        if (mdxFiles.length === 0) continue;
        
        console.log(`📁 Processing ${category} category (${mdxFiles.length} articles)...`);
        
        for (const file of mdxFiles) {
          totalArticles++;
          const filePath = path.join(categoryDir, file);
          
          try {
            // Read the article
            const content = await fs.readFile(filePath, 'utf8');
            
            // Extract frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (!frontmatterMatch) {
              console.log(`⚠️  Skipping ${file}: No frontmatter found`);
              continue;
            }
            
            const frontmatter = frontmatterMatch[1];
            
            // Extract title
            const titleMatch = frontmatter.match(/title:\s*['"](.*?)['"]/);
            if (!titleMatch) {
              console.log(`⚠️  Skipping ${file}: No title found`);
              continue;
            }
            
            const title = titleMatch[1];
            console.log(`\n📝 Processing: ${title}`);
            
            // Generate image using DALL-E
            const imageResult = await dalle.generateBlogImage(title, category);
            
            if (imageResult.error) {
              console.log(`❌ Image generation failed: ${imageResult.error}`);
              continue;
            }
            
            console.log(`✅ Generated image: ${imageResult.url}`);
            generatedImages++;
            
            // Update the frontmatter with new image
            const newImageLine = `image: "${imageResult.url}"`;
            const updatedFrontmatter = frontmatter.replace(
              /image:\s*["'].*?["']/,
              newImageLine
            );
            
            // Update the content
            const updatedContent = content.replace(
              /^---\n[\s\S]*?\n---/,
              `---\n${updatedFrontmatter}\n---`
            );
            
            // Write back to file
            await fs.writeFile(filePath, updatedContent, 'utf8');
            console.log(`💾 Updated ${file} with new DALL-E image`);
            
            processedArticles++;
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.log(`❌ Error processing ${file}: ${error.message}`);
          }
        }
        
        console.log(`✅ Completed ${category} category\n`);
        
      } catch (error) {
        console.log(`❌ Error reading ${category} directory: ${error.message}`);
      }
    }

    console.log('🎉 DALL-E Image Generation Complete!');
    console.log(`📊 Summary:`);
    console.log(`   Total articles found: ${totalArticles}`);
    console.log(`   Articles processed: ${processedArticles}`);
    console.log(`   Images generated: ${generatedImages}`);
    console.log(`   Success rate: ${totalArticles > 0 ? Math.round((generatedImages / totalArticles) * 100) : 0}%`);

  } catch (error) {
    console.error('❌ DALL-E image generation failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check that OPENAI_API_KEY is set in .env.local');
    console.log('2. Verify your OpenAI API key has DALL-E access');
    console.log('3. Check your OpenAI account has sufficient credits');
    console.log('4. Ensure you have write permissions to the content directory');
  }
}

// Run the image generation
generateDalleImages().catch(console.error);
