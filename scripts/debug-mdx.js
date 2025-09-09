const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { serialize } = require('next-mdx-remote/serialize');

async function debugMDX(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    console.log('✅ YAML frontmatter parsed successfully');
    console.log('📝 Content length:', content.length);
    
    // Try to compile the MDX
    console.log('🔧 Attempting to compile MDX...');
    
    try {
      await serialize(content);
      console.log('✅ MDX compiled successfully!');
    } catch (mdxError) {
      console.error('❌ MDX compilation error:');
      console.error(mdxError.message);
      
      // Try to find the problematic line
      const lines = content.split('\n');
      console.log('\n🔍 Searching for problematic patterns...\n');
      
      lines.forEach((line, index) => {
        // Check for various problematic patterns
        if (line.match(/^\d+\s+/)) {
          console.log(`Line ${index + 1}: Starts with number: "${line.substring(0, 50)}..."`);
        }
        if (line.match(/^\s*1\s*$/)) {
          console.log(`Line ${index + 1}: Standalone "1": "${line}"`);
        }
        if (line.match(/\*{3,}/)) {
          console.log(`Line ${index + 1}: Multiple asterisks: "${line.substring(0, 50)}..."`);
        }
        if (line.match(/\[1\]/)) {
          console.log(`Line ${index + 1}: Reference [1]: "${line.substring(0, 50)}..."`);
        }
      });
    }
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
  }
}

// Debug the problematic file
const filePath = path.join(process.cwd(), 'content/reviews/apple-vision-pro-vs-meta-quest-spatial-computing-2025.mdx');
debugMDX(filePath);