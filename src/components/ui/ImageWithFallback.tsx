"use client";

import Image, { ImageProps } from "next/image";
import React from "react";

type Props = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export default function ImageWithFallback({ src, fallbackSrc = "/file.svg", alt, ...rest }: Props) {
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    <Image
      {...rest}
      alt={alt}
      src={imgSrc}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
    />
  );
}

