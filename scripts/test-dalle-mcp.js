#!/usr/bin/env node

const { DalleClient } = require('../lib/mcp/dalle.js');
require('dotenv').config({ path: '.env.local' });

async function testDalleMCP() {
  console.log('🎨 Testing DALL-E MCP Setup...\n');

  try {
    // Initialize DALL-E client
    const dalle = new DalleClient();
    console.log('✅ DALL-E client initialized');

    // Test health check
    console.log('🔍 Running health check...');
    const isHealthy = await dalle.healthCheck();
    if (isHealthy) {
      console.log('✅ DALL-E health check passed');
    } else {
      console.log('❌ DALL-E health check failed');
      return;
    }

    // Test image generation for each article category
    const testPrompts = [
      {
        title: 'AI Agents Revolution',
        category: 'technology',
        prompt:
          'futuristic AI robots and automation systems, modern workplace, professional lighting, high quality',
      },
      {
        title: 'Cognitive Biases',
        category: 'psychology',
        prompt:
          'abstract brain visualization with neural networks, psychology concept, soft lighting, professional',
      },
      {
        title: 'CRISPR Breakthrough',
        category: 'science',
        prompt:
          'DNA double helix with gene editing tools, scientific laboratory, clean white background, professional',
      },
      {
        title: 'Quantum Computing',
        category: 'technology',
        prompt:
          'quantum computer processor with quantum bits, advanced technology, futuristic design, professional',
      },
      {
        title: 'Space Discovery',
        category: 'space',
        prompt:
          'exoplanet in deep space, cosmic beauty, astronomical phenomena, NASA style, professional',
      },
    ];

    console.log('\n🎨 Testing image generation for each category...\n');

    for (const test of testPrompts) {
      console.log(`Generating image for: ${test.title} (${test.category})`);

      try {
        const result = await dalle.generateImage({
          prompt: test.prompt,
          model: 'dall-e-3',
          size: '1792x1024',
          quality: 'hd',
          style: 'vivid',
        });

        if (result.error) {
          console.log(`❌ Error: ${result.error}`);
        } else {
          console.log(`✅ Success! Image URL: ${result.url}`);
          if (result.revised_prompt) {
            console.log(`📝 Revised prompt: ${result.revised_prompt}`);
          }
        }
      } catch (error) {
        console.log(`❌ Generation failed: ${error.message}`);
      }

      console.log('---');
    }

    // Test blog-specific image generation
    console.log('\n📝 Testing blog-specific image generation...');
    try {
      const blogResult = await dalle.generateBlogImage(
        'AI Agents Revolution',
        'technology',
        'Article about AI agents taking over the workplace'
      );

      if (blogResult.error) {
        console.log(`❌ Blog image error: ${blogResult.error}`);
      } else {
        console.log(`✅ Blog image generated: ${blogResult.url}`);
      }
    } catch (error) {
      console.log(`❌ Blog image generation failed: ${error.message}`);
    }

    console.log('\n🎉 DALL-E MCP setup test completed!');
  } catch (error) {
    console.error('❌ DALL-E MCP setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check that OPENAI_API_KEY is set in .env.local');
    console.log('2. Verify your OpenAI API key has DALL-E access');
    console.log('3. Check your OpenAI account has sufficient credits');
  }
}

// Run the test
testDalleMCP().catch(console.error);
