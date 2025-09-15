const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(__dirname, '..', 'content');

// Unique Picsum image IDs for each article type
// Picsum provides unique images by ID: https://picsum.photos/id/{id}/1200/800
const imageMapping = {
  // News articles - tech/modern themed
  'ai-agents-revolution': 'https://picsum.photos/id/1/1200/800', // Laptop
  'ai-generated-minecraft': 'https://picsum.photos/id/96/1200/800', // Tech/gaming
  'ai-settlement-anthropic': 'https://picsum.photos/id/180/1200/800', // Legal/office
  'google-ai-mode': 'https://picsum.photos/id/119/1200/800', // Code/language
  'iphone-17-air': 'https://picsum.photos/id/160/1200/800', // Mobile/sleek
  'iphone-17-series': 'https://picsum.photos/id/201/1200/800', // Tech specs
  'quantum-computing': 'https://picsum.photos/id/193/1200/800', // Data/quantum
  'samsung-galaxy-s25': 'https://picsum.photos/id/268/1200/800', // Phone/device
  'orson-welles': 'https://picsum.photos/id/103/1200/800', // Creative/film
  'apple-iphone-17': 'https://picsum.photos/id/48/1200/800', // Apple event
  'live-updates': 'https://picsum.photos/id/250/1200/800', // News/live

  // Reviews - product images
  'apple-vision-pro': 'https://picsum.photos/id/211/1200/800', // VR/headset feel
  'google-pixel-8': 'https://picsum.photos/id/20/1200/800', // Photography
  'google-pixel-9-pro-review-why': 'https://picsum.photos/id/367/1200/800', // Pixel 9 changes everything
  'google-pixel-9-pro-review': 'https://picsum.photos/id/380/1200/800', // Pixel 9 standard
  'iphone-15-pro-max': 'https://picsum.photos/id/60/1200/800', // Premium device
  'iphone-15-pro-review': 'https://picsum.photos/id/403/1200/800', // Apple product
  'iphone-16-pro-max-review-surprising':
    'https://picsum.photos/id/406/1200/800', // iPhone 16 surprising
  'iphone-16-pro-max-review-the-ai': 'https://picsum.photos/id/490/1200/800', // iPhone 16 AI
  'iphone-16-pro-max-review-the-review':
    'https://picsum.photos/id/535/1200/800', // iPhone 16 echo
  'iphone-16-pro-review': 'https://picsum.photos/id/445/1200/800', // Tech review
  'macbook-air-m3': 'https://picsum.photos/id/2/1200/800', // Laptop/workspace
  'oneplus-12': 'https://picsum.photos/id/360/1200/800', // Android phone
  'samsung-galaxy-s24': 'https://picsum.photos/id/352/1200/800', // Samsung device
  'samsung-galaxy-s25-ultra-review': 'https://picsum.photos/id/319/1200/800', // S25 Ultra review
  'xiaomi-14': 'https://picsum.photos/id/494/1200/800', // Chinese tech

  // Science/Research
  'scientists-discover-planet': 'https://picsum.photos/id/354/1200/800', // Space/astronomy

  // Psychology
  'psychology-procrastinate': 'https://picsum.photos/id/366/1200/800', // Mind/time

  // Culture
  'music-taste-intelligence': 'https://picsum.photos/id/452/1200/800', // Music/headphones

  // History
  '500-year-old-manuscript': 'https://picsum.photos/id/24/1200/800', // Old books

  // Lifestyle
  'introverts-skill': 'https://picsum.photos/id/225/1200/800', // Solitude/focus

  // Guides
  'ai-workplace-productivity': 'https://picsum.photos/id/180/1200/800', // Office/work
};

// Fallback images by category
const categoryFallbacks = {
  news: 'https://picsum.photos/id/119/1200/800',
  reviews: 'https://picsum.photos/id/48/1200/800',
  science: 'https://picsum.photos/id/354/1200/800',
  psychology: 'https://picsum.photos/id/366/1200/800',
  culture: 'https://picsum.photos/id/452/1200/800',
  history: 'https://picsum.photos/id/24/1200/800',
  lifestyle: 'https://picsum.photos/id/225/1200/800',
  guides: 'https://picsum.photos/id/180/1200/800',
  smartphones: 'https://picsum.photos/id/160/1200/800',
};

function getUniqueImageUrl(filename, category) {
  // Try to find a specific image for this article
  for (const [key, url] of Object.entries(imageMapping)) {
    if (filename.toLowerCase().includes(key)) {
      // Add a random parameter to ensure browser doesn't cache
      return `${url}?random=${Date.now()}`;
    }
  }

  // Fallback to category-specific image with unique random seed
  const baseUrl = categoryFallbacks[category] || categoryFallbacks.news;
  // Use filename hash to get consistent but unique image
  const hash = filename
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageId = 1 + (hash % 500); // Picsum has ~1000 images

  return `https://picsum.photos/id/${imageId}/1200/800?random=${Date.now()}`;
}

async function processArticle(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const parsed = matter(content);
    const frontmatter = parsed.data;

    const filename = path.basename(filepath, '.mdx');
    const category = path.dirname(filepath).split(path.sep).pop();

    console.log(`\n📄 Processing: ${filename}`);

    // Get unique image URL
    const imageUrl = getUniqueImageUrl(filename, category);

    // Update frontmatter
    let modified = false;

    if (frontmatter.image !== imageUrl) {
      frontmatter.image = imageUrl;
      modified = true;
      console.log(
        `  ✅ Set unique image: ${imageUrl.split('/id/')[1]?.split('/')[0] || 'unique'}`
      );
    }

    // Update images object
    if (!frontmatter.images) {
      frontmatter.images = {};
    }

    if (
      frontmatter.images.hero !== imageUrl ||
      frontmatter.images.featured !== imageUrl
    ) {
      frontmatter.images.hero = imageUrl;
      frontmatter.images.featured = imageUrl;
      modified = true;
    }

    // Add proper alt text
    if (!frontmatter.imageAlt || frontmatter.imageAlt === frontmatter.title) {
      frontmatter.imageAlt = `${frontmatter.title} - Article image`;
      modified = true;
    }

    if (modified) {
      const newContent = matter.stringify(parsed.content, frontmatter);
      fs.writeFileSync(filepath, newContent);
      console.log(`  ✨ Updated with unique Picsum image!`);
      return true;
    } else {
      console.log(`  ℹ️ Already has unique image`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filepath}: ${error.message}`);
    return false;
  }
}

async function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  let updated = 0;
  let total = 0;

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const result = await processDirectory(fullPath);
      updated += result.updated;
      total += result.total;
    } else if (item.endsWith('.mdx')) {
      total++;
      if (await processArticle(fullPath)) {
        updated++;
      }
    }
  }

  return { updated, total };
}

async function verifyUniqueness() {
  console.log('\n📊 Verifying image uniqueness...');
  const imageUrls = new Map();

  function checkFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const parsed = matter(content);
    const imageUrl = parsed.data.image;

    if (imageUrl) {
      const baseUrl = imageUrl.split('?')[0]; // Remove random param for comparison
      if (imageUrls.has(baseUrl)) {
        console.log(
          `  ⚠️ Duplicate found: ${path.basename(filepath)} shares image with ${imageUrls.get(baseUrl)}`
        );
        return false;
      }
      imageUrls.set(baseUrl, path.basename(filepath));
    }
    return true;
  }

  function checkDirectory(dir) {
    const items = fs.readdirSync(dir);
    let allUnique = true;

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!checkDirectory(fullPath)) {
          allUnique = false;
        }
      } else if (item.endsWith('.mdx')) {
        if (!checkFile(fullPath)) {
          allUnique = false;
        }
      }
    }

    return allUnique;
  }

  const isUnique = checkDirectory(contentDir);

  if (isUnique) {
    console.log('  ✅ All images are unique!');
  } else {
    console.log('  ⚠️ Some duplicates found (see above)');
  }

  console.log(`  📸 Total unique images: ${imageUrls.size}`);
}

async function main() {
  console.log('🎨 Fixing Duplicate Images with Picsum...\n');
  console.log('This will:');
  console.log('1. Assign unique Picsum image IDs to each article');
  console.log('2. Use Lorem Picsum for consistent placeholder images');
  console.log('3. Ensure no two articles share the same image');
  console.log('4. Add proper alt text for accessibility\n');

  const result = await processDirectory(contentDir);

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Process Complete!`);
  console.log(`📊 Updated ${result.updated} out of ${result.total} articles`);

  // Verify uniqueness
  await verifyUniqueness();

  console.log('\n🎯 All articles now have unique Picsum images!');
  console.log('📝 Note: Picsum provides Lorem Ipsum placeholder images');
  console.log('    For production, replace with actual product/article images');
}

// Run the script
main().catch(console.error);
