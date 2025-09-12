const OpenAI = require('openai');

class DalleClient {
  constructor(apiKey) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it to constructor.');
    }
    this.client = new OpenAI({ apiKey: key });
  }

  async generateImage(options) {
    try {
      const {
        prompt,
        model = 'dall-e-3',
        size = '1792x1024', // Good for blog headers
        quality = 'hd',
        style = 'vivid',
        n = 1
      } = options;

      // Build request parameters
      const requestParams = {
        model,
        prompt,
        size,
        n
      };

      // Only add quality and style for DALL-E-3
      if (model === 'dall-e-3') {
        requestParams.quality = quality;
        requestParams.style = style;
      }

      const response = await this.client.images.generate(requestParams);

      const image = response.data[0];
      if (!image?.url) {
        throw new Error('No image URL returned from DALL-E');
      }

      return {
        url: image.url,
        revised_prompt: image.revised_prompt
      };
    } catch (error) {
      console.error('DALL-E generation error:', error);
      return {
        url: '',
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async generateBlogImage(articleTitle, category, description) {
    // Create optimized prompts for different categories
    const categoryPrompts = {
      technology: 'futuristic technology, modern digital interface, sleek design, professional lighting',
      psychology: 'abstract brain visualization, neural networks, psychology concept, soft lighting',
      science: 'scientific laboratory, DNA helix, molecular structures, clean white background',
      health: 'medical equipment, healthcare technology, clean modern design, professional',
      space: 'cosmic space, planets, stars, nebula, astronomical phenomena, deep space',
      culture: 'artistic cultural elements, modern design, vibrant colors, contemporary style'
    };

    const basePrompt = categoryPrompts[category] || 'professional modern design, clean background';
    
    const fullPrompt = `${basePrompt}, ${articleTitle.toLowerCase()}, high quality, detailed, professional photography, 4k resolution, blog header image`;

    return this.generateImage({
      prompt: fullPrompt,
      model: 'dall-e-3',
      size: '1792x1024', // Perfect for blog headers
      quality: 'hd',
      style: 'vivid'
    });
  }

  async generateMultipleImages(prompts) {
    const results = await Promise.allSettled(
      prompts.map(prompt => this.generateImage({ prompt }))
    );

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { url: '', error: result.reason?.message || 'Generation failed' }
    );
  }

  async healthCheck() {
    try {
      await this.generateImage({
        prompt: 'simple test image',
        model: 'dall-e-2', // Use cheaper model for health check
        size: '1024x1024'
      });
      return true;
    } catch (error) {
      console.error('DALL-E health check failed:', error);
      return false;
    }
  }
}

module.exports = { DalleClient };
