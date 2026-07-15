'use client';

import Image from 'next/image';
import { useState } from 'react';

interface EditorialImageProps {
  src?: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}

export default function EditorialImage({
  src,
  alt,
  priority = false,
  sizes,
  className = '',
}: EditorialImageProps) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div className="editorial-image-fallback" role="img" aria-label={alt}>
        <span>Trends Today</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`editorial-image ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
