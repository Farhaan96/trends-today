#!/usr/bin/env node

/**
 * Professional Photorealistic AI Image Generator - gpt-image-1 ONLY
 * Generates publication-quality, context-aware professional photography from article content
 * Professional photography standards with National Geographic / Scientific American quality
 * Cost-optimized for professional editorial use with photorealistic prompting
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const matter = require('gray-matter');

class AIImageGenerator {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;

    this.cacheDir = path.join(__dirname, '..', '.cache', 'ai-images');
    this.outputDir = path.join(
      __dirname,
      '..',
      'public',
      'images',
      'ai-generated'
    );

    // Optimized settings for cost and quality based on gpt-image-1 specs
    this.defaultOptions = {
      size: '1024x1024', // Supported: 1024x1024, 1024x1536, 1536x1024
      quality: 'high', // Supported: low | medium | high | auto
      model: 'gpt-image-1',
      n: 1, // Only 1 image per request supported
    };

    // Rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 3000; // 3 seconds for gpt-image-1

    this.generatedImages = [];
    this.errors = [];
  }

  async ensureDirs() {
    await fs.mkdir(this.cacheDir, { recursive: true }).catch(() => {});
    await fs.mkdir(this.outputDir, { recursive: true }).catch(() => {});
  }

  // Dynamic content extraction for contextual image generation
  extractMainTopics(content) {
    const topics = [];

    // Extract from headers (## and ###)
    const headers = content.match(/^#{2,3}\s+(.+)$/gm) || [];
    headers.forEach((header) => {
      const cleaned = header.replace(/^#{2,3}\s+/, '').replace(/[*_`]/g, '');
      topics.push(cleaned);
    });

    // Extract from bold text
    const boldText = content.match(/\*\*([^*]+)\*\*/g) || [];
    boldText.forEach((bold) => {
      const cleaned = bold.replace(/\*\*/g, '');
      if (cleaned.length > 3 && cleaned.length < 50) {
        topics.push(cleaned);
      }
    });

    return [...new Set(topics)].slice(0, 5); // Top 5 unique topics
  }

  extractKeyStatistics(content) {
    const stats = [];

    // Find percentages
    const percentages = content.match(/\b\d+(\.\d+)?%/g) || [];
    stats.push(...percentages);

    // Find numbers with units (improved for space/science)
    const numbers =
      content.match(
        /\b[\d,]+(\.\d+)?[\s-]?(million|billion|thousand|years?|days?|hours?|minutes?|seconds?|miles?|MPH|mph|°F|°C|degrees?)\b/gi
      ) || [];
    stats.push(...numbers);

    // Find dollar amounts
    const money = content.match(/\$[\d,]+(\.\d+)?(K|M|B)?/gi) || [];
    stats.push(...money);

    // Find space/science specific numbers
    const spaceNumbers =
      content.match(
        /\b\d+[\s-]?(qubits?|watts?|volts?|amps?|hertz|Hz|GHz|MHz|kilometers?|km|feet|ft|meters?|m)\b/gi
      ) || [];
    stats.push(...spaceNumbers);

    // Find speed measurements
    const speeds =
      content.match(
        /\b[\d,]+(\.\d+)?[\s-]?(miles per hour|mph|MPH|kilometers per hour|kph|KPH)\b/gi
      ) || [];
    stats.push(...speeds);

    return [...new Set(stats)].slice(0, 3); // Top 3 unique stats
  }

  // Build a visual plan (subject/environment/action/mood/palette) from content
  buildVisualPlan(articleTitle, articleContent) {
    const text = `${articleTitle}\n${articleContent}`.toLowerCase();
    const topics = this.extractMainTopics(articleContent).map((t) =>
      t.toLowerCase()
    );

    const hasAny = (arr) => arr.some((w) => text.includes(w));

    // 1) Custom editor-defined plans (config/image-visual-plans.json)
    try {
      const custom = this.loadCustomPlans();
      if (custom && Array.isArray(custom.patterns)) {
        for (const entry of custom.patterns) {
          const pats = (entry.match || []).map((p) => new RegExp(p, 'i'));
          if (pats.length === 0) continue;
          const matched = pats.some(
            (rx) => rx.test(text) || topics.some((t) => rx.test(t))
          );
          if (matched && entry.plan) {
            const { subject, environment, action, mood, palette } = entry.plan;
            if (subject && environment && action && mood && palette) {
              return entry.plan;
            }
          }
        }
      }
    } catch (_) {
      // ignore config errors and continue to heuristics
    }

    // Keyword clusters for common editorial concepts
    const K = {
      adolescentMentalHealth: [
        'child',
        'children',
        'kid',
        'teen',
        'adolescent',
        'parent',
        'parenting',
        'family',
        'pediatric',
        'school',
        'classroom',
        'teacher',
        'counselor',
        'therapist',
        'clinic',
        'mental health',
        '13-year',
        'thirteen',
      ],
      misinformation: [
        'misinformation',
        'disinformation',
        'fake news',
        'deepfake',
        'conspiracy',
        'hoax',
        'fact-check',
        'rumor',
        'propaganda',
        'algorithmic amplification',
      ],
      privacy: [
        'privacy',
        'data',
        'tracking',
        'ad tracking',
        'cookies',
        'biometric',
        'facial recognition',
        'metadata',
        'encryption',
        'anonymity',
      ],
      surveillance: [
        'surveillance',
        'cctv',
        'monitoring',
        'mass surveillance',
        'spyware',
        'wiretap',
        'nsa',
        'police state',
        'watchlist',
      ],
      addiction: [
        'addiction',
        'compulsion',
        'doomscroll',
        'dopamine loop',
        'screen time',
        'overuse',
        'withdrawal',
        'habit loop',
      ],
      social: [
        'social media',
        'creator',
        'influencer',
        'viral',
        'algorithm',
        'follower',
        'platform',
        'tiktok',
        'youtube',
        'instagram',
        'clout',
        'engagement',
        'notification',
        'dopamine',
        'burnout',
        'toxicity',
      ],
      archaeology: [
        'sumerian',
        'anunnaki',
        'mesopotamia',
        'archaeolog',
        'cuneiform',
        'tablet',
        'artifact',
        'museum',
      ],
      psychology: [
        'cognitive',
        'bias',
        'mind',
        'brain',
        'behavior',
        'therapy',
        'depression',
        'anxiety',
      ],
      health: [
        'clinical',
        'patient',
        'medical',
        'treatment',
        'diagnosis',
        'hospital',
      ],
      space: [
        'nasa',
        'space',
        'planet',
        'orbit',
        'probe',
        'mission',
        'cosmic',
        'astronomy',
        'exoplanet',
      ],
      tech: [
        'ai',
        'robot',
        'chip',
        'semiconductor',
        'device',
        'smartphone',
        'quantum',
        'software',
      ],
    };

    // Heuristic visual plans (specific themes first, but context-aware)

    // Check for AI Avatar/Virtual Influencer content FIRST (most specific for culture)
    if (
      (hasAny(K.social) || hasAny(['culture'])) &&
      (topics.some(
        (t) =>
          t.toLowerCase().includes('avatar') ||
          t.toLowerCase().includes('virtual') ||
          t.toLowerCase().includes('ai influencer') ||
          t.toLowerCase().includes('digital persona')
      ) ||
        text.includes('avatar') ||
        text.includes('virtual influencer') ||
        text.includes('ai influencer') ||
        text.includes('digital persona'))
    ) {
      return {
        subject:
          'sleek holographic AI avatar interface on a modern smartphone or tablet, with abstract digital persona elements and social media UI mockups (no readable text or brand logos)',
        environment:
          'modern creator studio or high-tech workspace with soft LED lighting and minimal setup',
        action:
          'digital avatar creation process with floating interface elements suggesting content generation',
        mood: 'futuristic, innovative, cutting-edge technology in creative space',
        palette:
          'cool blues and purples with neon accents and modern metallics',
      };
    }

    // Mental health topics should only trigger if NOT primarily about creator economy/AI
    if (
      hasAny(K.adolescentMentalHealth) &&
      !hasAny(K.social) &&
      !topics.some(
        (t) =>
          t.toLowerCase().includes('creator') ||
          t.toLowerCase().includes('influencer') ||
          t.toLowerCase().includes('avatar') ||
          t.toLowerCase().includes('virtual')
      )
    ) {
      return {
        subject:
          'a parent and pre-teen sitting together at a kitchen table or pediatric clinic, smartphone placed face down on the table or in a small household basket nearby',
        environment:
          'daytime natural light, warm and supportive home or clinic setting, no identifiable branding or readable text',
        action:
          'calm conversation posture with gentle attention toward each other; phone clearly not in use',
        mood: 'supportive, protective, evidence-based guidance for healthy development',
        palette: 'warm neutrals and natural daylight tones',
      };
    }
    if (
      hasAny(K.misinformation) ||
      topics.some(
        (t) =>
          t.includes('misinform') ||
          t.includes('fake') ||
          t.includes('deepfake')
      )
    ) {
      return {
        subject:
          'a person at a desk surrounded by multiple screens showing conflicting, blurred thumbnail-like panels (no readable text)',
        environment:
          'dim room with screens as primary light source; abstract UI shapes suggesting contradictory feeds',
        action: 'head tilted, uncertain posture, hands near keyboard or mouse',
        mood: 'confused, overwhelmed, critical of information chaos',
        palette:
          'cool blues and harsh highlights with subtle red accents indicating warning',
      };
    }

    if (hasAny(K.privacy)) {
      return {
        subject:
          'a person holding a smartphone with camera partially covered by a hand, laptop webcam covered with tape',
        environment:
          'subtle home/desk scene; soft depth of field; faint abstract tracker glyphs floating in bokeh (no logos or text)',
        action: 'protective gesture covering sensors, phone close to chest',
        mood: 'cautious, protective, privacy-conscious',
        palette: 'neutral tones with muted teal accents',
      };
    }

    if (hasAny(K.surveillance)) {
      return {
        subject:
          'a cluster of generic CCTV cameras angled toward a pedestrian walkway (no brands)',
        environment:
          'urban setting with long shadows; slight haze for atmosphere',
        action:
          'cameras pointed in different directions, implying pervasive monitoring',
        mood: 'uneasy, observed, systemic oversight',
        palette: 'desaturated grayscale with cold blue highlights',
      };
    }

    if (
      hasAny(K.addiction) ||
      topics.some((t) => t.includes('doomscroll') || t.includes('addict'))
    ) {
      return {
        subject:
          'hands gripping a smartphone tightly with thumbs mid-scroll, face illuminated by blue light',
        environment:
          'dark bedroom at night with only screen glow lighting the scene',
        action: 'endless scrolling gesture captured mid-motion',
        mood: 'compulsive, isolating, nocturnal',
        palette: 'deep blues and dark shadows with bright screen highlights',
      };
    }

    if (
      hasAny(K.social) ||
      topics.some((t) => t.includes('creator') || t.includes('viral'))
    ) {
      // Check if this is specifically about AI avatars/virtual influencers
      if (
        topics.some(
          (t) =>
            t.toLowerCase().includes('avatar') ||
            t.toLowerCase().includes('virtual') ||
            t.toLowerCase().includes('ai influencer')
        ) ||
        text.includes('avatar') ||
        text.includes('virtual influencer')
      ) {
        return {
          subject:
            'futuristic AI avatar interface on multiple screens showing virtual influencer profiles and digital personas (no readable text)',
          environment:
            'modern tech studio with holographic displays and professional lighting setup',
          action:
            'dynamic AI avatar generation process with floating digital elements',
          mood: 'innovative, futuristic, cutting-edge creator technology',
          palette: 'vibrant blues and purples with holographic highlights',
        };
      } else {
        return {
          subject:
            'a solitary content creator figure, head down, illuminated by the cold glow of a phone and laptop',
          environment:
            'small dim room at night with cluttered desk; abstract, generic notification shapes floating subtly (no brand UI)',
          action:
            'sitting at a desk, surrounded by overwhelming digital cues suggesting endless engagement',
          mood: 'somber, isolating, critical of toxic attention dynamics',
          palette:
            'cool blues and desaturated tones with harsh screen highlights',
        };
      }
    }

    if (
      hasAny(K.archaeology) ||
      topics.some((t) => t.includes('archaeolog') || t.includes('sumerian'))
    ) {
      return {
        subject:
          'ancient Mesopotamian cuneiform tablets and artifacts on archival supports',
        environment:
          'museum conservation table with soft diffused lighting and neutral archival background',
        action: 'close-up documentation emphasizing inscriptions and texture',
        mood: 'scholarly, meticulous, respectful of antiquity',
        palette: 'neutral warm stone tones with soft shadows',
      };
    }

    if (hasAny(K.space)) {
      return {
        subject:
          'space exploration concept consistent with real mission photography',
        environment: 'deep space backdrop with subtle stars; no logos or text',
        action: 'spacecraft or planetary scene presented in documentary style',
        mood: 'awe, vastness, scientific rigor',
        palette: 'deep blacks, subtle blues and whites',
      };
    }

    if (hasAny(K.tech)) {
      return {
        subject: 'modern technology subject closely tied to the article focus',
        environment: 'clean editorial studio setup with minimal props',
        action: 'hero product or conceptual tech representation',
        mood: 'precise, modern, high-clarity',
        palette: 'neutral grayscale with a single accent color',
      };
    }

    if (hasAny(K.psychology)) {
      return {
        subject:
          'human silhouette or portrait conveying cognitive/behavioral theme without text or symbols',
        environment: 'soft, minimal studio backdrop with layered depth',
        action: 'subtle pose emphasizing introspection',
        mood: 'thoughtful, analytical',
        palette: 'neutral tones with soft highlights',
      };
    }

    if (hasAny(K.health)) {
      return {
        subject:
          'clinical instruments or lab elements relevant to the topic (no branding)',
        environment: 'sterile, clean clinical setup',
        action: 'careful arrangement emphasizing precision',
        mood: 'trustworthy, clinical',
        palette: 'clean whites and soft blues',
      };
    }

    // Fallback: use title/topics as the visual nucleus
    const nucleus = (articleTitle || topics[0] || 'the article subject')
      .replace(/\s+/g, ' ')
      .trim();
    return {
      subject: `${nucleus} represented in a contextually appropriate, photorealistic editorial scene`,
      environment: 'minimal, uncluttered background that supports the subject',
      action: 'clear focal presentation with shallow depth of field',
      mood: 'professional, editorial',
      palette: 'neutral tones with natural highlights',
    };
  }

  loadCustomPlans() {
    if (this._customPlans !== null) return this._customPlans;
    this._customPlans = null;
    try {
      const cfgPath = path.join(
        process.cwd(),
        'config',
        'image-visual-plans.json'
      );
      const raw = require('fs').readFileSync(cfgPath, 'utf8');
      this._customPlans = JSON.parse(raw);
    } catch (_) {
      this._customPlans = null;
    }
    return this._customPlans;
  }

  extractTechnologies(content, category = 'technology') {
    const techTermsByCategory = {
      technology: [
        'AI',
        'artificial intelligence',
        'machine learning',
        'neural network',
        'quantum',
        'blockchain',
        'cryptocurrency',
        'VR',
        'AR',
        'IoT',
        'cloud computing',
        '5G',
        'robotics',
        'autonomous',
        'automation',
        'smartphone',
        'iPhone',
        'Android',
        'app',
        'software',
        'hardware',
        'algorithm',
        'data',
        'analytics',
        'cybersecurity',
        'privacy',
      ],
      space: [
        'NASA',
        'SpaceX',
        'Parker Solar Probe',
        'spacecraft',
        'probe',
        'rover',
        'satellite',
        'rocket',
        'astronaut',
        'space station',
        'ISS',
        'Mars',
        'solar',
        'corona',
        'flyby',
        'orbit',
        'telescope',
        'galaxy',
        'planet',
        'asteroid',
        'comet',
        'space exploration',
        'mission',
        'launch',
        'lunar',
      ],
      science: [
        'CRISPR',
        'DNA',
        'genome',
        'protein',
        'molecule',
        'research',
        'study',
        'clinical trial',
        'laboratory',
        'experiment',
        'analysis',
        'breakthrough',
        'discovery',
        'superconductor',
        'quantum',
        'physics',
        'chemistry',
      ],
      health: [
        'clinical',
        'medical',
        'treatment',
        'therapy',
        'diagnosis',
        'patient',
        'healthcare',
        'medicine',
        'pharmaceutical',
        'drug',
        'vaccine',
        'trial',
        'FDA',
        'biotech',
        'precision medicine',
        'personalized medicine',
      ],
      psychology: [
        'brain',
        'neuroscience',
        'cognitive',
        'mental health',
        'therapy',
        'psychology',
        'psychiatry',
        'depression',
        'anxiety',
        'mindfulness',
        'behavioral',
        'neuroplasticity',
        'psychedelic',
        'meditation',
      ],
      culture: [
        'social media',
        'creator economy',
        'influencer',
        'viral',
        'platform',
        'content creation',
        'streaming',
        'TikTok',
        'YouTube',
        'Instagram',
        'digital culture',
        'online community',
        'metaverse',
      ],
    };

    const techTerms =
      techTermsByCategory[category] || techTermsByCategory.technology;
    const found = [];
    const contentLower = content.toLowerCase();

    techTerms.forEach((term) => {
      // Use word boundaries to match whole words only
      const regex = new RegExp(
        `\\b${term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'i'
      );
      if (regex.test(contentLower)) {
        found.push(term);
      }
    });
    return [...new Set(found)].slice(0, 4); // Top 4 unique technologies
  }

  determineMood(content) {
    const contentLower = content.toLowerCase();

    // Analyze sentiment indicators
    const positive = [
      'breakthrough',
      'revolutionary',
      'amazing',
      'incredible',
      'success',
      'advance',
    ];
    const urgent = [
      'emergency',
      'critical',
      'urgent',
      'breaking',
      'alert',
      'crisis',
    ];
    const scientific = [
      'study',
      'research',
      'analysis',
      'findings',
      'evidence',
      'data',
    ];
    const futuristic = [
      'future',
      'tomorrow',
      'next-gen',
      'cutting-edge',
      'innovation',
    ];

    let mood = 'professional';

    if (positive.some((word) => contentLower.includes(word)))
      mood = 'optimistic';
    if (urgent.some((word) => contentLower.includes(word))) mood = 'urgent';
    if (scientific.some((word) => contentLower.includes(word)))
      mood = 'analytical';
    if (futuristic.some((word) => contentLower.includes(word)))
      mood = 'futuristic';

    return mood;
  }

  async generateDynamicPrompt(articleTitle, articleContent, category) {
    const topics = this.extractMainTopics(articleContent);
    const stats = this.extractKeyStatistics(articleContent);
    const technologies = this.extractTechnologies(articleContent, category);
    const mood = this.determineMood(articleContent);

    // Professional photography style based on category - Enhanced for GPT-Image-1
    const categoryStyles = {
      technology: {
        style:
          'Clean tech photography, minimalist design, modern professional corporate aesthetic, high-end consumer electronics styling',
        lighting:
          'professional studio lighting with soft key light, subtle rim lighting, controlled shadows',
        camera:
          'shot with Canon EOS R5, 85mm f/1.4 lens, commercial product photography setup',
        composition:
          'rule of thirds composition, shallow depth of field with natural bokeh, pristine white background gradient',
      },
      science: {
        style:
          'Documentary photography style, museum quality archival presentation, academic research documentation, ancient artifacts, cuneiform tablets, archaeological excavation sites',
        lighting:
          'natural diffused museum lighting, professional archival documentation lighting',
        camera:
          'shot with medium format camera, macro lens for intricate detail, scientific documentation grade',
        composition:
          'centered scholarly composition, maximum detail preservation, laboratory or excavation setting',
      },
      space: {
        style:
          'NASA photography style, scientific space mission documentation, high-resolution astronomical imaging, cosmic phenomena visualization',
        lighting:
          'dramatic cosmic lighting, celestial illumination, professional space photography effects',
        camera:
          'shot with professional astronomical imaging equipment, ultra-high resolution space photography',
        composition:
          'expansive wide angle composition, infinite cosmic depth, authentic space environment',
      },
      health: {
        style:
          'Medical photography style, clinical documentation standards, professional healthcare presentation, precision medicine visualization',
        lighting:
          'soft clinical lighting, medical grade illumination, professional healthcare setup',
        camera:
          'shot with medical imaging camera, precision optics, healthcare documentation grade',
        composition:
          'clean sterile medical environment, professional healthcare presentation standards',
      },
      psychology: {
        style:
          'Professional psychological study photography, human-centered research documentation, cognitive science visualization',
        lighting:
          'soft natural portrait lighting, psychological study atmosphere, empathetic professional setup',
        camera:
          'shot with portrait lens 85mm f/1.4, professional psychological research photography',
        composition:
          'shallow depth of field, natural bokeh background, human-focused therapeutic environment',
      },
      culture: {
        style:
          'Documentary photojournalism style, cultural anthropology documentation, authentic social media and creator economy visualization',
        lighting:
          'natural golden hour lighting, authentic environmental illumination, documentary realism',
        camera:
          'shot with documentary camera 35mm lens, professional photojournalism equipment',
        composition:
          'dynamic storytelling composition, environmental context, authentic cultural documentation',
      },
    };

    const styleGuide = categoryStyles[category] || categoryStyles.technology;

    // Enhanced professional photography mood settings for GPT-Image-1
    const professionalMoodStyles = {
      optimistic: {
        lighting:
          'bright natural golden hour lighting, warm professional atmosphere, uplifting illumination',
        composition:
          'upward dynamic angle, positive energy composition, vibrant professional color palette',
      },
      urgent: {
        lighting:
          'dramatic high contrast lighting, professional news photography setup, urgent atmosphere',
        composition:
          'dynamic tension angle, breaking news photography style, professional journalism presentation',
      },
      analytical: {
        lighting:
          'clean scientific lighting, neutral professional tones, research laboratory atmosphere',
        composition:
          'precise methodical composition, data-focused presentation, professional academic photography',
      },
      futuristic: {
        lighting:
          'modern LED accent lighting, cutting-edge tech atmosphere, innovation-focused setup',
        composition:
          'forward-thinking angle, technological advancement focus, professional innovation photography',
      },
      professional: {
        lighting:
          'corporate executive lighting setup, sophisticated business atmosphere, premium professional grade',
        composition:
          'executive composition, sophisticated professional angle, high-end business photography',
      },
    };

    const moodStyle =
      professionalMoodStyles[mood] || professionalMoodStyles.professional;

    // Build enhanced professional photorealistic prompt for GPT-Image-1
    let prompt = `Professional editorial photography for ${category} article: "${articleTitle}".

SUBJECT MATTER:`;

    // Add extracted content
    if (topics.length > 0) {
      prompt += `\nPrimary focus: ${topics.slice(0, 3).join(', ')}`;
    }
    if (technologies.length > 0) {
      prompt += `\nTechnology elements: ${technologies.slice(0, 2).join(' and ')}`;
    }
    if (stats.length > 0) {
      prompt += `\nKey data points: ${stats.slice(0, 2).join(', ')}`;
    }

    // Enhanced photography specifications
    prompt += `

CAMERA & TECHNICAL SPECIFICATIONS:
- ${styleGuide.camera}
- ${styleGuide.lighting}, ${moodStyle.lighting}
- ${styleGuide.composition}, ${moodStyle.composition}
- Professional depth of field control, tack sharp focus on subject
- Shot in RAW format with professional color grading

VISUAL STYLE & AESTHETIC:
- ${styleGuide.style}
- Photorealistic documentary-grade professional photography
- National Geographic / Scientific American publication quality
- Commercial photography standards with editorial presentation
- 1536x1024 aspect ratio optimized for digital publication headers

LIGHTING & ATMOSPHERE:
- Professional studio-grade lighting setup
- Controlled shadows and highlights for maximum detail
- Color temperature balanced for publication standards
- ${moodStyle.lighting}

COMPOSITION & FRAMING:
- ${moodStyle.composition}
- Professional editorial composition standards
- Visual hierarchy optimized for article header presentation
- Background elements supporting but not competing with subject`;

    // Absolute restrictions for editorial quality
    prompt += `

EDITORIAL RESTRICTIONS (CRITICAL):
- ABSOLUTELY NO text, numbers, words, letters, or any readable characters
- NO logos, watermarks, brand names, or corporate identifiers
- NO cartoon, illustration, CGI, or artistic interpretation styles
- NO amateur photography aesthetics or social media filters
- ONLY photorealistic, professional documentary-style photography
- Must meet serious journalism and scientific publication standards
- Professional news photography ethics and presentation standards`;

    return prompt;
  }

  // Enhanced GPT-Image-1 optimized prompt builder
  buildConcisePrompt(articleTitle, articleContent, category) {
    const coreInsight = this.extractCoreInsight(articleTitle, articleContent);
    const visualMetaphor = this.generateVisualMetaphor(coreInsight, category);
    const contextualElements = this.extractContextualElements(
      articleContent,
      category
    );

    // GPT-Image-1 optimized structure: Subject + Context + Style + Constraints
    const subject = this.buildDynamicSubject(
      coreInsight,
      visualMetaphor,
      contextualElements
    );
    const context = this.buildContextualSetting(coreInsight, category);
    const style = this.buildPhotographicStyle(
      category,
      contextualElements.mood
    );

    return (
      [
        `Professional editorial photograph: ${subject}`,
        `Setting: ${context}`,
        `Style: ${style}`,
        `Composition: Editorial header optimized, shallow depth of field, clean background`,
        `Constraints: Photorealistic only, no text/logos/brands, documentary quality`,
      ].join('. ') + '.'
    );
  }

  // Extract core insight from article content for semantic-driven image generation
  extractCoreInsight(articleTitle, articleContent) {
    // Remove frontmatter and get clean content
    const cleanContent = articleContent.replace(/^---[\s\S]*?---/, '');
    const fullText = `${articleTitle} ${cleanContent}`.toLowerCase();

    // Extract key semantic elements
    const insight = {
      topic: this.extractMainTopic(articleTitle, fullText),
      angle: this.extractUniqueAngle(fullText),
      impact: this.extractImpactScope(fullText),
      technology: this.extractTechnologyContext(fullText),
      humanElement: this.extractHumanContext(fullText),
      visualConcept: this.extractVisualConcept(fullText),
    };

    return insight;
  }

  // Extract the main topic from title and content
  extractMainTopic(title, fullText) {
    const titleLower = title.toLowerCase();

    // Specific topic patterns
    if (
      (titleLower.includes('tree') || titleLower.includes('fig')) &&
      (titleLower.includes('stone') ||
        titleLower.includes('calcium') ||
        titleLower.includes('mineral'))
    ) {
      return 'living trees forming mineral deposits and biological mineralization';
    }
    if (
      titleLower.includes('brain') &&
      (titleLower.includes('shutdown') || titleLower.includes('multitask'))
    ) {
      return 'cognitive disengagement and brain protective mechanisms';
    }
    if (titleLower.includes('ai') && titleLower.includes('avatar')) {
      return 'AI avatar technology and virtual influencers';
    }
    if (titleLower.includes('blood') && titleLower.includes('cancer')) {
      return 'AI-powered medical diagnostics';
    }
    if (titleLower.includes('creator') && titleLower.includes('burnout')) {
      return 'creator economy sustainability';
    }

    // Extract from main header concepts
    const headers = fullText.match(/^#{2,3}\s+(.+)$/gm) || [];
    if (headers.length > 0) {
      const mainHeader = headers[0]
        .replace(/^#{2,3}\s+/, '')
        .replace(/[*_`]/g, '');
      return mainHeader.substring(0, 60);
    }

    // Fallback to title
    return titleLower.substring(0, 60);
  }

  // Extract the unique angle or perspective
  extractUniqueAngle(fullText) {
    const angles = [];

    if (fullText.includes('protective') && fullText.includes('mechanism')) {
      angles.push('protective biological response');
    }
    if (
      fullText.includes('breakthrough') ||
      fullText.includes('revolutionary')
    ) {
      angles.push('groundbreaking discovery');
    }
    if (fullText.includes('hidden') || fullText.includes('reveals')) {
      angles.push('uncovering hidden patterns');
    }
    if (fullText.includes('future') || fullText.includes('next-gen')) {
      angles.push('future implications');
    }
    if (fullText.includes('crisis') || fullText.includes('problem')) {
      angles.push('addressing critical challenges');
    }

    return angles.length > 0 ? angles[0] : 'innovative perspective';
  }

  // Extract impact scope and scale
  extractImpactScope(fullText) {
    const impacts = [];

    if (fullText.includes('billion') || fullText.includes('million')) {
      impacts.push('massive scale impact');
    }
    if (fullText.includes('industry') || fullText.includes('market')) {
      impacts.push('industry transformation');
    }
    if (fullText.includes('society') || fullText.includes('culture')) {
      impacts.push('societal change');
    }
    if (fullText.includes('health') || fullText.includes('medical')) {
      impacts.push('healthcare advancement');
    }
    if (fullText.includes('productivity') || fullText.includes('efficiency')) {
      impacts.push('performance optimization');
    }

    return impacts.length > 0 ? impacts[0] : 'targeted innovation';
  }

  // Extract technology context
  extractTechnologyContext(fullText) {
    const techContext = [];

    if (
      fullText.includes('ai') ||
      fullText.includes('artificial intelligence')
    ) {
      techContext.push('AI-powered systems');
    }
    if (fullText.includes('neural') || fullText.includes('brain imaging')) {
      techContext.push('neurotechnology');
    }
    if (fullText.includes('digital') || fullText.includes('virtual')) {
      techContext.push('digital platforms');
    }
    if (fullText.includes('biomarker') || fullText.includes('molecular')) {
      techContext.push('biotechnology');
    }
    if (
      fullText.includes('algorithm') ||
      fullText.includes('machine learning')
    ) {
      techContext.push('algorithmic processing');
    }

    return techContext.length > 0 ? techContext[0] : 'emerging technology';
  }

  // Extract human context and stakeholders
  extractHumanContext(fullText) {
    const humanElements = [];

    if (fullText.includes('patient') || fullText.includes('medical')) {
      humanElements.push('patient care and medical outcomes');
    }
    if (fullText.includes('creator') || fullText.includes('influencer')) {
      humanElements.push('content creators and digital professionals');
    }
    if (fullText.includes('worker') || fullText.includes('employee')) {
      humanElements.push('workplace productivity and human performance');
    }
    if (fullText.includes('consumer') || fullText.includes('user')) {
      humanElements.push('consumer experience and user behavior');
    }
    if (fullText.includes('researcher') || fullText.includes('scientist')) {
      humanElements.push('scientific research and discovery');
    }

    return humanElements.length > 0
      ? humanElements[0]
      : 'human-technology interaction';
  }

  // Extract visual concept based on content semantics
  extractVisualConcept(fullText) {
    // Trees/botanical/mineralization concepts
    if (
      (fullText.includes('tree') || fullText.includes('fig')) &&
      (fullText.includes('stone') ||
        fullText.includes('calcium carbonate') ||
        fullText.includes('mineralization'))
    ) {
      return 'cross-section of living tree trunk showing calcium carbonate deposits within wood tissue';
    }

    // Cognitive/brain concepts
    if (
      fullText.includes('brain') &&
      (fullText.includes('shutdown') || fullText.includes('switching'))
    ) {
      return 'abstract neural network patterns showing state transitions';
    }

    // AI/virtual concepts
    if (
      fullText.includes('avatar') ||
      (fullText.includes('ai') && fullText.includes('virtual'))
    ) {
      return 'holographic digital interfaces with virtual personas';
    }

    // Medical/diagnostic concepts
    if (fullText.includes('blood') && fullText.includes('cancer')) {
      return 'precision medical analysis with microscopic detail';
    }

    // Creator/digital economy concepts
    if (fullText.includes('creator') && fullText.includes('economy')) {
      return 'modern digital workspace with content creation tools';
    }

    // Data/analysis concepts
    if (fullText.includes('analysis') || fullText.includes('data')) {
      return 'sophisticated data visualization and pattern recognition';
    }

    return 'conceptual technology demonstration';
  }

  // Extract semantic concepts using content analysis (not category templates)
  extractSemanticConcepts(title, content) {
    // Remove frontmatter and get clean content
    const cleanContent = content.replace(/^---[\s\S]*?---/, '');

    // Combine title and content for full semantic analysis
    const fullText = `${title} ${cleanContent}`.toLowerCase();

    // Extract core concepts through semantic pattern matching
    const concepts = {
      primaryConcepts: [],
      mechanisms: [],
      subjects: [],
      outcomes: [],
      visualElements: [],
    };

    // Cognitive/psychological concepts
    if (
      fullText.includes('brain') &&
      (fullText.includes('shutdown') || fullText.includes('disengagement'))
    ) {
      concepts.primaryConcepts.push('cognitive protective mechanisms');
      concepts.mechanisms.push('neural network switching');
      concepts.visualElements.push('abstract brain state transitions');
    }

    // AI/technology concepts
    if (
      fullText.includes('ai') &&
      (fullText.includes('detect') || fullText.includes('analysis'))
    ) {
      concepts.primaryConcepts.push('artificial intelligence analysis');
      concepts.mechanisms.push('pattern recognition');
      concepts.visualElements.push('data processing visualization');
    }

    // Medical/health concepts
    if (fullText.includes('blood') && fullText.includes('cancer')) {
      concepts.primaryConcepts.push('medical diagnosis');
      concepts.mechanisms.push('biomarker detection');
      concepts.visualElements.push('microscopic analysis');
    }

    // Virtual/digital concepts
    if (fullText.includes('avatar') || fullText.includes('virtual')) {
      concepts.primaryConcepts.push('digital identity');
      concepts.mechanisms.push('virtual representation');
      concepts.visualElements.push('holographic interfaces');
    }

    // Multitasking/cognitive load concepts
    if (
      fullText.includes('multitask') ||
      fullText.includes('cognitive overload')
    ) {
      concepts.primaryConcepts.push('cognitive overload');
      concepts.mechanisms.push('information processing stress');
      concepts.visualElements.push('complex to simplified state transitions');
    }

    // Fallback to title analysis if no specific patterns found
    if (concepts.primaryConcepts.length === 0) {
      concepts.primaryConcepts.push('emerging technology trend');
      concepts.mechanisms.push('innovation process');
      concepts.visualElements.push('conceptual demonstration');
    }

    return concepts;
  }

  // Generate visual metaphor based on core insight
  generateVisualMetaphor(coreInsight, category) {
    const { topic, angle, impact, technology } = coreInsight;

    if (
      topic.includes('trees forming mineral') ||
      topic.includes('biological mineralization') ||
      topic.includes('calcium carbonate')
    ) {
      return {
        primary:
          'close-up cross-section of a living Kenyan fig tree trunk showing white calcium carbonate stone deposits embedded within dark wood grain',
        secondary:
          'green leaves and natural environment visible to show the tree is alive and thriving',
        symbolism: 'impossible biological phenomenon defying natural laws',
      };
    }

    if (
      topic.includes('AI avatar') ||
      technology.includes('digital personas')
    ) {
      return {
        primary:
          'holographic AI interface displaying virtual influencer profiles',
        secondary: 'floating digital persona elements',
        symbolism: 'future of human-AI content collaboration',
      };
    }

    if (topic.includes('creator') && impact.includes('burnout')) {
      return {
        primary: 'content creator workspace with AI assistance visualization',
        secondary: 'balanced human-AI workflow elements',
        symbolism: 'sustainable creator economy',
      };
    }

    // Psychology-specific cognitive topics
    if (
      (topic.includes('brain') && topic.includes('shutdown')) ||
      topic.includes('cognitive disengagement') ||
      topic.includes('multitasking') ||
      topic.includes('cognitive overload')
    ) {
      return {
        primary:
          'abstract neural network visualization showing cognitive switching patterns',
        secondary:
          'flowing information pathways transitioning from complex to simplified states',
        symbolism: 'brain adaptation and protective mechanisms',
      };
    }

    // Category-based fallbacks
    const categoryMetaphors = {
      culture: {
        primary: 'digital culture visualization with modern social elements',
        secondary: 'contemporary lifestyle and technology integration',
        symbolism: 'evolving digital society',
      },
      technology: {
        primary: 'cutting-edge technology demonstration',
        secondary: 'innovation and progress visualization',
        symbolism: 'technological advancement',
      },
      science: {
        primary: 'scientific discovery or research visualization',
        secondary: 'data and research elements',
        symbolism: 'knowledge and discovery',
      },
      psychology: {
        primary:
          'abstract cognitive visualization with conceptual brain activity patterns',
        secondary:
          'mental process metaphors and neural network representations',
        symbolism: 'mind and behavior understanding',
      },
      health: {
        primary: 'medical breakthrough visualization in clinical setting',
        secondary: 'diagnostic technology and patient care elements',
        symbolism: 'health innovation and healing',
      },
    };

    return categoryMetaphors[category] || categoryMetaphors.technology;
  }

  // Extract contextual elements for better relevance
  extractContextualElements(content, category) {
    const mood = this.determineMood(content);
    const timeContext = this.extractTimeContext(content);
    const stakeholders = this.extractStakeholders(content);
    const statistics = this.extractKeyStatistics(content);

    return {
      mood,
      timeContext,
      stakeholders,
      statistics: statistics.slice(0, 2),
      urgency:
        content.toLowerCase().includes('breaking') ||
        content.toLowerCase().includes('urgent')
          ? 'high'
          : 'medium',
    };
  }

  // Extract temporal context
  extractTimeContext(content) {
    const contentLower = content.toLowerCase();

    if (
      contentLower.includes('2025') ||
      contentLower.includes('future') ||
      contentLower.includes('emerging')
    ) {
      return 'cutting-edge contemporary';
    }
    if (
      contentLower.includes('traditional') ||
      contentLower.includes('historical')
    ) {
      return 'traditional vs modern contrast';
    }
    return 'present-day professional';
  }

  // Extract stakeholders/personas
  extractStakeholders(content) {
    const contentLower = content.toLowerCase();
    const stakeholders = [];

    if (
      contentLower.includes('creator') ||
      contentLower.includes('influencer')
    ) {
      stakeholders.push('content creators');
    }
    if (
      contentLower.includes('consumer') ||
      contentLower.includes('user') ||
      contentLower.includes('audience')
    ) {
      stakeholders.push('consumers');
    }
    if (contentLower.includes('brand') || contentLower.includes('marketer')) {
      stakeholders.push('brands');
    }
    if (
      contentLower.includes('researcher') ||
      contentLower.includes('scientist')
    ) {
      stakeholders.push('researchers');
    }

    return stakeholders.slice(0, 2);
  }

  // Build dynamic subject based on insights
  buildDynamicSubject(coreInsight, visualMetaphor, contextualElements) {
    const { primary, secondary } = visualMetaphor;
    const { mood, statistics } = contextualElements;

    // Start with core visual concept
    let subject = primary;

    // Add mood-specific modifiers
    const moodModifiers = {
      futuristic: 'sleek, high-tech',
      optimistic: 'bright, innovative',
      analytical: 'precise, data-focused',
      urgent: 'dynamic, attention-grabbing',
      professional: 'polished, corporate',
    };

    const modifier = moodModifiers[mood] || 'professional';

    // Add secondary elements with statistical context
    if (statistics.length > 0) {
      subject = `${modifier} ${subject} with subtle ${secondary} suggesting data-driven insights`;
    } else {
      subject = `${modifier} ${subject} with ${secondary}`;
    }

    return subject;
  }

  // Build contextual setting
  buildContextualSetting(coreInsight, category) {
    const { impact, technology } = coreInsight;

    const categorySettings = {
      culture: 'modern creator studio with ambient lighting',
      technology: 'clean tech environment with professional setup',
      science: 'research laboratory with controlled lighting',
      psychology: 'clinical study environment with soft lighting',
      health: 'medical facility with sterile professional presentation',
      space: 'space mission control or cosmic environment',
    };

    let baseSetting = categorySettings[category] || categorySettings.technology;

    // Add impact-specific environmental elements
    if (impact.includes('crisis') || impact.includes('problem')) {
      baseSetting += ', subtle tension or challenge visualization';
    } else if (impact.includes('solution') || impact.includes('innovation')) {
      baseSetting += ', optimistic and solution-oriented atmosphere';
    }

    return baseSetting;
  }

  // Build photographic style optimized for GPT-Image-1
  buildPhotographicStyle(category, mood) {
    const baseStyles = {
      culture: 'documentary photojournalism with natural lighting',
      technology: 'commercial product photography with studio lighting',
      science: 'scientific documentation with archival quality',
      psychology: 'professional research photography with soft focus',
      health: 'medical photography with clinical precision',
      space: 'NASA-quality space photography',
    };

    const moodStyles = {
      futuristic: 'with futuristic blue-purple color palette',
      optimistic: 'with warm, uplifting color temperature',
      analytical: 'with neutral scientific color grading',
      urgent: 'with dynamic contrast and sharp focus',
      professional: 'with executive corporate aesthetic',
    };

    const baseStyle = baseStyles[category] || baseStyles.technology;
    const moodStyle = moodStyles[mood] || moodStyles.professional;

    return `${baseStyle} ${moodStyle}, National Geographic editorial quality`;
  }

  async generateFromArticle(articleFilePath, options = {}) {
    try {
      console.log(
        `🎨 Generating single high-quality image from article: ${path.basename(articleFilePath)}`
      );

      // Read and parse article
      const content = await fs.readFile(articleFilePath, 'utf-8');

      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!frontmatterMatch) {
        throw new Error('No frontmatter found in article');
      }

      const frontmatter = frontmatterMatch[1];
      const title =
        frontmatter.match(/title:\s*['"](.*?)['"]/)?.[1] || 'Untitled';
      const category =
        frontmatter.match(/category:\s*(\w+)/)?.[1] || 'technology';

      const { promptMode = 'concise', plan: planOverride } = options;
      let prompt;
      // Try to read structured frontmatter for optional image plan overrides
      let fmData = {};
      try {
        fmData = require('gray-matter')(content).data || {};
      } catch (_) {}
      const fmPlan =
        (fmData && (fmData.imagePlan || fmData.imageHints)) || null;
      if (
        fmPlan &&
        fmPlan.subject &&
        fmPlan.environment &&
        fmPlan.action &&
        fmPlan.mood &&
        fmPlan.palette
      ) {
        prompt =
          `Photorealistic editorial image capturing ${fmPlan.subject}. ` +
          `Environment: ${fmPlan.environment}. Action: ${fmPlan.action}. ` +
          `Mood: ${fmPlan.mood}. Palette: ${fmPlan.palette}. ` +
          `Composition: clear focal subject, shallow depth of field, uncluttered background. ` +
          `Constraints: no text, no logos, no watermarks; avoid brand-identifiable UI; no illustrations or CGI; photorealistic only.`;
      } else if (planOverride && planOverride.subject) {
        const p = planOverride;
        prompt =
          `Photorealistic editorial image capturing ${p.subject}. ` +
          `Environment: ${p.environment}. Action: ${p.action}. ` +
          `Mood: ${p.mood}. Palette: ${p.palette}. ` +
          `Composition: clear focal subject, shallow depth of field, uncluttered background. ` +
          `Constraints: no text, no logos, no watermarks; avoid brand-identifiable UI; no illustrations or CGI; photorealistic only.`;
      } else {
        // Choose prompt style (default: concise)
        prompt =
          promptMode === 'detailed'
            ? await this.generateDynamicPrompt(title, content, category)
            : this.buildConcisePrompt(title, content, category);
      }

      console.log(`   Dynamic prompt generated (${prompt.length} chars)`);

      // Ensure only one image generation per call
      const forceOptions = {
        ...this.defaultOptions,
        ...options,
        n: 1, // Force single image generation
      };

      // Generate single high-quality image
      const result = await this.generateWithOpenAI(prompt, forceOptions);

      // Create unique filename with timestamp
      const timestamp = Date.now();
      const filename = `ai-generated-${timestamp}.png`;
      const localPath = path.join(this.outputDir, filename);

      // Save base64 image (gpt-image-1 ONLY returns base64, never URLs)
      console.log(`🔍 Result structure:`, {
        hasB64: !!result.b64_json,
        hasUrl: !!result.url,
      });
      if (result.b64_json) {
        console.log(
          `📥 Saving gpt-image-1 base64 data to: ${path.join(this.outputDir, filename)}`
        );
        try {
          const buffer = Buffer.from(result.b64_json, 'base64');
          await fs.writeFile(path.join(this.outputDir, filename), buffer);
          console.log(`✅ gpt-image-1 image saved successfully`);
        } catch (error) {
          console.error(`❌ Base64 save failed: ${error.message}`);
          throw error;
        }
      } else {
        console.error(
          `❌ No base64 data returned from gpt-image-1 (URLs not supported)`
        );
        throw new Error(
          'gpt-image-1 must return base64 data but none was found'
        );
      }

      const imageResult = {
        url: result.url,
        localPath: `/images/ai-generated/${filename}`,
        filename,
        prompt: prompt.substring(0, 200) + '...',
        provider: 'openai',
        model: 'gpt-image-1',
        cost: 0.19, // High quality cost (~$0.19 per image in 2025)
        extractedTopics: this.extractMainTopics(content),
        extractedStats: this.extractKeyStatistics(content),
        extractedTech: this.extractTechnologies(content, category),
      };

      this.generatedImages.push(imageResult);

      console.log(`✅ Image generated successfully: ${filename}`);
      console.log(`   Local path: ${imageResult.localPath}`);

      return imageResult;
    } catch (error) {
      console.error(`❌ Error generating image from article: ${error.message}`);
      this.errors.push({ file: articleFilePath, error: error.message });
      throw error;
    }
  }

  getCacheKey(prompt, options = {}) {
    const hash = crypto.createHash('md5');
    hash.update(prompt);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ statusCode: res.statusCode, data: parsed });
            } else {
              reject(
                new Error(
                  `HTTP ${res.statusCode}: ${parsed.error?.message || 'Unknown error'}`
                )
              );
            }
          } catch (e) {
            reject(new Error(`Parse error: ${data.substring(0, 200)}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(120000, () => {
        // 120 second timeout for image generation
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async generateWithOpenAI(prompt, options = {}) {
    if (!this.openaiKey || this.openaiKey === 'sk-your-api-key-here') {
      throw new Error('OpenAI API key not configured');
    }

    // Use optimized defaults
    const {
      size = this.defaultOptions.size,
      quality = this.defaultOptions.quality,
      n = 1,
    } = options;

    console.log(`🎨 Generating image with OpenAI gpt-image-1...`);
    console.log(`   Size: ${size}, Quality: ${quality}`);
    console.log(`   Prompt: "${prompt.substring(0, 50)}..."`);

    await this.enforceRateLimit();

    // Use official OpenAI SDK per docs: images.generate
    if (!this._openai) {
      this._openai = new OpenAI({ apiKey: this.openaiKey });
    }

    const resp = await this._openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size,
      quality,
      // n is limited to 1 for gpt-image-1
    });

    const item = resp.data?.[0] || {};
    const b64 = item.b64_json;
    const revisedPrompt = item.revised_prompt;

    if (!b64) {
      throw new Error('No base64 image returned from OpenAI gpt-image-1');
    }

    return {
      url: undefined,
      b64_json: b64,
      provider: 'openai',
      model: 'gpt-image-1',
      originalPrompt: prompt,
      revisedPrompt,
      size,
      quality,
    };
  }

  async generateWithGoogle(prompt, options = {}) {
    // Note: Google Imagen requires Google Cloud Project setup
    // This is a placeholder for future implementation
    console.log(`🎨 Google AI image generation requires Cloud Project setup`);
    console.log(`   Falling back to curated alternatives...`);

    // For now, return a fallback suggestion
    throw new Error(
      'Google AI image generation requires Google Cloud Project configuration'
    );
  }

  async downloadImage(imageUrl, filename) {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.outputDir, filename);
      const file = require('fs').createWriteStream(filePath);

      https
        .get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve(filePath);
          });

          file.on('error', reject);
        })
        .on('error', reject);
    });
  }

  async generateImage(prompt, options = {}) {
    const {
      filename,
      provider = 'auto', // auto, openai, google
      downloadImage = true,
      ...providerOptions
    } = options;

    await this.ensureDirs();

    // Check cache first
    const cacheKey = this.getCacheKey(prompt, providerOptions);
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);

    try {
      const cached = await fs.readFile(cachePath, 'utf-8');
      const cachedData = JSON.parse(cached);
      console.log(
        `📦 Using cached AI image for: "${prompt.substring(0, 50)}..."`
      );
      return cachedData;
    } catch {
      // No cache found, proceed with generation
    }

    let result;
    const providersToTry = provider === 'auto' ? ['openai'] : [provider];

    for (const currentProvider of providersToTry) {
      try {
        switch (currentProvider) {
          case 'openai':
            result = await this.generateWithOpenAI(prompt, providerOptions);
            break;
          case 'google':
            result = await this.generateWithGoogle(prompt, providerOptions);
            break;
          default:
            throw new Error(`Unknown provider: ${currentProvider}`);
        }

        // If successful, break out of loop
        break;
      } catch (error) {
        console.error(`❌ ${currentProvider} failed: ${error.message}`);
        this.errors.push({
          provider: currentProvider,
          error: error.message,
          prompt,
        });

        // If this was the last provider to try, throw error
        if (currentProvider === providersToTry[providersToTry.length - 1]) {
          throw new Error(`All providers failed. Last error: ${error.message}`);
        }
      }
    }

    // Save base64 image (gpt-image-1 ONLY returns base64, never URLs)
    if (downloadImage && result.b64_json && !result.localPath) {
      const imageFilename = filename || `ai-generated-${Date.now()}.png`;
      try {
        await this.ensureDirs();
        const filePath = path.join(this.outputDir, imageFilename);
        const buffer = Buffer.from(result.b64_json, 'base64');
        await require('fs').promises.writeFile(filePath, buffer);
        result.localPath = filePath;
        result.filename = imageFilename;
        console.log(`💾 Saved gpt-image-1 base64 image: ${imageFilename}`);
      } catch (error) {
        console.error(`Failed to save base64 image: ${error.message}`);
      }
    }

    // Cache result
    await fs
      .writeFile(cachePath, JSON.stringify(result, null, 2))
      .catch(console.error);

    this.generatedImages.push(result);
    return result;
  }

  async generateBlogImages(topics, options = {}) {
    console.log(
      `🎨 Generating professional photorealistic images for ${topics.length} blog topics...`
    );

    const results = [];
    for (const topic of topics) {
      try {
        // Enhanced professional photorealistic prompt for GPT-Image-1
        const prompt = `Professional editorial photography for blog article: "${topic}".

CAMERA & TECHNICAL SPECIFICATIONS:
- Shot with Canon EOS R5, 85mm f/1.4 lens, commercial photography setup
- Professional studio lighting with soft key light, subtle rim lighting, controlled shadows
- Rule of thirds composition, shallow depth of field with natural bokeh
- Professional depth of field control, tack sharp focus on subject
- Shot in RAW format with professional color grading

VISUAL STYLE & AESTHETIC:
- Clean tech photography, minimalist design, modern professional corporate aesthetic
- Photorealistic documentary-grade professional photography
- National Geographic / Scientific American publication quality
- Commercial photography standards with editorial presentation
- 1536x1024 aspect ratio optimized for digital publication headers

LIGHTING & ATMOSPHERE:
- Professional studio-grade lighting setup
- Controlled shadows and highlights for maximum detail
- Color temperature balanced for publication standards
- Corporate executive lighting setup, sophisticated business atmosphere

COMPOSITION & FRAMING:
- Executive composition, sophisticated professional angle, high-end business photography
- Professional editorial composition standards
- Visual hierarchy optimized for article header presentation
- Background elements supporting but not competing with subject

EDITORIAL RESTRICTIONS (CRITICAL):
- ABSOLUTELY NO text, numbers, words, letters, or any readable characters
- NO logos, watermarks, brand names, or corporate identifiers
- NO cartoon, illustration, CGI, or artistic interpretation styles
- NO amateur photography aesthetics or social media filters
- ONLY photorealistic, professional documentary-style photography
- Must meet serious journalism and scientific publication standards
- Professional news photography ethics and presentation standards`;

        const filename = `blog-${topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;

        const result = await this.generateImage(prompt, {
          filename,
          size: '1536x1024', // Blog hero ratio
          quality: 'high',
          ...options,
        });

        results.push({
          topic,
          ...result,
        });

        console.log(
          `✅ Generated professional photorealistic image for: ${topic}`
        );

        // Small delay between generations
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `❌ Failed to generate image for "${topic}": ${error.message}`
        );
        results.push({
          topic,
          error: error.message,
        });
      }
    }

    return results;
  }

  async getUsageStats() {
    return {
      imagesGenerated: this.generatedImages.length,
      errors: this.errors.length,
      providers: [...new Set(this.generatedImages.map((img) => img.provider))],
      totalCost: this.estimateCost(),
    };
  }

  estimateCost() {
    // OpenAI gpt-image-1/DALL-E-like pricing estimate
    let cost = 0;
    for (const img of this.generatedImages) {
      if (img.provider === 'openai') {
        // Typical pricing buckets
        const qualityCosts = { low: 0.02, medium: 0.07, high: 0.19 };
        cost += qualityCosts[img.quality] || qualityCosts.high;
      }
    }
    return `$${cost.toFixed(3)}`;
  }
}

// CLI interface
if (require.main === module) {
  const generator = new AIImageGenerator();

  const args = process.argv.slice(2);
  const command = args[0];

  async function run() {
    await generator.ensureDirs();

    switch (command) {
      case 'generate':
        // Support flags like --size=1024x1024 --quality=high
        const argTail = args.slice(1);
        const sizeFlagG = argTail.find((a) => a.startsWith('--size='));
        const qualityFlagG = argTail.find((a) => a.startsWith('--quality='));
        const prompt = argTail.filter((a) => !a.startsWith('--')).join(' ');
        if (!prompt) {
          console.log(
            'Usage: node ai-image-generator.js generate "your image prompt"'
          );
          return;
        }

        const gen = await generator.generateImage(prompt, {
          ...generator.defaultOptions,
          ...(sizeFlagG ? { size: sizeFlagG.split('=')[1] } : {}),
          ...(qualityFlagG ? { quality: qualityFlagG.split('=')[1] } : {}),
        });

        console.log('\n🎨 Generation Result:');
        console.log(`   Saved: ${gen.filename || 'inline base64'}`);
        console.log(`   Local: ${gen.localPath || 'N/A'}`);
        console.log(`   Model: gpt-image-1`);
        console.log(`   Quality: ${generator.defaultOptions.quality}`);
        console.log(`   Size: ${generator.defaultOptions.size}`);
        break;

      case 'generate-from-article':
        const fileFlag = args.find((arg) => arg.startsWith('--file='));
        const promptFlag = args.find((arg) => arg.startsWith('--prompt='));
        const sizeFlag = args.find((arg) => arg.startsWith('--size='));
        const qualityFlag = args.find((arg) => arg.startsWith('--quality='));
        if (!fileFlag) {
          console.log(
            'Usage: node ai-image-generator.js generate-from-article --file="path/to/article.mdx" [--prompt=concise|detailed] [--size=1024x1024|1024x1536|1536x1024] [--quality=low|medium|high|auto]'
          );
          return;
        }

        const filePath = fileFlag.split('=')[1].replace(/['"]/g, '');
        const fullPath = path.resolve(filePath);

        try {
          const promptMode = promptFlag
            ? promptFlag.split('=')[1].replace(/['"]/g, '')
            : 'concise';
          const result = await generator.generateFromArticle(fullPath, {
            promptMode,
            ...(sizeFlag ? { size: sizeFlag.split('=')[1] } : {}),
            ...(qualityFlag ? { quality: qualityFlag.split('=')[1] } : {}),
          });

          console.log('\n✅ Dynamic Image Generation Complete:');
          console.log(`   Filename: ${result.filename}`);
          console.log(`   Local path: ${result.localPath}`);
          console.log(`   Cost: $${result.cost}`);
          console.log(
            `   Topics: ${result.extractedTopics.slice(0, 3).join(', ')}`
          );
          console.log(
            `   Technologies: ${result.extractedTech.slice(0, 3).join(', ')}`
          );
          console.log(
            `   Statistics: ${result.extractedStats.slice(0, 2).join(', ')}`
          );
        } catch (error) {
          console.error(`❌ Failed to generate image: ${error.message}`);
        }
        break;

      case 'stats':
        const stats = await generator.getUsageStats();
        console.log('\n📊 Usage Statistics:', stats);
        break;

      default:
        console.log(`
🎨 Professional Photorealistic AI Image Generator - gpt-image-1 ENHANCED
National Geographic / Scientific American quality images for serious journalism

Usage: node ai-image-generator.js <command> [options]

Commands:
  generate "prompt"                           - Generate single photorealistic image
  generate-from-article --file="path.mdx"    - Generate contextual professional image
  stats                                       - Show usage statistics

Examples:
  node ai-image-generator.js generate "archaeological excavation cuneiform tablets"
  node ai-image-generator.js generate-from-article --file="content/science/anunnaki-article.mdx"

ENHANCED Professional Photography Standards:
  - Quality: Photorealistic, documentary-grade professional photography
  - Style: National Geographic / Scientific American / Nature publication quality
  - Camera: Canon EOS R5, medium format, specialized lenses (85mm f/1.4, macro, astronomical)
  - Lighting: Professional studio, museum archival, scientific documentation lighting
  - Composition: Editorial standards, rule of thirds, maximum detail preservation
  - Categories: Science/Archaeological, Technology, Space, Health, Psychology, Culture
  - Size: 1536x1024 (editorial header optimized)
  - Cost: ~$0.19 per high-quality image
  - Model: gpt-image-1 (latest OpenAI with enhanced prompting)

Category-Specific Expertise:
  - Science/Archaeological: Museum quality, ancient artifacts, excavation documentation
  - Technology: Clean product photography, minimalist corporate aesthetic
  - Space: NASA photography style, astronomical imaging, cosmic phenomena
  - Health: Medical photography, clinical documentation standards
  - Psychology: Professional study photography, human-centered documentation
  - Culture: Documentary photojournalism, cultural anthropology documentation

Editorial Guidelines (CRITICAL):
  - ABSOLUTELY NO cartoonish, artistic, CGI, or illustrated styles
  - NO text, numbers, logos, watermarks, or readable characters
  - NO amateur photography or social media filter aesthetics
  - ONLY photorealistic, professional documentary-style photography
  - Must meet serious journalism and scientific publication standards
  - Professional news photography ethics and presentation standards
        `);
    }
  }

  run().catch(console.error);
}

module.exports = { AIImageGenerator };
