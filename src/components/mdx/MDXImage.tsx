import ImageWithFallback from '@/components/ui/ImageWithFallback';

interface MDXImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
}

export default function MDXImage({ src, alt, title, width, height }: MDXImageProps) {
  // Use existing product images as fallbacks for better visual experience
  const getFallbackImage = (alt: string) => {
    if (alt.toLowerCase().includes('iphone')) return '/images/products/iphone-15-pro-hero.jpg';
    if (alt.toLowerCase().includes('samsung') || alt.toLowerCase().includes('galaxy')) return '/images/products/samsung-galaxy-s24-hero.jpg';
    if (alt.toLowerCase().includes('pixel') || alt.toLowerCase().includes('google')) return '/images/products/google-pixel-8-pro-hero.jpg';
    if (alt.toLowerCase().includes('oneplus')) return '/images/products/oneplus-12-hero.jpg';
    if (alt.toLowerCase().includes('xiaomi')) return '/images/products/xiaomi-14-ultra-hero.jpg';
    if (alt.toLowerCase().includes('macbook')) return '/images/products/macbook-air-m3-hero.jpg';
    return '/images/products/iphone-15-pro-hero.jpg'; // Default fallback
  };

  return (
    <div className="my-6">
      <ImageWithFallback
        src={src}
        alt={alt}
        width={width || 800}
        height={height || 450}
        className="w-full h-auto rounded-lg shadow-md"
        fallbackSrc={getFallbackImage(alt)}
      />
      {title && (
        <p className="text-sm text-gray-600 text-center mt-2 italic">
          {title}
        </p>
      )}
    </div>
  );
}
