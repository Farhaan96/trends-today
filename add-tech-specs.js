#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Technical specifications database
const specs = {
  'iphone-15-pro-max': {
    display: '6.7" Super Retina XDR OLED',
    resolution: '2796 × 1290 pixels (460 ppi)',
    refresh: 'ProMotion 120Hz adaptive',
    chipset: 'Apple A17 Pro (3nm)',
    cpu: '6-core (2 performance + 4 efficiency)',
    gpu: '6-core Apple GPU',
    ram: '8GB',
    storage: '256GB/512GB/1TB',
    mainCamera: '48MP f/1.78 (24mm)',
    telephoto: '12MP f/2.8 (120mm, 5x optical)',
    ultrawide: '12MP f/2.2 (13mm)',
    frontCamera: '12MP f/1.9 TrueDepth',
    video: '4K ProRes, 4K Dolby Vision',
    battery: '4441mAh',
    charging: '27W wired, 15W MagSafe',
    weight: '221g',
    dimensions: '159.9 × 76.7 × 8.25mm',
    materials: 'Titanium frame, Ceramic Shield',
    waterRating: 'IP68 (6m for 30 min)',
    os: 'iOS 17'
  },
  
  'iphone-15-pro': {
    display: '6.1" Super Retina XDR OLED',
    resolution: '2556 × 1179 pixels (460 ppi)',
    refresh: 'ProMotion 120Hz adaptive',
    chipset: 'Apple A17 Pro (3nm)',
    cpu: '6-core (2 performance + 4 efficiency)',
    gpu: '6-core Apple GPU',
    ram: '8GB',
    storage: '128GB/256GB/512GB/1TB',
    mainCamera: '48MP f/1.78 (24mm)',
    telephoto: '12MP f/2.8 (77mm, 3x optical)',
    ultrawide: '12MP f/2.2 (13mm)',
    frontCamera: '12MP f/1.9 TrueDepth',
    video: '4K ProRes, 4K Dolby Vision',
    battery: '3274mAh',
    charging: '27W wired, 15W MagSafe',
    weight: '187g',
    dimensions: '146.6 × 70.6 × 8.25mm',
    materials: 'Titanium frame, Ceramic Shield',
    waterRating: 'IP68 (6m for 30 min)',
    os: 'iOS 17'
  },

  'samsung-galaxy-s24-ultra': {
    display: '6.8" Dynamic AMOLED 2X',
    resolution: '3120 × 1440 pixels (501 ppi)',
    refresh: '120Hz adaptive',
    chipset: 'Snapdragon 8 Gen 3',
    cpu: 'Octa-core (1×3.39GHz + 3×3.1GHz + 4×2.9GHz)',
    gpu: 'Adreno 750',
    ram: '12GB',
    storage: '256GB/512GB/1TB',
    mainCamera: '200MP f/1.7 (24mm)',
    telephoto: '50MP f/3.4 (111mm, 5x optical)',
    telephoto2: '10MP f/2.4 (67mm, 3x optical)',
    ultrawide: '12MP f/2.2 (13mm)',
    frontCamera: '12MP f/2.2',
    video: '8K@30fps, 4K@60fps',
    battery: '5000mAh',
    charging: '45W wired, 15W wireless',
    weight: '232g',
    dimensions: '162.3 × 79 × 8.6mm',
    materials: 'Titanium frame, Gorilla Glass Victus 2',
    waterRating: 'IP68',
    os: 'Android 14, One UI 6.1',
    extras: 'S Pen included'
  },

  'google-pixel-9-pro': {
    display: '6.3" LTPO OLED',
    resolution: '2856 × 1280 pixels (489 ppi)',
    refresh: '120Hz adaptive',
    chipset: 'Google Tensor G4',
    cpu: 'Octa-core (1×3.1GHz + 3×2.6GHz + 4×1.92GHz)',
    gpu: 'Mali-G715 MC7',
    ram: '16GB',
    storage: '128GB/256GB/512GB/1TB',
    mainCamera: '50MP f/1.68 (25mm)',
    telephoto: '48MP f/2.8 (113mm, 5x optical)',
    ultrawide: '48MP f/1.7 (13mm)',
    frontCamera: '42MP f/2.2',
    video: '4K@60fps, 8K@30fps',
    battery: '4700mAh',
    charging: '27W wired, 23W wireless',
    weight: '199g',
    dimensions: '152.8 × 72 × 8.5mm',
    materials: 'Aluminum frame, Gorilla Glass Victus 2',
    waterRating: 'IP68',
    os: 'Android 14'
  },

  'oneplus-12': {
    display: '6.82" LTPO AMOLED',
    resolution: '3168 × 1440 pixels (510 ppi)',
    refresh: '120Hz adaptive',
    chipset: 'Snapdragon 8 Gen 3',
    cpu: 'Octa-core (1×3.3GHz + 2×3.2GHz + 3×3.0GHz + 2×2.3GHz)',
    gpu: 'Adreno 750',
    ram: '12GB/16GB',
    storage: '256GB/512GB',
    mainCamera: '50MP f/1.6 (24mm)',
    telephoto: '64MP f/2.6 (70mm, 3x optical)',
    ultrawide: '48MP f/2.2 (14mm)',
    frontCamera: '32MP f/2.4',
    video: '8K@24fps, 4K@60fps',
    battery: '5400mAh',
    charging: '100W wired, 50W wireless',
    weight: '220g',
    dimensions: '164.3 × 75.8 × 9.15mm',
    materials: 'Aluminum frame, Gorilla Glass Victus 2',
    waterRating: 'IP65',
    os: 'Android 14, OxygenOS 14'
  }
};

// Function to generate specs table
function generateSpecsTable(product) {
  const spec = specs[product];
  if (!spec) return '';

  return `## Technical Specifications

| **Category** | **Specifications** |
|--------------|-------------------|
| **Display** | ${spec.display} |
| **Resolution** | ${spec.resolution} |
| **Refresh Rate** | ${spec.refresh} |
| **Chipset** | ${spec.chipset} |
| **CPU** | ${spec.cpu} |
| **GPU** | ${spec.gpu} |
| **RAM** | ${spec.ram} |
| **Storage** | ${spec.storage} |
| **Main Camera** | ${spec.mainCamera} |${spec.telephoto2 ? `\n| **Telephoto 2** | ${spec.telephoto2} |` : ''}
| **Telephoto** | ${spec.telephoto} |
| **Ultra-wide** | ${spec.ultrawide} |
| **Front Camera** | ${spec.frontCamera} |
| **Video** | ${spec.video} |
| **Battery** | ${spec.battery} |
| **Charging** | ${spec.charging} |
| **Weight** | ${spec.weight} |
| **Dimensions** | ${spec.dimensions} |
| **Materials** | ${spec.materials} |
| **Water Rating** | ${spec.waterRating} |
| **Operating System** | ${spec.os} |${spec.extras ? `\n| **Extras** | ${spec.extras} |` : ''}

`;
}

// Function to detect product from filename
function detectProduct(filename) {
  const lowerFilename = filename.toLowerCase();
  
  for (const [product] of Object.entries(specs)) {
    if (lowerFilename.includes(product.replace(/-/g, '-'))) {
      return product;
    }
  }
  
  return null;
}

// Function to add specs to content
function addSpecs(content, product) {
  // Look for a good place to insert specs - after methodology or before "Reality Check"
  const patterns = [
    /^## The Reality Check$/gm,
    /^## Performance:/gm,
    /^## What/gm,
    /^## Design/gm
  ];
  
  const specsTable = generateSpecsTable(product);
  
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      return content.replace(pattern, specsTable + '\n$&');
    }
  }
  
  // If no good insertion point, add after frontmatter
  const frontmatterEnd = content.indexOf('\n---\n') + 5;
  if (frontmatterEnd > 4) {
    return content.slice(0, frontmatterEnd) + '\n' + specsTable + '\n' + content.slice(frontmatterEnd);
  }
  
  return content;
}

// Function to recursively find all review MDX files
function findReviewFiles(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findReviewFiles(fullPath));
      } else if (item.endsWith('.mdx') && (fullPath.includes('/reviews/') || fullPath.includes('\\reviews\\'))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.log(`Skipping directory ${dir}: ${error.message}`);
  }
  
  return files;
}

// Main function
async function addTechSpecs() {
  console.log('📊 Adding technical specifications to review articles...');
  
  try {
    const files = findReviewFiles('content');
    let processedFiles = 0;
    let specsAdded = 0;
    
    for (const file of files) {
      console.log(`📝 Processing: ${file}`);
      
      const content = fs.readFileSync(file, 'utf8');
      const filename = path.basename(file, '.mdx');
      
      // Skip if specs already exist
      if (content.includes('## Technical Specifications')) {
        console.log(`✨ Specs already exist in ${file}`);
        processedFiles++;
        continue;
      }
      
      const product = detectProduct(filename);
      
      if (product && specs[product]) {
        const contentWithSpecs = addSpecs(content, product);
        
        if (contentWithSpecs !== content) {
          fs.writeFileSync(file, contentWithSpecs);
          console.log(`✅ Added specs to ${file} (${product})`);
          specsAdded++;
        }
      } else {
        console.log(`⚠️  No specs available for ${file}`);
      }
      
      processedFiles++;
    }
    
    console.log(`\n🎉 Technical specifications added!`);
    console.log(`📊 Added specs to ${specsAdded} files`);
    console.log(`📁 Processed ${processedFiles} review files`);
    
    if (specsAdded > 0) {
      console.log(`\n🚀 Your articles now include:`);
      console.log(`• Comprehensive technical specifications`);
      console.log(`• Professional comparison tables`);
      console.log(`• Industry-standard hardware details`);
      console.log(`• Premium content quality matching TechRadar/The Verge`);
    }
    
  } catch (error) {
    console.error('❌ Error adding tech specs:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addTechSpecs();
}

module.exports = { addTechSpecs, generateSpecsTable, detectProduct };