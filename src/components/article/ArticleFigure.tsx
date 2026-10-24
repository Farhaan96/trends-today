import Image from 'next/image';

export default function ArticleFigure({
  src,
  alt,
  caption,
  credit,
  licence,
}: {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  licence?: string;
}) {
  const creditLine = [credit, licence].filter(Boolean).join(', ');

  return (
    <figure className="article-figure">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={800}
        sizes="(max-width: 640px) 100vw, 720px"
      />
      {caption || creditLine ? (
        <figcaption>
          {caption ? <span>{caption}</span> : null}
          {creditLine ? <span>{creditLine}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
