import JsonLdScript from '@/components/seo/JsonLdScript';
import { isLayoutBaseSchemaGraph } from '@/lib/schema-urls';

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  if (isLayoutBaseSchemaGraph(data)) return null;

  return <JsonLdScript data={data} />;
}
