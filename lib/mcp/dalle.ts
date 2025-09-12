import OpenAI from 'openai';

export interface DalleImageOptions {
  prompt: string;
  model?: 'dall-e-2' | 'dall-e-3';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface DalleImageResponse {
  url: string;
  revised_prompt?: string;
  error?: string;
}

export class DalleClient {
  private client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it to constructor.');
    }
    this.client = new OpenAI({ apiKey: key });
  }

  async generateImage(options: DalleImageOptions): Promise<DalleImageResponse> {
    try {
      const {
        prompt,
        model = 'dall-e-3',
        size = '1792x1024', // Good for blog headers
        quality = 'hd',
        style = 'vivid',
        n = 1
      } = options;

      const response = await this.client.images.generate({
        model,
        prompt,
        size,
        quality,
        style,
        n
      });

      const image = response.data[0];
      if (!image?.url) {
        throw new Error('No image URL returned from DALL-E');
      }

      return {
        url: image.url,
        revised_prompt: image.revised_prompt
      };
    } catch (error: any) {
      console.error('DALL-E generation error:', error);
      return {
        url: '',
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async generateBlogImage(articleTitle: string, category: string, description?: string): Promise<DalleImageResponse> {
    // Create optimized prompts for different categories
    const categoryPrompts = {
      technology: 'futuristic technology, modern digital interface, sleek design, professional lighting',
      psychology: 'abstract brain visualization, neural networks, psychology concept, soft lighting',
      science: 'scientific laboratory, DNA helix, molecular structures, clean white background',
      health: 'medical equipment, healthcare technology, clean modern design, professional',
      space: 'cosmic space, planets, stars, nebula, astronomical phenomena, deep space',
      culture: 'artistic cultural elements, modern design, vibrant colors, contemporary style'
    };

    const basePrompt = categoryPrompts[category as keyof typeof categoryPrompts] || 'professional modern design, clean background';
    
    const fullPrompt = `${basePrompt}, ${articleTitle.toLowerCase()}, high quality, detailed, professional photography, 4k resolution, blog header image`;

    return this.generateImage({
      prompt: fullPrompt,
      model: 'dall-e-3',
      size: '1792x1024', // Perfect for blog headers
      quality: 'hd',
      style: 'vivid'
    });
  }

  async generateMultipleImages(prompts: string[]): Promise<DalleImageResponse[]> {
    const results = await Promise.allSettled(
      prompts.map(prompt => this.generateImage({ prompt }))
    );

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { url: '', error: result.reason?.message || 'Generation failed' }
    );
  }

  async healthCheck(): Promise<boolean> {
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

export const dalle = new DalleClient();
