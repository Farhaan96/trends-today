import EditorialHeader from '@/components/editorial/EditorialHeader';
import { getSiteFreshness } from '@/lib/site-freshness';

export default async function SiteHeader() {
  const freshness = await getSiteFreshness();
  return <EditorialHeader freshness={freshness} />;
}
