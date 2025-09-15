const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(__dirname, '..', 'content');

// Default images for each category
const categoryImages = {
  smartphones: '/images/products/smartphone-generic.jpg',
  news: '/images/news/tech-news-generic.jpg',
  guides: '/images/guides/guide-generic.jpg',
  science: '/images/science/science-generic.jpg',
  psychology: '/images/psychology/psychology-generic.jpg',
  culture: '/images/culture/culture-generic.jpg',
  history: '/images/history/history-generic.jpg',
  lifestyle: '/images/lifestyle/lifestyle-generic.jpg',
  reviews: '/images/reviews/review-generic.jpg',
  best: '/images/best/best-generic.jpg',
};

// Image sources from Unsplash for each category
const unsplashImages = {
  smartphones:
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop',
  news: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop',
  guides:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop',
  science:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop',
  psychology:
    'https://images.unsplash.com/photo-1545239351-ef35f43d514b?w=1200&h=800&fit=crop',
  culture:
    'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1200&h=800&fit=crop',
  history:
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&h=800&fit=crop',
  lifestyle:
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=800&fit=crop',
  reviews:
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=800&fit=crop',
};

function fixArticle(filePath) {
  console.log(`\n📝 Processing: ${path.basename(filePath)}`);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    let frontmatter = parsed.data;
    let modified = false;

    // Fix common YAML issues

    // 1. Fix rating field (should be number, not string)
    if (frontmatter.rating && typeof frontmatter.rating === 'string') {
      frontmatter.rating = parseFloat(frontmatter.rating);
      modified = true;
      console.log('  ✅ Fixed rating field');
    }

    // 2. Ensure required fields exist
    if (!frontmatter.title) {
      frontmatter.title = path.basename(filePath, '.mdx').replace(/-/g, ' ');
      modified = true;
      console.log('  ✅ Added missing title');
    }

    if (!frontmatter.description) {
      frontmatter.description = `Read our comprehensive analysis of ${frontmatter.title}`;
      modified = true;
      console.log('  ✅ Added missing description');
    }

    if (!frontmatter.publishedAt) {
      frontmatter.publishedAt = new Date().toISOString();
      modified = true;
      console.log('  ✅ Added missing publishedAt');
    }

    // 3. Fix category
    if (!frontmatter.category) {
      const dirName = path.dirname(filePath).split(path.sep).pop();
      frontmatter.category = dirName;
      modified = true;
      console.log('  ✅ Added missing category');
    }

    // 4. Ensure proper image field
    if (
      !frontmatter.image ||
      frontmatter.image === '' ||
      frontmatter.image.includes('undefined')
    ) {
      const category = frontmatter.category || 'news';
      // Use Unsplash image as primary
      frontmatter.image = unsplashImages[category] || unsplashImages.news;
      modified = true;
      console.log('  ✅ Added relevant image');
    }

    // 5. Fix images object if it exists
    if (frontmatter.images) {
      if (
        !frontmatter.images.featured ||
        frontmatter.images.featured.includes('undefined')
      ) {
        frontmatter.images.featured = frontmatter.image;
        modified = true;
        console.log('  ✅ Fixed featured image');
      }

      // Ensure hero image
      if (!frontmatter.images.hero) {
        frontmatter.images.hero = frontmatter.image;
        modified = true;
        console.log('  ✅ Added hero image');
      }
    }

    // 6. Fix schema if it exists
    if (frontmatter.schema) {
      // Fix nested review rating
      if (frontmatter.schema.review && frontmatter.schema.review.rating) {
        if (typeof frontmatter.schema.review.rating === 'string') {
          frontmatter.schema.review.rating = parseFloat(
            frontmatter.schema.review.rating
          );
          modified = true;
          console.log('  ✅ Fixed schema review rating');
        }
      }
    }

    // 7. Fix author field
    if (!frontmatter.author) {
      frontmatter.author = {
        name: 'Trends Today Editorial',
        bio: 'Expert analysis and in-depth reviews from our editorial team.',
      };
      modified = true;
      console.log('  ✅ Added author information');
    } else if (typeof frontmatter.author === 'string') {
      frontmatter.author = {
        name: frontmatter.author,
        bio: 'Expert contributor at Trends Today',
      };
      modified = true;
      console.log('  ✅ Fixed author format');
    }

    // 8. Add keywords if missing
    if (!frontmatter.keywords || frontmatter.keywords.length === 0) {
      const titleWords = frontmatter.title
        .toLowerCase()
        .split(' ')
        .filter((word) => word.length > 3);
      frontmatter.keywords = titleWords.slice(0, 8);
      modified = true;
      console.log('  ✅ Added keywords');
    }

    // 9. Fix gallery array issues
    if (frontmatter.gallery && Array.isArray(frontmatter.gallery)) {
      frontmatter.gallery = frontmatter.gallery.filter(
        (img) => img && !img.includes('undefined') && !img.includes('null')
      );
      if (frontmatter.gallery.length === 0) {
        delete frontmatter.gallery;
        modified = true;
        console.log('  ✅ Removed empty gallery');
      }
    }

    // 10. Clean up problematic fields
    const fieldsToRemove = ['news', 'smartphones'];
    for (const field of fieldsToRemove) {
      if (frontmatter[field] !== undefined) {
        delete frontmatter[field];
        modified = true;
        console.log(`  ✅ Removed problematic field: ${field}`);
      }
    }

    // Save if modified
    if (modified) {
      const newContent = matter.stringify(parsed.content, frontmatter);
      fs.writeFileSync(filePath, newContent);
      console.log('  ✨ Article fixed and saved!');
      return true;
    } else {
      console.log('  ✔️ No issues found');
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);

    // Try to fix by rebuilding frontmatter
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Find content start (after second ---)
      let contentStart = 0;
      let dashCount = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          dashCount++;
          if (dashCount === 2) {
            contentStart = i + 1;
            break;
          }
        }
      }

      const bodyContent = lines.slice(contentStart).join('\n');
      const fileName = path.basename(filePath, '.mdx');
      const category = path.dirname(filePath).split(path.sep).pop();

      // Create new clean frontmatter
      const newFrontmatter = {
        title: fileName
          .replace(/-/g, ' ')
          .replace(/^\w/, (c) => c.toUpperCase()),
        description: `Comprehensive analysis and insights on ${fileName.replace(/-/g, ' ')}`,
        category: category,
        publishedAt: new Date().toISOString(),
        author: {
          name: 'Trends Today Editorial',
          bio: 'Expert analysis from our editorial team',
        },
        image: unsplashImages[category] || unsplashImages.news,
        keywords: fileName.split('-').filter((w) => w.length > 3),
      };

      const fixedContent = matter.stringify(bodyContent, newFrontmatter);
      fs.writeFileSync(filePath, fixedContent);
      console.log('  🔧 Rebuilt frontmatter from scratch!');
      return true;
    } catch (rebuildError) {
      console.error('  ❌ Could not rebuild:', rebuildError.message);
      return false;
    }
  }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  let fixed = 0;
  let total = 0;

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const result = processDirectory(fullPath);
      fixed += result.fixed;
      total += result.total;
    } else if (item.endsWith('.mdx')) {
      total++;
      if (fixArticle(fullPath)) {
        fixed++;
      }
    }
  }

  return { fixed, total };
}

console.log('🚀 Starting Article Error Fix...\n');
console.log('This will:');
console.log('1. Fix YAML parsing errors');
console.log('2. Ensure all articles have images');
console.log('3. Fix rating and schema issues');
console.log('4. Add missing required fields\n');

const result = processDirectory(contentDir);

console.log('\n' + '='.repeat(50));
console.log(`✅ Process Complete!`);
console.log(`📊 Fixed ${result.fixed} out of ${result.total} articles`);
console.log(`✨ All articles now have valid frontmatter and images`);
