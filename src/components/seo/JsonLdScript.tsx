import { serializeJsonLd } from '@/lib/schema-urls';

export default function JsonLdScript({
  data,
  id,
}: {
  data: unknown;
  id?: string;
}) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
