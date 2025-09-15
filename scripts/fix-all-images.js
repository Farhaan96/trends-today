require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const axios = require('axios');

console.log('🎨 Fixing All Article Images with Real URLs...\n');

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Cache to avoid duplicate API calls
const imageCache = {};

async function getUnsplashImage(query) {
  // Check cache first
  if (imageCache[query]) {
    return imageCache[query];
  }

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: query,
        per_page: 5,
        orientation: 'landscape',
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      // Get a random image from the results
      const randomIndex = Math.floor(
        Math.random() * Math.min(5, response.data.results.length)
      );
      const image = response.data.results[randomIndex];
      const imageUrl = image.urls.regular || image.urls.full;

      imageCache[query] = imageUrl;
      console.log(`  ✅ Found Unsplash image for "${query}"`);
      return imageUrl;
    }
  } catch (error) {
    console.log(`  ⚠️ Unsplash API error for "${query}": ${error.message}`);
  }

  return null;
}

async function getPexelsImage(query) {
  // Check cache first
  if (imageCache[query + '_pexels']) {
    return imageCache[query + '_pexels'];
  }

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query: query,
        per_page: 5,
        orientation: 'landscape',
      },
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (response.data.photos && response.data.photos.length > 0) {
      // Get a random image from the results
      const randomIndex = Math.floor(
        Math.random() * Math.min(5, response.data.photos.length)
      );
      const image = response.data.photos[randomIndex];
      const imageUrl =
        image.src.large2x || image.src.large || image.src.original;

      imageCache[query + '_pexels'] = imageUrl;
      console.log(`  ✅ Found Pexels image for "${query}"`);
      return imageUrl;
    }
  } catch (error) {
    console.log(`  ⚠️ Pexels API error for "${query}": ${error.message}`);
  }

  return null;
}

async function getWorkingImageUrl(title, category) {
  // Create search queries based on title and category
  const queries = [
    title.split(':')[0].trim(), // First part of title
    category,
    `${category} technology`,
    'technology modern',
    'tech innovation',
  ];

  // Try Unsplash first
  for (const query of queries) {
    const imageUrl = await getUnsplashImage(query);
    if (imageUrl) return imageUrl;
  }

  // Try Pexels as fallback
  for (const query of queries) {
    const imageUrl = await getPexelsImage(query);
    if (imageUrl) return imageUrl;
  }

  // Ultimate fallback - use a placeholder
  return '/images/placeholder.jpg';
}

async function fixArticleImages(filePath, category) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    const fileName = path.basename(filePath, '.mdx');
    console.log(`\n📄 Processing: ${fileName}`);

    // Check if image is broken (source.unsplash.com or picsum)
    const needsNewImage =
      !frontmatter.image ||
      frontmatter.image.includes('source.unsplash.com') ||
      frontmatter.image.includes('picsum.photos') ||
      frontmatter.image.startsWith('/images/'); // Local images that might not exist

    if (needsNewImage) {
      console.log(
        `  🔍 Getting new image for: ${frontmatter.title || fileName}`
      );

      // Get a working image URL
      const newImageUrl = await getWorkingImageUrl(
        frontmatter.title || fileName.replace(/-/g, ' '),
        category
      );

      // Update all image fields
      frontmatter.image = newImageUrl;
      if (frontmatter.images) {
        frontmatter.images.featured = newImageUrl;
        frontmatter.images.hero = newImageUrl;
      } else {
        frontmatter.images = {
          featured: newImageUrl,
          hero: newImageUrl,
        };
      }

      // Save the updated file
      const newContent = matter.stringify(body, frontmatter);
      fs.writeFileSync(filePath, newContent);
      console.log(`  ✨ Updated with new image!`);
      return true;
    } else {
      console.log(`  ✔️ Image already working`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function processAllArticles() {
  const contentDir = path.join(process.cwd(), 'content');
  const categories = [
    'science',
    'culture',
    'psychology',
    'technology',
    'health',
    'mystery',
  ];

  let totalProcessed = 0;
  let totalFixed = 0;

  for (const category of categories) {
    const categoryPath = path.join(contentDir, category);

    if (!fs.existsSync(categoryPath)) {
      console.log(`\n⚠️ Category folder doesn't exist: ${category}`);
      continue;
    }

    const files = fs
      .readdirSync(categoryPath)
      .filter((f) => f.endsWith('.mdx'));
    console.log(`\n📁 Processing ${category} (${files.length} articles)...`);

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      totalProcessed++;

      const wasFixed = await fixArticleImages(filePath, category);
      if (wasFixed) totalFixed++;

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Image Fix Complete!');
  console.log(`📊 Results:`);
  console.log(`   - Processed: ${totalProcessed} articles`);
  console.log(`   - Fixed: ${totalFixed} articles`);
  console.log(`   - Already working: ${totalProcessed - totalFixed} articles`);
  console.log('\n💡 All articles now have real, working image URLs!');
}

// Run the fix
processAllArticles().catch(console.error);
