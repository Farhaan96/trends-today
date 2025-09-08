"use client";

import Image, { ImageProps } from "next/image";
import React from "react";

type Props = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export default function ImageWithFallback({ src, fallbackSrc = "/file.svg", alt, className = "", ...rest }: Props) {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
      }
    }
  };

  // If we have an error and no fallback, show a placeholder
  if (hasError && imgSrc === fallbackSrc) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-sm ${className}`} aria-label="Image not available">
        <div className="text-center p-6 select-none">
          <div className="text-3xl mb-1" aria-hidden>📷</div>
          <p className="text-gray-600 text-xs font-medium">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      {...rest}
      alt={alt}
      src={imgSrc}
      className={className}
      onError={handleError}
    />
  );
}

