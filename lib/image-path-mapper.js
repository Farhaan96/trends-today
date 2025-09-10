// Intelligent path mapping system
// Automatically maps and fixes image paths to match article expectations

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

class ImagePathMapper {
  constructor(options = {}) {
    this.contentDir = options.contentDir || path.join(__dirname, '..', 'content');
    this.publicDir = options.publicDir || path.join(__dirname, '..', 'public');
    this.imagesDir = path.join(this.publicDir, 'images');
    this.cacheFile = path.join(__dirname, '..', '.cache', 'image-path-mappings.json');
    
    // Path mapping rules and patterns
    this.pathMappings = new Map();
    this.pathPatterns = {
      // Product hero images
      'hero': {
        pattern: /^\/images\/products\/([^\/]+)-hero\.jpg$/,
        directory: 'products',
        priority: 10
      },
      // Review-specific images
      'reviews': {
        pattern: /^\/images\/reviews\/([^\/]+)\/([^\/]+)\.jpg$/,
        directory: 'reviews',
        priority: 8
      },
      // News images
      'news': {
        pattern: /^\/images\/news\/([^\/]+)\.jpg$/,
        directory: 'news', 
        priority: 7
      },
      // Product features
      'product-features': {
        pattern: /^\/images\/products\/([^\/]+)-(camera|battery|display|design|titanium|usbc|a18|intelligence)\.jpg$/,
        directory: 'products',
        priority: 6
      },
      // Author images
      'authors': {
        pattern: /^\/images\/authors\/([^\/]+)\.jpg$/,
        directory: 'authors',
        priority: 5
      },
      // General products
      'products': {
        pattern: /^\/images\/products\/([^\/]+)\.jpg$/,
        directory: 'products',
        priority: 4
      },
      // Comparison images
      'comparisons': {
        pattern: /^\/images\/([^\/]+)-comparison\.jpg$/,
        directory: 'products',
        priority: 3
      }
    };

    // Smart filename generation rules
    this.filenameRules = {
      // Product-based rules
      'iphone-16-pro-max': {
        'camera-system': 'iphone-16-pro-max-camera-system.jpg',
        'apple-intelligence': 'iphone-16-pro-max-apple-intelligence.jpg',
        'a18-bionic': 'iphone-16-pro-max-a18-bionic.jpg',
        'battery-life': 'iphone-16-pro-max-battery-life.jpg',
        'titanium-design': 'iphone-16-pro-max-titanium-design.jpg',
        'hero': 'iphone-16-pro-max-titanium-hero.jpg'
      },
      'iphone-15-pro-max': {
        'camera': 'iphone-15-pro-max-camera.jpg',
        // Map deprecated/broken variant to an existing asset
        'titanium': 'iphone-15-pro-max-display.jpg',
        'display': 'iphone-15-pro-max-display.jpg',
        'battery': 'iphone-15-pro-max-battery.jpg',
        // Map deprecated/broken variant to an existing asset
        'usbc': 'iphone-15-pro-max-battery.jpg',
        'hero': 'iphone-15-pro-max-hero.jpg'
      }
    };

    // Statistics tracking
    this.stats = {
      pathsAnalyzed: 0,
      pathsFixed: 0,
      pathsCreated: 0,
      pathsMapped: 0,
      errors: []
    };
  }

  // Main method: Analyze all content and map image paths
  async mapAllImagePaths() {
    console.log('🗺️  Starting intelligent path mapping analysis...');
    
    await this.loadExistingMappings();
    await this.scanContentForImagePaths();
    await this.generateIntelligentMappings();
    await this.saveMappings();
    
    return this.generateMappingReport();
  }

  // Load existing path mappings from cache
  async loadExistingMappings() {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf-8');
      const cached = JSON.parse(data);
      
      if (cached.mappings) {
        for (const [key, value] of Object.entries(cached.mappings)) {
          this.pathMappings.set(key, value);
        }
        console.log(`📋 Loaded ${Object.keys(cached.mappings).length} existing mappings`);
      }
    } catch (error) {
      console.log('📝 No existing mappings found, starting fresh');
    }
  }

  // Scan all content files for image path references
  async scanContentForImagePaths() {
    console.log('🔍 Scanning content files for image references...');
    
    const contentTypes = ['news', 'reviews', 'best', 'comparisons'];
    const allImagePaths = new Set();
    
    for (const type of contentTypes) {
      const typeDir = path.join(this.contentDir, type);
      
      try {
        const files = await fs.readdir(typeDir);
        const contentFiles = files.filter(f => f.endsWith('.mdx') || f.endsWith('.json'));
        
        for (const file of contentFiles) {
          const filePath = path.join(typeDir, file);
          const imagePaths = await this.extractImagePathsFromFile(filePath);
          
          for (const imgPath of imagePaths) {
            allImagePaths.add(imgPath);
            this.stats.pathsAnalyzed++;
          }
        }
      } catch (error) {
        console.error(`Error scanning ${type}:`, error.message);
        this.stats.errors.push({
          type: 'scan_error',
          location: type,
          error: error.message
        });
      }
    }
    
    console.log(`📊 Found ${allImagePaths.size} unique image paths`);
    return Array.from(allImagePaths);
  }

  // Extract image paths from individual file
  async extractImagePathsFromFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const isJson = filePath.endsWith('.json');
      const paths = [];
      
      if (isJson) {
        const data = JSON.parse(content);
        this.extractPathsFromObject(data, paths);
      } else {
        const { data: frontmatter, content: body } = matter(content);
        this.extractPathsFromObject(frontmatter, paths);
        
        // Extract from markdown content
        const imageRegex = /\/images\/[\w\/-]+\.(jpg|jpeg|png|webp)/g;
        const matches = body.match(imageRegex) || [];
        paths.push(...matches);
      }
      
      return [...new Set(paths)];
      
    } catch (error) {
      this.stats.errors.push({
        type: 'file_parse_error',
        file: filePath,
        error: error.message
      });
      return [];
    }
  }

  // Recursively extract image paths from object/frontmatter
  extractPathsFromObject(obj, paths = []) {
    if (typeof obj === 'string' && obj.startsWith('/images/')) {
      paths.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach(item => this.extractPathsFromObject(item, paths));
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(value => this.extractPathsFromObject(value, paths));
    }
  }

  // Generate intelligent mappings for missing images
  async generateIntelligentMappings() {
    console.log('🧠 Generating intelligent path mappings...');
    
    const imagePaths = await this.scanContentForImagePaths();
    
    for (const imagePath of imagePaths) {
      if (this.pathMappings.has(imagePath)) {
        continue; // Already mapped
      }
      
      // Check if image actually exists
      const fullPath = path.join(this.publicDir, imagePath);
      try {
        await fs.access(fullPath);
        // Image exists, create identity mapping
        this.pathMappings.set(imagePath, {
          originalPath: imagePath,
          mappedPath: imagePath,
          status: 'exists',
          type: 'identity'
        });
        continue;
      } catch (error) {
        // Image doesn't exist, need to create mapping
      }
      
      const mapping = await this.createIntelligentMapping(imagePath);
      if (mapping) {
        this.pathMappings.set(imagePath, mapping);
        this.stats.pathsMapped++;
      }
    }
  }

  // Create intelligent mapping for a missing image path
  async createIntelligentMapping(imagePath) {
    const filename = path.basename(imagePath);
    const dirname = path.dirname(imagePath);
    
    // Try to match against existing pattern
    const patternMatch = this.matchImagePattern(imagePath);
    if (patternMatch) {
      return await this.createPatternBasedMapping(imagePath, patternMatch);
    }
    
    // Try to find similar existing image
    const similarImage = await this.findSimilarExistingImage(filename);
    if (similarImage) {
      return {
        originalPath: imagePath,
        mappedPath: similarImage.path,
        status: 'similar',
        type: 'similarity_match',
        confidence: similarImage.confidence,
        reason: similarImage.reason
      };
    }
    
    // Generate new path based on intelligent rules
    return await this.generateNewImagePath(imagePath);
  }

  // Match image path against known patterns
  matchImagePattern(imagePath) {
    for (const [patternName, config] of Object.entries(this.pathPatterns)) {
      const match = imagePath.match(config.pattern);
      if (match) {
        return {
          pattern: patternName,
          config: config,
          matches: match,
          priority: config.priority
        };
      }
    }
    return null;
  }

  // Create mapping based on matched pattern
  async createPatternBasedMapping(imagePath, patternMatch) {
    const { pattern, config, matches } = patternMatch;
    const targetDir = path.join(this.imagesDir, config.directory);
    
    // Ensure target directory exists
    await fs.mkdir(targetDir, { recursive: true });
    
    // Generate appropriate filename for this pattern
    let newFilename;
    if (pattern === 'hero') {
      const product = matches[1];
      newFilename = `${product}-hero.jpg`;
    } else if (pattern === 'product-features') {
      const product = matches[1];
      const feature = matches[2];
      newFilename = `${product}-${feature}.jpg`;
    } else {
      newFilename = path.basename(imagePath);
    }
    
    const newPath = `/images/${config.directory}/${newFilename}`;
    
    return {
      originalPath: imagePath,
      mappedPath: newPath,
      status: 'pattern_mapped',
      type: 'pattern_match',
      pattern: pattern,
      directory: config.directory,
      priority: config.priority
    };
  }

  // Find similar existing image
  async findSimilarExistingImage(targetFilename) {
    try {
      const existingImages = await this.getAllExistingImages();
      const similarities = [];
      
      for (const existingPath of existingImages) {
        const existingFilename = path.basename(existingPath);
        const similarity = this.calculatePathSimilarity(targetFilename, existingFilename);
        
        if (similarity.score > 0.6) {
          similarities.push({
            path: existingPath.replace(this.publicDir, '').replace(/\\/g, '/'),
            filename: existingFilename,
            confidence: similarity.score,
            reason: similarity.reasons.join(', ')
          });
        }
      }
      
      // Return best match
      if (similarities.length > 0) {
        similarities.sort((a, b) => b.confidence - a.confidence);
        return similarities[0];
      }
      
      return null;
      
    } catch (error) {
      this.stats.errors.push({
        type: 'similarity_search_error',
        filename: targetFilename,
        error: error.message
      });
      return null;
    }
  }

  // Get all existing image files
  async getAllExistingImages() {
    const images = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    async function scanDir(dir) {
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            await scanDir(fullPath);
          } else if (imageExtensions.includes(path.extname(item.name).toLowerCase())) {
            images.push(fullPath);
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    }
    
    await scanDir(this.imagesDir);
    return images;
  }

  // Calculate similarity between two filenames
  calculatePathSimilarity(target, existing) {
    const targetLower = target.toLowerCase();
    const existingLower = existing.toLowerCase();
    const reasons = [];
    let score = 0;
    
    // Exact match
    if (targetLower === existingLower) {
      return { score: 1.0, reasons: ['exact_match'] };
    }
    
    // Remove extensions for comparison
    const targetBase = path.parse(targetLower).name;
    const existingBase = path.parse(existingLower).name;
    
    // Product name matching
    const productKeywords = ['iphone', 'samsung', 'galaxy', 'pixel', 'macbook', 'oneplus'];
    for (const keyword of productKeywords) {
      if (targetBase.includes(keyword) && existingBase.includes(keyword)) {
        score += 0.3;
        reasons.push(`product_match_${keyword}`);
        break;
      }
    }
    
    // Feature matching
    const featureKeywords = ['camera', 'battery', 'display', 'design', 'titanium', 'hero', 'pro', 'max', 'ultra'];
    let featureMatches = 0;
    for (const keyword of featureKeywords) {
      if (targetBase.includes(keyword) && existingBase.includes(keyword)) {
        featureMatches++;
        score += 0.15;
        reasons.push(`feature_match_${keyword}`);
      }
    }
    
    // Model number matching (15, 16, S24, etc.)
    const targetNumbers = targetBase.match(/\d+/g) || [];
    const existingNumbers = existingBase.match(/\d+/g) || [];
    const commonNumbers = targetNumbers.filter(n => existingNumbers.includes(n));
    if (commonNumbers.length > 0) {
      score += 0.2 * commonNumbers.length;
      reasons.push(`model_match_${commonNumbers.join('_')}`);
    }
    
    // String similarity (Levenshtein-like)
    const editDistance = this.calculateEditDistance(targetBase, existingBase);
    const maxLength = Math.max(targetBase.length, existingBase.length);
    const stringSimilarity = 1 - (editDistance / maxLength);
    score += stringSimilarity * 0.2;
    
    if (stringSimilarity > 0.7) {
      reasons.push('high_string_similarity');
    }
    
    return { score: Math.min(score, 1.0), reasons };
  }

  // Simple edit distance calculation
  calculateEditDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Generate new image path using intelligent rules
  async generateNewImagePath(imagePath) {
    const filename = path.basename(imagePath);
    const baseDir = this.determineImageDirectory(filename, imagePath);
    
    // Create target directory
    const targetDir = path.join(this.imagesDir, baseDir);
    await fs.mkdir(targetDir, { recursive: true });
    
    // Generate standardized filename
    const standardFilename = this.standardizeFilename(filename);
    const newPath = `/images/${baseDir}/${standardFilename}`;
    
    return {
      originalPath: imagePath,
      mappedPath: newPath,
      status: 'generated',
      type: 'intelligent_generation',
      directory: baseDir,
      standardizedName: standardFilename
    };
  }

  // Determine appropriate directory for image
  determineImageDirectory(filename, originalPath) {
    const fn = filename.toLowerCase();
    const path = originalPath.toLowerCase();
    
    // Author images
    if (path.includes('/authors/') || fn.includes('author')) {
      return 'authors';
    }
    
    // News images
    if (path.includes('/news/') || 
        fn.includes('event') || fn.includes('announcement') || 
        fn.includes('leak') || fn.includes('rumor')) {
      return 'news';
    }
    
    // Review images (in subdirectories)
    if (path.includes('/reviews/') || 
        fn.includes('review') || fn.includes('benchmark') || 
        fn.includes('comparison') || fn.includes('analysis')) {
      return 'reviews';
    }
    
    // Product images (default for most tech content)
    return 'products';
  }

  // Standardize filename according to conventions
  standardizeFilename(filename) {
    let standardized = filename.toLowerCase();
    
    // Remove common prefixes/suffixes
    standardized = standardized.replace(/^(img|image|photo|pic)[-_]/, '');
    standardized = standardized.replace(/[-_](img|image|photo|pic)$/, '');
    
    // Standardize separators
    standardized = standardized.replace(/[_\s]+/g, '-');
    
    // Remove multiple consecutive dashes
    standardized = standardized.replace(/-+/g, '-');
    
    // Remove leading/trailing dashes
    standardized = standardized.replace(/^-|-$/g, '');
    
    // Ensure .jpg extension
    if (!standardized.match(/\.(jpg|jpeg|png|webp)$/)) {
      standardized = standardized.replace(/\.[^.]+$/, '') + '.jpg';
    }
    
    return standardized;
  }

  // Save mappings to cache
  async saveMappings() {
    const mappingsData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      stats: this.stats,
      mappings: {}
    };
    
    for (const [key, value] of this.pathMappings.entries()) {
      mappingsData.mappings[key] = value;
    }
    
    // Ensure cache directory exists
    await fs.mkdir(path.dirname(this.cacheFile), { recursive: true });
    
    await fs.writeFile(this.cacheFile, JSON.stringify(mappingsData, null, 2));
    console.log(`💾 Saved ${this.pathMappings.size} path mappings to cache`);
  }

  // Apply mappings to fix actual files
  async applyPathMappings(dryRun = false) {
    console.log(`${dryRun ? '🔍' : '🔧'} ${dryRun ? 'Analyzing' : 'Applying'} path mappings...`);
    
    const fixes = [];
    const contentTypes = ['news', 'reviews', 'best', 'comparisons'];
    
    for (const type of contentTypes) {
      const typeDir = path.join(this.contentDir, type);
      
      try {
        const files = await fs.readdir(typeDir);
        const contentFiles = files.filter(f => f.endsWith('.mdx') || f.endsWith('.json'));
        
        for (const file of contentFiles) {
          const filePath = path.join(typeDir, file);
          const fileFixes = await this.applyMappingsToFile(filePath, dryRun);
          fixes.push(...fileFixes);
        }
      } catch (error) {
        console.error(`Error applying mappings to ${type}:`, error.message);
      }
    }
    
    console.log(`${dryRun ? '📊' : '✅'} ${fixes.length} path ${dryRun ? 'fixes identified' : 'mappings applied'}`);
    return fixes;
  }

  // Apply mappings to individual file
  async applyMappingsToFile(filePath, dryRun = false) {
    try {
      const originalContent = await fs.readFile(filePath, 'utf-8');
      let updatedContent = originalContent;
      const fixes = [];
      
      // Apply each mapping
      for (const [originalPath, mapping] of this.pathMappings.entries()) {
        if (originalContent.includes(originalPath) && mapping.mappedPath !== originalPath) {
          updatedContent = updatedContent.replace(
            new RegExp(this.escapeRegex(originalPath), 'g'),
            mapping.mappedPath
          );
          
          fixes.push({
            file: filePath,
            originalPath,
            mappedPath: mapping.mappedPath,
            type: mapping.type,
            status: mapping.status
          });
        }
      }
      
      // Write updated content if not dry run and changes were made
      if (!dryRun && updatedContent !== originalContent) {
        await fs.writeFile(filePath, updatedContent, 'utf-8');
        this.stats.pathsFixed += fixes.length;
      }
      
      return fixes;
      
    } catch (error) {
      this.stats.errors.push({
        type: 'file_update_error',
        file: filePath,
        error: error.message
      });
      return [];
    }
  }

  // Escape string for regex
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Generate mapping report
  generateMappingReport() {
    const mappingsArray = Array.from(this.pathMappings.entries());
    const byStatus = {};
    const byType = {};
    
    mappingsArray.forEach(([path, mapping]) => {
      byStatus[mapping.status] = (byStatus[mapping.status] || 0) + 1;
      byType[mapping.type] = (byType[mapping.type] || 0) + 1;
    });
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalPaths: this.stats.pathsAnalyzed,
        totalMappings: this.pathMappings.size,
        pathsFixed: this.stats.pathsFixed,
        pathsCreated: this.stats.pathsCreated,
        errors: this.stats.errors.length
      },
      breakdown: {
        byStatus,
        byType
      },
      mappings: mappingsArray.map(([path, mapping]) => ({
        originalPath: path,
        ...mapping
      })),
      errors: this.stats.errors
    };
  }

  // Get mapping for specific path
  getMapping(imagePath) {
    return this.pathMappings.get(imagePath) || null;
  }

  // Add custom mapping
  addMapping(originalPath, mappedPath, type = 'custom') {
    this.pathMappings.set(originalPath, {
      originalPath,
      mappedPath,
      status: 'custom',
      type,
      createdAt: new Date().toISOString()
    });
  }
}

module.exports = { ImagePathMapper };
