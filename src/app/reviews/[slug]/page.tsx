import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ReviewSchema, BreadcrumbSchema, FAQSchema } from '@/components/seo/SchemaMarkup';
import SEOHead, { ReviewSEO } from '@/components/seo/SEOHead';
import RelatedContent, { Breadcrumbs, TopicClusterNav } from '@/components/seo/RelatedContent';
import { OptimizedImage } from '@/components/seo/WebVitals';
import { generateMetaTitle, generateMetaDescription, generateBreadcrumbs } from '@/lib/seo-utils';
import { analyzeContentSEO } from '@/lib/content-seo';
import { generateOptimizedAltText, analyzeImageSEO } from '@/lib/image-optimization';

// Mock data - in production, this would come from your CMS/database
const reviewsData = {
  'iphone-15-pro-review': {
    title: "iPhone 15 Pro Review: Apple's Most Advanced Phone Yet",
    description: "After two weeks of extensive testing, we dive deep into Apple's flagship to see if the titanium design, A17 Pro chip, and 5x zoom camera justify the premium price tag.",
    publishedAt: "2025-01-15T10:00:00Z",
    lastUpdated: "2025-01-16T14:30:00Z",
    author: {
      name: "Trends Today Editorial",
      bio: "Expert tech reviewers with years of hands-on experience testing the latest devices and software.",
      avatar: "/images/authors/editorial-team.jpg"
    },
    category: "smartphones",
    tags: ["iphone", "apple", "smartphone", "flagship", "review", "a17 pro", "titanium"],
    product: {
      name: "iPhone 15 Pro",
      brand: "Apple",
      model: "iPhone 15 Pro",
      category: "smartphones",
      price: "$999-$1199",
      currency: "USD",
      availability: "InStock",
      image: "/images/reviews/iphone-15-pro/hero.jpg",
      description: "Apple's flagship smartphone with titanium design and A17 Pro chip"
    },
    review: {
      rating: 8.5,
      maxRating: 10,
      reviewBody: "The iPhone 15 Pro represents a significant step forward for Apple's flagship lineup. The new titanium design feels premium and reduces weight, while the A17 Pro chip delivers exceptional performance for both everyday tasks and demanding applications.",
      pros: [
        "Premium titanium build quality",
        "Exceptional A17 Pro performance",
        "Improved camera system with 5x zoom",
        "USB-C connectivity finally arrives",
        "Outstanding display quality"
      ],
      cons: [
        "Premium price point",
        "Battery life could be better",
        "Limited storage in base model",
        "No significant design changes"
      ]
    },
    images: [
      {
        src: "/images/reviews/iphone-15-pro/hero.jpg",
        alt: "iPhone 15 Pro in Natural Titanium showing front and back design",
        caption: "iPhone 15 Pro in Natural Titanium finish",
        isHero: true
      },
      {
        src: "/images/reviews/iphone-15-pro/camera.jpg", 
        alt: "iPhone 15 Pro camera system with 5x telephoto lens",
        caption: "The improved camera system features a 5x telephoto lens"
      },
      {
        src: "/images/reviews/iphone-15-pro/performance.jpg",
        alt: "iPhone 15 Pro A17 Pro chip performance benchmark results",
        caption: "A17 Pro chip delivers industry-leading mobile performance"
      }
    ],
    faq: [
      {
        question: "Is the iPhone 15 Pro worth upgrading from iPhone 14 Pro?",
        answer: "The iPhone 15 Pro offers meaningful upgrades including the new titanium design, A17 Pro chip, improved cameras, and USB-C. However, if you're happy with your iPhone 14 Pro's performance, you might want to wait another generation."
      },
      {
        question: "How is the battery life on the iPhone 15 Pro?",
        answer: "Battery life is solid but not exceptional. You'll easily get through a full day of moderate to heavy use, with about 18-20 hours of typical usage. The new A17 Pro chip is more efficient, but the improvements are incremental."
      },
      {
        question: "Is the iPhone 15 Pro camera better than Samsung Galaxy S24?",
        answer: "Both cameras excel in different areas. The iPhone 15 Pro offers more natural colors and better video recording, while the Galaxy S24 provides more versatile zoom capabilities and better night mode performance."
      }
    ],
    content: `
# iPhone 15 Pro Review: Apple's Most Advanced Phone Yet

After two weeks of extensive testing, we dive deep into Apple's flagship to see if the titanium design, A17 Pro chip, and 5x zoom camera justify the premium price tag.

**Quick Verdict:** The iPhone 15 Pro is a solid upgrade with meaningful improvements, but the premium price may give budget-conscious buyers pause.

## Technical Specifications

| Feature | iPhone 15 Pro |
|---------|---------------|
| Display | 6.1-inch Super Retina XDR OLED |
| Processor | A17 Pro (3nm) |
| Memory | 8GB RAM |
| Storage | 128GB, 256GB, 512GB, 1TB |
| Camera | 48MP main, 12MP ultra-wide, 12MP telephoto (5x) |
| Battery | Up to 23 hours video playback |
| Price | Starting at $999 |

## Design and Build Quality

The most immediately noticeable change is the new titanium construction. Apple has replaced the stainless steel frame with Grade 5 titanium, resulting in a phone that's noticeably lighter while maintaining the premium feel we expect from a flagship device.

### Key Design Changes:
- **Titanium Frame**: 19% lighter than iPhone 14 Pro
- **Action Button**: Replaces the mute switch with customizable functionality  
- **USB-C**: Finally ditches Lightning for universal connectivity
- **Refined Colors**: Natural, Blue, White, and Black Titanium options

The build quality is exceptional. The titanium frame feels robust, and the matte finish resists fingerprints better than the previous glossy stainless steel.

## Performance Analysis

The A17 Pro chip represents Apple's first 3nm processor, delivering impressive performance gains across the board.

### Benchmark Results:
- **Geekbench 6**: 2,914 single-core, 7,199 multi-core
- **3DMark Wild Life**: 86.2 fps average
- **Thermal Performance**: Excellent heat management under sustained loads

Real-world performance is outstanding. Apps launch instantly, multitasking is seamless, and even demanding games run without a hint of lag. The GPU performance is particularly impressive for mobile gaming.

## Camera System Deep Dive

Apple has significantly upgraded the camera system, with the telephoto lens now offering 5x optical zoom (120mm equivalent).

### Camera Specifications:
- **Main**: 48MP, f/1.78, OIS
- **Ultra-wide**: 12MP, f/2.2, 120° field of view  
- **Telephoto**: 12MP, f/2.8, 5x optical zoom, OIS
- **Front**: 12MP, f/1.9, autofocus

### Photo Quality:
The iPhone 15 Pro consistently delivers excellent image quality across all scenarios. Colors are natural and well-balanced, dynamic range is impressive, and the new 5x telephoto lens opens up creative possibilities for portrait and distant subject photography.

**Portrait Mode** has been refined with better edge detection and more natural background blur. The new telephoto focal length (120mm) is perfect for headshots with flattering compression.

**Night Mode** continues to impress, though it's more of an iterative improvement rather than a revolutionary leap forward.

## Battery Life and Charging

Battery performance is solid, delivering a full day of use for most users:

- **Video Playback**: Up to 23 hours
- **Audio Playback**: Up to 75 hours  
- **Typical Usage**: 18-20 hours with mixed use
- **Charging**: 50% in 30 minutes with 20W+ adapter

The switch to USB-C enables faster data transfer and broader accessory compatibility, though you'll need new cables if coming from an older iPhone.

## Software and Features

iOS 17 runs beautifully on the A17 Pro, with smooth animations and responsive interactions throughout the system.

### Key Software Features:
- **Interactive Widgets**: More dynamic and useful
- **StandBy Mode**: Turns your iPhone into a smart display when charging
- **Improved Siri**: More natural conversations and better context awareness
- **Enhanced Privacy**: App tracking transparency and location sharing controls

## Comparison with Competitors

### vs Samsung Galaxy S24:
- **Display**: Both excellent, slight edge to Samsung for brightness
- **Performance**: iPhone leads in sustained performance  
- **Camera**: Different strengths - iPhone for video, Samsung for zoom versatility
- **Price**: Similar pricing in flagship tier

### vs Google Pixel 8 Pro:
- **AI Features**: Pixel leads with computational photography and AI assistance
- **Build Quality**: iPhone's titanium construction feels more premium
- **Software Updates**: Both offer long-term support commitments
- **Value**: Pixel offers more features for the price

## Value Proposition

At $999 starting price, the iPhone 15 Pro sits firmly in premium territory. The question is whether the improvements justify the cost:

### Worth Buying If:
- You value premium build quality and materials
- Camera quality (especially video) is a priority  
- You're invested in the Apple ecosystem
- You plan to keep your phone for 4+ years

### Consider Alternatives If:
- Budget is a primary concern
- You want cutting-edge AI features (Pixel)
- You prefer Android's customization options
- You prioritize zoom photography over other features

## Pros and Cons

### What We Love:
✅ **Premium titanium construction** - Lighter weight, excellent build quality  
✅ **Outstanding performance** - A17 Pro delivers in every scenario  
✅ **Improved camera system** - 5x telephoto adds versatility  
✅ **USB-C connectivity** - Finally joins the universal standard  
✅ **Excellent display** - Bright, accurate, and responsive

### Room for Improvement:
❌ **Premium pricing** - $999 starting price is steep  
❌ **Incremental battery gains** - Could use more significant improvements  
❌ **Storage limitations** - 128GB base storage feels restrictive  
❌ **Modest design evolution** - Familiar overall appearance

## Final Verdict

**Rating: 8.5/10**

The iPhone 15 Pro is an excellent flagship smartphone that delivers meaningful improvements over its predecessor. The titanium construction, A17 Pro performance, and enhanced camera system make this a compelling upgrade for users coming from older devices.

However, the premium pricing means it's not for everyone. If you're happy with your current iPhone's performance and aren't drawn to the specific new features, waiting another generation might be wise.

**Best For**: Users who prioritize build quality, camera performance, and long-term software support, and are willing to pay premium prices for these benefits.

**Skip If**: You're budget-conscious, want cutting-edge AI features, or your current phone meets all your needs adequately.

---

*This review is based on two weeks of real-world testing. We purchased our review unit independently to ensure editorial integrity. Some links may be affiliate links, but this doesn't affect our editorial opinions.*

## Frequently Asked Questions

### Is the iPhone 15 Pro worth upgrading from iPhone 14 Pro?
The iPhone 15 Pro offers meaningful upgrades including the new titanium design, A17 Pro chip, improved cameras, and USB-C. However, if you're happy with your iPhone 14 Pro's performance, you might want to wait another generation.

### How is the battery life on the iPhone 15 Pro?
Battery life is solid but not exceptional. You'll easily get through a full day of moderate to heavy use, with about 18-20 hours of typical usage. The new A17 Pro chip is more efficient, but the improvements are incremental.

### Is the iPhone 15 Pro camera better than Samsung Galaxy S24?
Both cameras excel in different areas. The iPhone 15 Pro offers more natural colors and better video recording, while the Galaxy S24 provides more versatile zoom capabilities and better night mode performance.

## Related Reviews and Comparisons

Looking for more smartphone reviews? Check out our comprehensive coverage of the latest flagships and mid-range options.
`
  }
};

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const review = reviewsData[params.slug as keyof typeof reviewsData];
  
  if (!review) {
    return {
      title: 'Review Not Found | Trends Today',
      description: 'The requested review could not be found.'
    };
  }

  const optimizedTitle = generateMetaTitle(
    review.title,
    'Review',
    review.product.brand
  );
  
  const optimizedDescription = generateMetaDescription(
    review.description,
    {
      rating: review.review.rating,
      maxRating: review.review.maxRating,
      price: review.product.price
    }
  );

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: review.tags,
    authors: [{ name: review.author.name }],
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      type: 'article',
      publishedTime: review.publishedAt,
      modifiedTime: review.lastUpdated,
      authors: [review.author.name],
      tags: review.tags,
      images: [
        {
          url: review.product.image,
          width: 1200,
          height: 630,
          alt: review.images[0].alt
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      images: [review.product.image],
    },
    alternates: {
      canonical: `/reviews/${params.slug}`
    }
  };
}

export default function ReviewPage({ params }: { params: { slug: string } }) {
  const review = reviewsData[params.slug as keyof typeof reviewsData];
  
  if (!review) {
    notFound();
  }

  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(`/reviews/${params.slug}`);
  
  // Calculate SEO metrics
  const seoAnalysis = analyzeContentSEO({
    title: review.title,
    description: review.description, 
    content: review.content,
    targetKeywords: review.tags
  });

  // Analyze images
  const imageAnalyses = review.images.map(img => {
    return analyzeImageSEO({
      src: img.src,
      alt: img.alt,
      isHero: img.isHero
    }, {
      targetKeywords: review.tags,
      contentType: 'review',
      isHeroImage: img.isHero
    });
  });

  return (
    <>
      {/* SEO Head with all optimizations */}
      <ReviewSEO
        title={review.title}
        description={review.description}
        canonical={`/reviews/${params.slug}`}
        keywords={review.tags}
        author={review.author.name}
        publishedAt={review.publishedAt}
        modifiedAt={review.lastUpdated}
        productName={review.product.name}
        rating={review.review.rating}
        maxRating={review.review.maxRating}
        price={review.product.price}
        ogImage={review.product.image}
      />

      {/* Schema Markup */}
      <ReviewSchema
        title={review.title}
        description={review.description}
        publishedAt={review.publishedAt}
        lastUpdated={review.lastUpdated}
        author={review.author}
        url={`/reviews/${params.slug}`}
        image={review.product.image}
        product={review.product}
        review={review.review}
      />

      <BreadcrumbSchema items={breadcrumbs} />
      
      {review.faq && <FAQSchema faqs={review.faq} />}

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Topic Cluster Navigation */}
        <TopicClusterNav currentUrl={`/reviews/${params.slug}`} />

        {/* Hero Section */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
              Review
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {review.category}
            </span>
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
              <span>⭐</span>
              <span>{review.review.rating}/{review.review.maxRating}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {review.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {review.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <img
                src={review.author.avatar}
                alt={review.author.name}
                className="w-8 h-8 rounded-full"
              />
              <span>By {review.author.name}</span>
            </div>
            <time dateTime={review.publishedAt}>
              {new Date(review.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span>
              {Math.ceil(review.content.split(' ').length / 200)} min read
            </span>
            {review.lastUpdated && (
              <span>
                Updated: {new Date(review.lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Hero Image */}
          <div className="mb-8">
            <OptimizedImage
              src={review.product.image}
              alt={generateOptimizedAltText(
                review.product.image,
                {
                  productName: review.product.name,
                  brandName: review.product.brand,
                  contentType: 'review'
                }
              )}
              width={800}
              height={450}
              priority={true}
              className="w-full rounded-lg shadow-lg"
            />
            {review.images[0].caption && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">
                {review.images[0].caption}
              </p>
            )}
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: review.content }} />
        </div>

        {/* FAQ Section */}
        {review.faq && (
          <section className="mt-12 bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {review.faq.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Content */}
        <RelatedContent
          category={review.category}
          tags={review.tags}
          currentUrl={`/reviews/${params.slug}`}
          title="Related Reviews & Guides"
          maxItems={6}
          showClusterLinks={true}
        />

        {/* SEO Analysis (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              SEO Analysis (Development Only)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Overall SEO Score:</strong> {seoAnalysis.overall}/100
                <br />
                <strong>Word Count:</strong> {review.content.split(' ').length}
                <br />
                <strong>Reading Time:</strong> {Math.ceil(review.content.split(' ').length / 200)} minutes
              </div>
              <div>
                <strong>Issues:</strong>
                <ul className="list-disc list-inside">
                  {seoAnalysis.issues.map((issue, i) => (
                    <li key={i} className="text-red-600">{issue}</li>
                  ))}
                </ul>
                <strong>Suggestions:</strong>
                <ul className="list-disc list-inside">
                  {seoAnalysis.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-blue-600">{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  );
}