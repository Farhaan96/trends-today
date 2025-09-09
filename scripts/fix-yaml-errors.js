#!/usr/bin/env node

// Script to fix YAML frontmatter errors in MDX files
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

async function fixYamlErrors() {
  console.log('🔧 Fixing YAML errors in MDX files...\n');
  
  const contentDir = path.join(__dirname, '..', 'content');
  const types = ['news', 'reviews', 'best', 'compare', 'guides'];
  let fixedCount = 0;
  let errorCount = 0;

  for (const type of types) {
    const dir = path.join(contentDir, type);
    
    try {
      const files = await fs.readdir(dir);
      const mdxFiles = files.filter(f => f.endsWith('.mdx'));
      
      for (const file of mdxFiles) {
        const filePath = path.join(dir, file);
        
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Try to parse with gray-matter
          try {
            matter(content);
          } catch (yamlError) {
            console.log(`❌ YAML error in ${type}/${file}`);
            
            // Fix common issues
            let fixedContent = content;
            
            // Fix incomplete keywords arrays
            fixedContent = fixedContent.replace(
              /keywords:\s*\[[^\]]*\*\*[^\]]*\]/g,
              'keywords: ["tech news", "technology", "latest updates"]'
            );
            
            // Fix news section with trailing colon
            fixedContent = fixedContent.replace(
              /^news:\s*$/gm,
              'news:'
            );
            
            // Ensure news section has proper indentation
            fixedContent = fixedContent.replace(
              /^news:\s*\n\s*breaking:/gm,
              'news:\n  breaking:'
            );
            fixedContent = fixedContent.replace(
              /^news:\s*\n\s*category:/gm,
              'news:\n  category:'
            );
            fixedContent = fixedContent.replace(
              /^news:\s*\n\s*urgency:/gm,
              'news:\n  urgency:'
            );
            
            // Fix review section rating
            fixedContent = fixedContent.replace(
              /^review:\s*\n\s*rating:/gm,
              'review:\n  rating:'
            );
            
            // Remove asterisks from text fields
            fixedContent = fixedContent.replace(
              /\*\*\*/g,
              ''
            );
            
            // Fix incomplete placeholder text
            fixedContent = fixedContent.replace(
              /\*\d+\.\s+[^*]+\*\*/g,
              ''
            );
            
            // Test if fixes worked
            try {
              const parsed = matter(fixedContent);
              
              // Additional fixes to frontmatter
              if (parsed.data.keywords && Array.isArray(parsed.data.keywords)) {
                parsed.data.keywords = parsed.data.keywords.filter(k => 
                  k && !k.includes('**') && !k.includes('*')
                ).slice(0, 10);
                
                if (parsed.data.keywords.length === 0) {
                  parsed.data.keywords = ['tech news', 'technology', 'latest updates'];
                }
              }
              
              // Ensure news section is properly structured
              if (parsed.data.news && typeof parsed.data.news === 'object') {
                parsed.data.news = {
                  breaking: parsed.data.news.breaking || false,
                  category: parsed.data.news.category || 'technology',
                  urgency: parsed.data.news.urgency || 'medium'
                };
              }
              
              // Fix review rating if needed
              if (parsed.data.review && parsed.data.review.rating) {
                if (typeof parsed.data.review.rating === 'string') {
                  parsed.data.review.rating = parseFloat(parsed.data.review.rating) || 8.0;
                }
              }
              
              // Reconstruct the file
              const newContent = matter.stringify(parsed.content, parsed.data);
              await fs.writeFile(filePath, newContent, 'utf-8');
              
              console.log(`✅ Fixed: ${type}/${file}`);
              fixedCount++;
              
            } catch (stillBroken) {
              console.log(`⚠️  Could not auto-fix ${type}/${file}, needs manual review`);
              errorCount++;
              
              // Create a backup and apply minimal fix
              await fs.writeFile(filePath + '.backup', content, 'utf-8');
              
              // Apply minimal fix - just ensure valid YAML
              const minimalFix = fixedContent.replace(
                /^---\n([\s\S]*?)\n---/,
                (match, frontmatter) => {
                  // Remove problematic lines
                  let cleaned = frontmatter
                    .split('\n')
                    .filter(line => !line.includes('**'))
                    .join('\n');
                  
                  return `---\n${cleaned}\n---`;
                }
              );
              
              await fs.writeFile(filePath, minimalFix, 'utf-8');
            }
          }
        } catch (readError) {
          console.error(`Error reading ${file}:`, readError.message);
        }
      }
    } catch (dirError) {
      // Directory doesn't exist
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 YAML Fix Summary:`);
  console.log(`   ✅ Fixed: ${fixedCount} files`);
  console.log(`   ⚠️  Needs manual review: ${errorCount} files`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 YAML errors fixed! The homepage should now load properly.');
    console.log('   Restart the dev server to see changes.');
  }
}

// Run the fix
fixYamlErrors().catch(console.error);