const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(__dirname, '..', 'content');

// Curated unique images for each article type with specific themes
const imageMapping = {
  // Technology articles - diverse tech themes
  'ai-agents-revolution-13-billion-market-taking-over-2025': {
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=630&fit=crop',
    alt: 'Robotic automation and AI systems in modern workplace'
  },
  'ai-agents-workplace-productivity-2025': {
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=630&fit=crop',
    alt: 'Team collaboration with AI tools and productivity dashboards'
  },
  'quantum-computing-2025-commercial-breakthrough': {
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=630&fit=crop',
    alt: 'Quantum computer processor with glowing qubits and advanced technology'
  },
  'google-s-ai-mode-adds-5-new-languages-including-hindi-japane': {
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop',
    alt: 'Global language interface showing multilingual AI capabilities'
  },
  'first-of-its-kind-ai-settlement-anthropic-to-pay-authors-1-5': {
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=630&fit=crop',
    alt: 'Legal documents and AI technology representing historic copyright settlement'
  },

  // Science articles - diverse scientific themes
  'crispr-therapeutics-breakthrough-2025': {
    url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop',
    alt: 'DNA double helix with gene editing visualization and medical breakthrough'
  },

  // Psychology articles - diverse psychological themes
  'your-brain-lies-to-you-cognitive-biases-2025': {
    url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop',
    alt: 'Brain scan showing neural pathways and decision-making regions'
  },
  'why-introverts-excel-at-deep-work-psychology-research-2025': {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop',
    alt: 'Person in deep focused work illustrating introvert concentration and productivity'
  },
  'the-psychology-behind-why-we-procrastinate-even-when-we-know': {
    url: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=1200&h=630&fit=crop',
    alt: 'Person overwhelmed by tasks illustrating procrastination psychology and time management'
  },

  // Health articles - medical and wellness themes
  'precision-medicine-revolution-2025': {
    url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=630&fit=crop',
    alt: 'DNA helix with medical technology showing precision medicine breakthrough'
  },

  // Space articles - astronomy and space exploration
  'toi-2431-b-impossible-planet-defies-physics-nasa-discovery': {
    url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=630&fit=crop',
    alt: 'Artist\'s rendering of TOI-2431 b orbiting dangerously close to its star'
  },
  '500-year-old-manuscript-reveals-ancient-astronomy-knowledge': {
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=630&fit=crop',
    alt: 'Ancient astronomical manuscript with celestial diagrams and calculations'
  },

  // Culture articles - diverse cultural themes
  'neurodivergent-voices-cultural-revolution-2025': {
    url: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1200&h=630&fit=crop',
    alt: 'Diverse group of people representing neurodivergent voices in modern culture'
  },
  'new-study-reveals-surprising-link-between-music-taste-and-in': {
    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=630&fit=crop',
    alt: 'Person listening to music with brain activity visualization showing music psychology'
  }
};

// Alternative image sets for variety
const alternativeImages = {
  technology: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=630&fit=crop', // AI/ML
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=630&fit=crop', // Data science
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=630&fit=crop', // Robotics
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=630&fit=crop'  // Innovation
  ],
  science: [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop', // DNA/Genetics
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop', // Lab research
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop', // Microscopy
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop'  // Biotechnology
  ],
  psychology: [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop', // Brain scans
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop', // Focus/concentration
    'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=1200&h=630&fit=crop', // Mental health
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop'  // Cognitive processes
  ],
  health: [
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=630&fit=crop', // Medical technology
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=630&fit=crop', // Healthcare
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=630&fit=crop', // Wellness
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=630&fit=crop'  // Treatment
  ],
  space: [
    'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=630&fit=crop', // Exoplanets
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=630&fit=crop', // Astronomy
    'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=630&fit=crop', // Space exploration
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=630&fit=crop'  // Cosmic phenomena
  ],
  culture: [
    'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1200&h=630&fit=crop', // Diversity
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=630&fit=crop', // Music/arts
    'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1200&h=630&fit=crop', // Social change
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=630&fit=crop'  // Cultural expression
  ]
};

function getUniqueImageForArticle(filename, category) {
  // First, try to get a specific mapping
  if (imageMapping[filename]) {
    return imageMapping[filename];
  }

  // If no specific mapping, get a unique image from the category pool
  const categoryImages = alternativeImages[category] || alternativeImages.technology;
  const hash = filename.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % categoryImages.length;
  const url = categoryImages[index];
  
  return {
    url: url,
    alt: `${category} article with unique visual representation`
  };
}

function updateArticleImage(filePath) {
  console.log(`\n🎨 Processing: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: body } = matter(content);
    
    // Extract filename without extension
    const filename = path.basename(filePath, '.mdx');
    const category = path.dirname(filePath).split(path.sep).pop();
    
    // Get unique image for this article
    const imageData = getUniqueImageForArticle(filename, category);
    
    // Update frontmatter
    frontmatter.image = imageData.url;
    frontmatter.imageAlt = imageData.alt;
    
    // Write back to file
    const updatedContent = matter.stringify(body, frontmatter);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`✅ Updated image for ${filename}`);
    console.log(`   New image: ${imageData.url}`);
    console.log(`   Alt text: ${imageData.alt}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let processed = 0;
  let errors = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      const subResults = processDirectory(filePath);
      processed += subResults.processed;
      errors += subResults.errors;
    } else if (file.endsWith('.mdx') && !file.includes('.backup')) {
      const success = updateArticleImage(filePath);
      if (success) {
        processed++;
      } else {
        errors++;
      }
    }
  }
  
  return { processed, errors };
}

async function main() {
  console.log('🎨 Starting image diversification process...\n');
  
  const results = processDirectory(contentDir);
  
  console.log('\n📊 Diversification Results:');
  console.log(`✅ Successfully processed: ${results.processed} articles`);
  console.log(`❌ Errors: ${results.errors} articles`);
  
  if (results.processed > 0) {
    console.log('\n🎉 Image diversification complete!');
    console.log('Your articles now have more unique and diverse imagery.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateArticleImage, getUniqueImageForArticle };
