import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Subscription unavailable | Trends Today',
  robots: { index: false, follow: false },
};

export default function SubscribePage() {
  notFound();
}
