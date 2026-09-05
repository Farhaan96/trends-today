import { permanentRedirect } from 'next/navigation';

// No buying guides are published under /best/<slug>. Send any legacy or
// indexed child URL (e.g. /best/best-smartphones) to the hub instead of 404.
export default async function BestChildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  permanentRedirect('/best');
}
