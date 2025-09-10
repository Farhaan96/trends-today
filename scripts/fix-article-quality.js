const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

console.log('🔧 Starting Article Quality Fix...\n');

// Patterns to remove (nonsensical content in reviews)
const NONSENSE_PATTERNS = [
  /Picture this: Researchers stumble upon evidence[\s\S]*?perspective\./g,
  /Whether you're a skeptic or a believer[\s\S]*?perspective\./g,
  /Experts across multiple disciplines[\s\S]*?initially thought\./g,
  /This is exactly the kind of discovery that changes textbooks[\s\S]*?serious attention\./g,
  /But here's the real question: How will this affect your daily life\?/g,
  /The numbers are staggering: Over \$2\.3 billion[\s\S]*?year alone\./g,
];

// Function to remove duplicate sections
function removeDuplicates(content) {
  // Remove duplicate "Related Articles" sections
  const relatedArticlesRegex = /## Related Articles[\s\S]*?(?=##|$)/g;
  const relatedMatches = content.match(relatedArticlesRegex) || [];
  if (relatedMatches.length > 1) {
    // Keep only the first one
    content = content.replace(relatedArticlesRegex, '');
    content += '\n\n' + relatedMatches[0];
  }

  // Remove duplicate "The Broader Implications" sections
  const implicationsRegex = /## The Broader Implications[\s\S]*?(?=##|$)/g;
  const implicationMatches = content.match(implicationsRegex) || [];
  if (implicationMatches.length > 1) {
    // Keep only the first one
    content = content.replace(implicationsRegex, '');
    const relatedIdx = content.lastIndexOf('## Related Articles');
    if (relatedIdx > -1) {
      content = content.slice(0, relatedIdx) + implicationMatches[0] + '\n\n' + content.slice(relatedIdx);
    } else {
      content += '\n\n' + implicationMatches[0];
    }
  }

  // Remove duplicate "Looking Ahead" sections
  const lookingAheadRegex = /## Looking Ahead[\s\S]*?(?=##|$)/g;
  const lookingMatches = content.match(lookingAheadRegex) || [];
  if (lookingMatches.length > 1) {
    content = content.replace(lookingAheadRegex, '');
    const relatedIdx = content.lastIndexOf('## Related Articles');
    if (relatedIdx > -1) {
      content = content.slice(0, relatedIdx) + lookingMatches[0] + '\n\n' + content.slice(relatedIdx);
    }
  }

  // Remove repetitive internal link phrases
  content = content.replace(/For more insights, check out our.*?\n/g, (match, offset, string) => {
    const before = string.substring(0, offset);
    const occurrences = (before.match(/For more insights, check out our/g) || []).length;
    return occurrences > 0 ? '' : match;
  });

  // Remove orphaned link sentences
  content = content.replace(/Building on this, \[.*?\] takes these concepts even further\.\n/g, '');
  content = content.replace(/You might also find our \[.*?\] particularly relevant to this discussion\.\n/g, '');
  
  return content;
}

// Function to fix review-specific content
function fixReviewContent(content, frontmatter) {
  if (!frontmatter.category || !frontmatter.category.includes('review')) {
    return content;
  }

  // Remove scientific discovery nonsense from reviews
  NONSENSE_PATTERNS.forEach(pattern => {
    content = content.replace(pattern, '');
  });

  // Fix generic placeholders
  content = content.replace(/Advanced chip/g, 'latest generation processor');
  content = content.replace(/Multi-lens system/g, 'advanced camera system');
  content = content.replace(/6\.1-inch display/g, 'premium OLED display');

  // Remove empty sections
  content = content.replace(/##[^\n]*\n\s*\n##/g, '##');
  
  return content;
}

// Function to process individual MDX file
function processArticle(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: mdxContent } = matter(fileContent);
    
    let fixedContent = mdxContent;
    
    // Remove duplicates
    fixedContent = removeDuplicates(fixedContent);
    
    // Fix review-specific issues
    fixedContent = fixReviewContent(fixedContent, frontmatter);
    
    // Clean up excessive whitespace
    fixedContent = fixedContent.replace(/\n{4,}/g, '\n\n\n');
    fixedContent = fixedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Fix image URLs (replace Picsum with real product images where applicable)
    if (frontmatter.image && frontmatter.image.includes('picsum.photos')) {
      // Map to real images based on article title
      const titleLower = frontmatter.title.toLowerCase();
      if (titleLower.includes('pixel 9')) {
        frontmatter.image = '/images/products/google-pixel-9-pro.jpg';
        frontmatter.images = {
          featured: '/images/products/google-pixel-9-pro.jpg',
          hero: '/images/products/google-pixel-9-pro-hero.jpg'
        };
      } else if (titleLower.includes('pixel 8')) {
        frontmatter.image = '/images/products/google-pixel-8-pro.jpg';
        frontmatter.images = {
          featured: '/images/products/google-pixel-8-pro.jpg',
          hero: '/images/products/google-pixel-8-pro-hero.jpg'
        };
      } else if (titleLower.includes('galaxy s24')) {
        frontmatter.image = '/images/products/samsung-galaxy-s24-ultra.jpg';
        frontmatter.images = {
          featured: '/images/products/samsung-galaxy-s24-ultra.jpg',
          hero: '/images/products/samsung-galaxy-s24-ultra-hero.jpg'
        };
      } else if (titleLower.includes('galaxy s25')) {
        frontmatter.image = '/images/products/samsung-galaxy-s25-ultra.jpg';
        frontmatter.images = {
          featured: '/images/products/samsung-galaxy-s25-ultra.jpg',
          hero: '/images/products/samsung-galaxy-s25-ultra-hero.jpg'
        };
      } else if (titleLower.includes('macbook')) {
        frontmatter.image = '/images/products/macbook-air-m3.jpg';
        frontmatter.images = {
          featured: '/images/products/macbook-air-m3.jpg',
          hero: '/images/products/macbook-air-m3-hero.jpg'
        };
      } else if (titleLower.includes('oneplus')) {
        frontmatter.image = '/images/products/oneplus-12.jpg';
        frontmatter.images = {
          featured: '/images/products/oneplus-12.jpg',
          hero: '/images/products/oneplus-12-hero.jpg'
        };
      } else if (titleLower.includes('xiaomi')) {
        frontmatter.image = '/images/products/xiaomi-14-ultra.jpg';
        frontmatter.images = {
          featured: '/images/products/xiaomi-14-ultra.jpg',
          hero: '/images/products/xiaomi-14-ultra-hero.jpg'
        };
      } else if (titleLower.includes('vision pro')) {
        frontmatter.image = '/images/products/apple-vision-pro.jpg';
        frontmatter.images = {
          featured: '/images/products/apple-vision-pro.jpg',
          hero: '/images/products/apple-vision-pro-hero.jpg'
        };
      } else if (titleLower.includes('ai') || titleLower.includes('artificial')) {
        frontmatter.image = '/images/news/ai-technology.jpg';
        frontmatter.images = {
          featured: '/images/news/ai-technology.jpg',
          hero: '/images/news/ai-technology-hero.jpg'
        };
      }
    }
    
    // Rebuild the file
    const newContent = matter.stringify(fixedContent, frontmatter);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process all MDX files
function processAllArticles() {
  const contentDir = path.join(process.cwd(), 'content');
  let processed = 0;
  let fixed = 0;
  
  // Get all subdirectories
  const categories = fs.readdirSync(contentDir).filter(item => {
    const itemPath = path.join(contentDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  categories.forEach(category => {
    const categoryPath = path.join(contentDir, category);
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.mdx'));
    
    console.log(`\n📁 Processing ${category} (${files.length} files)...`);
    
    files.forEach(file => {
      const filePath = path.join(categoryPath, file);
      console.log(`  ✏️ Fixing ${file}...`);
      if (processArticle(filePath)) {
        fixed++;
      }
      processed++;
    });
  });
  
  console.log('\n✨ Article Quality Fix Complete!');
  console.log(`📊 Results:`);
  console.log(`   - Processed: ${processed} articles`);
  console.log(`   - Fixed: ${fixed} articles`);
}

// Run the fix
processAllArticles();