// Diverse Image Sources - Solves the similar image problem
// Provides specific, varied images for different products and features

const crypto = require('crypto');

class DiverseImageSourceManager {
  constructor(config = {}) {
    this.unsplashAccessKey =
      config.unsplashAccessKey || process.env.UNSPLASH_ACCESS_KEY;

    // Expanded diverse image collections
    this.diverseImageDatabase = {
      // iPhone 16 Pro Max - Specific variations
      'iphone-16-pro-max-titanium-hero': [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1611472173362-3f8ad9dca087?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-16-pro-max-camera-system': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-16-pro-max-apple-intelligence': [
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-16-pro-max-a18-bionic': [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1591238371401-1f6e2d0e7ce2?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-16-pro-max-battery-life': [
        'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1558618666-fcd25d85cd64?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1625281147023-33eb69b4e79c?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-16-pro-max-titanium-design': [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1607083676038-7b1e39e4511a?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1689088262554-fb447b36b1e9?w=1200&h=800&fit=crop&q=90',
      ],

      // iPhone 15 Pro Max - Different from iPhone 16
      'iphone-15-pro-hero': [
        'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1674574124475-16dd78234342?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1678652197417-d98b4e11b86b?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-15-pro-max-camera': [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1588422188589-2bdd3c9b8496?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1569154103283-62e9ff9ac6db?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-15-pro-max-titanium': [
        'https://images.unsplash.com/photo-1663519540056-77b1e31e2934?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1678373470156-d3b8c4c8e29c?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1678373469976-dac2f34e1d7b?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-15-pro-max-display': [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1558618666-fcd25d85cd64?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-15-pro-max-battery': [
        'https://images.unsplash.com/photo-1613235788366-7d6b9f5d3f6e?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1591642068228-d2f8c7cba924?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1637149456468-caa20e6ed0b8?w=1200&h=800&fit=crop&q=90',
      ],
      'iphone-15-pro-max-usbc': [
        'https://images.unsplash.com/photo-1625735113341-a3ae8e7d9c8b?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1622897946095-9bb2a3cce6a6?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1608809116225-c3a2c01fdd60?w=1200&h=800&fit=crop&q=90',
      ],

      // Samsung Galaxy S24 - Distinct visual style
      'samsung-galaxy-s24-hero': [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=1200&h=800&fit=crop&q=90',
      ],
      'samsung-galaxy-s24-comparison': [
        'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1583573636674-f710cda5a0c8?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&h=800&fit=crop&q=90',
      ],
      'galaxy-s24-main': [
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1575648307103-6b56f3ee7c22?w=1200&h=800&fit=crop&q=90',
      ],
      'galaxy-s24-guide': [
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1569154103283-62e9ff9ac6db?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1588422188589-2bdd3c9b8496?w=1200&h=800&fit=crop&q=90',
      ],

      // Google Pixel - Clean, minimalist style
      'google-pixel-9-pro-hero': [
        'https://images.unsplash.com/photo-1541522849-82e7e1b6b2eb?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&q=90',
      ],
      'pixel-8-guide': [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=800&fit=crop&q=90',
      ],

      // OnePlus - Performance focused
      'oneplus-12-hero': [
        'https://images.unsplash.com/photo-1520923642038-b4259acecbd7?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&q=90',
      ],

      // Nothing Phone - Unique design
      'nothing-phone-2-guide': [
        'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1554775480-da8c9fbbf267?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=800&fit=crop&q=90',
      ],

      // Feature-specific diverse images
      'camera-comparison': [
        'https://images.unsplash.com/photo-1606983340126-99ab4feaa64b?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=90',
      ],
      'performance-benchmarks': [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=800&fit=crop&q=90',
      ],
      'titanium-design': [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1624974027593-e7d36f1a6c21?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=1200&h=800&fit=crop&q=90',
      ],

      // News images - Events and concepts
      'vision-pro-2-concept': [
        'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=1200&h=800&fit=crop&q=90',
        'https://images.unsplash.com/photo-1584697964358-3e14ca57658b?w=1200&h=800&fit=crop&q=90',
      ],
    };

    this.usedImages = new Set();
  }

  // Get diverse image with rotation to avoid duplicates
  getDiverseImageUrl(filename, options = {}) {
    const baseKey = this.extractImageKey(filename);
    const variations = this.diverseImageDatabase[baseKey];

    if (!variations || variations.length === 0) {
      console.log(
        `No specific variations for ${baseKey}, using intelligent fallback`
      );
      return this.getIntelligentFallback(filename, options);
    }

    // Select image based on filename hash for consistency + variation
    const imageIndex = this.selectImageIndex(filename, variations.length);
    const selectedUrl = variations[imageIndex];

    // Add variation parameters if needed
    const dimensions = options.dimensions || { width: 1200, height: 800 };
    const quality = options.quality === 'premium' ? 95 : 85;

    // Extract Unsplash photo ID and reconstruct with proper parameters
    const photoMatch = selectedUrl.match(/photo-([a-zA-Z0-9_-]+)/);
    if (photoMatch) {
      const photoId = photoMatch[1];
      return `https://images.unsplash.com/photo-${photoId}?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=${quality}&auto=format`;
    }

    return selectedUrl;
  }

  // Extract meaningful key from filename
  extractImageKey(filename) {
    const cleanName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');

    // Direct matches for specific products/features
    const exactMatches = Object.keys(this.diverseImageDatabase);
    const directMatch = exactMatches.find(
      (key) => cleanName.includes(key) || key.includes(cleanName)
    );

    if (directMatch) {
      return directMatch;
    }

    // Pattern-based matching
    if (cleanName.includes('iphone-16')) {
      if (cleanName.includes('camera'))
        return 'iphone-16-pro-max-camera-system';
      if (cleanName.includes('intelligence'))
        return 'iphone-16-pro-max-apple-intelligence';
      if (cleanName.includes('a18') || cleanName.includes('bionic'))
        return 'iphone-16-pro-max-a18-bionic';
      if (cleanName.includes('battery'))
        return 'iphone-16-pro-max-battery-life';
      if (cleanName.includes('titanium') || cleanName.includes('design'))
        return 'iphone-16-pro-max-titanium-design';
      if (cleanName.includes('hero')) return 'iphone-16-pro-max-titanium-hero';
    }

    if (cleanName.includes('iphone-15')) {
      if (cleanName.includes('camera')) return 'iphone-15-pro-max-camera';
      if (cleanName.includes('titanium')) return 'iphone-15-pro-max-titanium';
      if (cleanName.includes('display')) return 'iphone-15-pro-max-display';
      if (cleanName.includes('battery')) return 'iphone-15-pro-max-battery';
      if (cleanName.includes('usbc') || cleanName.includes('usb-c'))
        return 'iphone-15-pro-max-usbc';
      if (cleanName.includes('hero')) return 'iphone-15-pro-hero';
    }

    if (cleanName.includes('galaxy') || cleanName.includes('samsung')) {
      if (cleanName.includes('comparison'))
        return 'samsung-galaxy-s24-comparison';
      if (cleanName.includes('guide')) return 'galaxy-s24-guide';
      if (cleanName.includes('main')) return 'galaxy-s24-main';
      return 'samsung-galaxy-s24-hero';
    }

    if (cleanName.includes('pixel')) {
      if (cleanName.includes('guide')) return 'pixel-8-guide';
      return 'google-pixel-9-pro-hero';
    }

    if (cleanName.includes('oneplus')) {
      return 'oneplus-12-hero';
    }

    if (cleanName.includes('nothing')) {
      return 'nothing-phone-2-guide';
    }

    if (cleanName.includes('vision-pro')) {
      return 'vision-pro-2-concept';
    }

    // Feature-based matching
    if (cleanName.includes('camera') && cleanName.includes('comparison')) {
      return 'camera-comparison';
    }

    if (cleanName.includes('performance') || cleanName.includes('benchmark')) {
      return 'performance-benchmarks';
    }

    if (cleanName.includes('titanium') && cleanName.includes('design')) {
      return 'titanium-design';
    }

    // Fallback to intelligent system
    return null;
  }

  // Select image index based on filename hash for consistency
  selectImageIndex(filename, arrayLength) {
    // Create hash of filename for consistent selection
    const hash = crypto.createHash('md5').update(filename).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16);

    return hashValue % arrayLength;
  }

  // Enhanced fallback with more variety
  getIntelligentFallback(filename, options = {}) {
    const fn = filename.toLowerCase();
    const { dimensions = { width: 1200, height: 800 } } = options;

    // More diverse fallback collections
    const fallbackCollections = {
      iphone: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd',
        'https://images.unsplash.com/photo-1611472173362-3f8ad9dca087',
        'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb',
      ],
      samsung: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505',
        'https://images.unsplash.com/photo-1564466809058-bf4114d55352',
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91',
      ],
      google: [
        'https://images.unsplash.com/photo-1541522849-82e7e1b6b2eb',
        'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
      ],
      camera: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        'https://images.unsplash.com/photo-1606983340126-99ab4feaa64b',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd',
      ],
      tech: [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
      ],
    };

    let collection;
    if (fn.includes('iphone')) {
      collection = fallbackCollections.iphone;
    } else if (fn.includes('samsung') || fn.includes('galaxy')) {
      collection = fallbackCollections.samsung;
    } else if (fn.includes('pixel') || fn.includes('google')) {
      collection = fallbackCollections.google;
    } else if (fn.includes('camera')) {
      collection = fallbackCollections.camera;
    } else {
      collection = fallbackCollections.tech;
    }

    // Select from collection using filename hash
    const index = this.selectImageIndex(filename, collection.length);
    const baseUrl = collection[index];

    return `${baseUrl}?w=${dimensions.width}&h=${dimensions.height}&fit=crop&q=85&auto=format`;
  }

  // Get usage statistics
  getUsageStats() {
    return {
      totalVariations: Object.values(this.diverseImageDatabase).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      productTypes: Object.keys(this.diverseImageDatabase).length,
      usedImages: this.usedImages.size,
    };
  }
}

module.exports = { DiverseImageSourceManager };
