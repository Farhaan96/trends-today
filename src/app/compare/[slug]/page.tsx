import { permanentRedirect } from 'next/navigation';

// The only published comparison has its own static route
// (/compare/iphone-15-pro-vs-samsung-galaxy-s24), which takes precedence over
// this dynamic segment. Every other /compare/<slug> resolves to the hub.
export default async function CompareChildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  permanentRedirect('/compare');
}
