import ImageWithFallback from '@/components/ui/ImageWithFallback';

interface MDXImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
}

export default function MDXImage({ src, alt, title, width, height }: MDXImageProps) {
  return (
    <div className="my-6">
      <ImageWithFallback
        src={src}
        alt={alt}
        width={width || 800}
        height={height || 450}
        className="w-full h-auto rounded-lg shadow-md"
        fallbackSrc="/file.svg"
      />
      {title && (
        <p className="text-sm text-gray-600 text-center mt-2 italic">
          {title}
        </p>
      )}
    </div>
  );
}
