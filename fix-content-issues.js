#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define common broken patterns and their fixes
const fixes = {
  // Remove broken placeholder texts
  placeholder_fixes: [
    {
      pattern: /\*[^*]*What the marketing doesn't tell you[^*]*\*\*:?/g,
      replacement: 'Real-world testing reveals important considerations that marketing materials don\'t highlight.'
    },
    {
      pattern: /\*[^*]*Real-world performance issues users actually face[^*]*\*\*:?/g,
      replacement: 'Extended usage uncovered performance patterns worth noting.'
    },
    {
      pattern: /\*[^*]*hidden flaws\/limitations[^*]*\*\*:?/g,
      replacement: 'Comprehensive testing revealed nuanced performance characteristics.'
    },
    {
      pattern: /\*[0-9]+\.\s*What the marketing doesn't tell you[^*]*\*\*:?/g,
      replacement: 'Extended testing revealed important considerations.'
    }
  ],
  
  // Fix common broken emoji/text combinations
  text_fixes: [
    {
      pattern: /Hefty and slippery\.:?/g,
      replacement: 'The premium build quality comes with increased weight and a smooth finish that may require careful handling.'
    },
    {
      pattern: /Camera Control is clunky\.:?/g,
      replacement: 'The new Camera Control feature requires adjustment and may not suit all users\' workflows.'
    },
    {
      pattern: /No Qi2 Magnets Built-In::/g,
      replacement: 'Wireless charging compatibility:'
    },
    {
      pattern: /Battery Life Plateau::/g,
      replacement: 'Battery performance analysis:'
    }
  ],

  // Fix broken SEO keywords
  seo_keyword_fixes: [
    {
      pattern: /'?\*what'?/g,
      replacement: ''
    },
    {
      pattern: /marketing/g,
      replacement: ''
    },
    {
      pattern: /doesn't/g,
      replacement: ''
    },
    {
      pattern: /\(hidden/g,
      replacement: ''
    },
    {
      pattern: /'flaws\/limitations\)\:\*\*'/g,
      replacement: ''
    },
    {
      pattern: /'slippery\.:'/g,
      replacement: ''
    },
    {
      pattern: /'built-in::'/g,
      replacement: ''
    }
  ]
};

// Function to apply fixes to content
function applyContentFixes(content) {
  let fixedContent = content;
  
  // Apply placeholder fixes
  fixes.placeholder_fixes.forEach(fix => {
    fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
  });
  
  // Apply text fixes
  fixes.text_fixes.forEach(fix => {
    fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
  });
  
  return fixedContent;
}

// Function to fix SEO keywords in frontmatter
function fixSeoKeywords(content) {
  let fixedContent = content;
  
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    let frontmatter = frontmatterMatch[1];
    
    // Clean up broken keywords
    fixes.seo_keyword_fixes.forEach(fix => {
      frontmatter = frontmatter.replace(fix.pattern, fix.replacement);
    });
    
    // Remove empty keyword lines
    frontmatter = frontmatter.replace(/\s*-\s*\n/g, '\n');
    frontmatter = frontmatter.replace(/\s*-\s*$/g, '');
    
    // Replace the frontmatter in the content
    fixedContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontmatter}\n---`);
  }
  
  return fixedContent;
}

// Function to recursively find all MDX files
function findMdxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findMdxFiles(fullPath));
    } else if (item.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main function to process all content files
async function fixAllContent() {
  console.log('🔧 Starting content fixes...');
  
  try {
    // Find all MDX files in content directory
    const files = findMdxFiles('content');
    
    let fixedFiles = 0;
    let totalFixes = 0;
    
    for (const file of files) {
      console.log(`📝 Processing: ${file}`);
      
      // Read file content
      const content = fs.readFileSync(file, 'utf8');
      let fixedContent = content;
      
      // Apply content fixes
      const contentAfterFixes = applyContentFixes(fixedContent);
      const contentFixesCount = contentAfterFixes !== fixedContent ? 1 : 0;
      fixedContent = contentAfterFixes;
      
      // Apply SEO keyword fixes
      const seoAfterFixes = fixSeoKeywords(fixedContent);
      const seoFixesCount = seoAfterFixes !== fixedContent ? 1 : 0;
      fixedContent = seoAfterFixes;
      
      const fileFixes = contentFixesCount + seoFixesCount;
      
      if (fixedContent !== content) {
        // Write the fixed content back
        fs.writeFileSync(file, fixedContent);
        fixedFiles++;
        totalFixes += fileFixes;
        console.log(`✅ Fixed ${fileFixes} issues in ${file}`);
      } else {
        console.log(`✨ No issues found in ${file}`);
      }
    }
    
    console.log(`\n🎉 Content fixes completed!`);
    console.log(`📊 Fixed ${totalFixes} issues across ${fixedFiles} files`);
    console.log(`📁 Processed ${files.length} total files`);
    
  } catch (error) {
    console.error('❌ Error fixing content:', error);
    process.exit(1);
  }
}

// Run the fixes
if (require.main === module) {
  fixAllContent();
}

module.exports = { fixAllContent, applyContentFixes, fixSeoKeywords };