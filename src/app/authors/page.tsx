import { Metadata } from 'next';
import NewsroomDirectory from '@/components/newsroom/NewsroomDirectory';

export const metadata: Metadata = {
  title: 'Our Newsroom and Publisher',
  description:
    'Meet the people and reporting process behind Trends Today, including how to contact the publisher and newsroom.',
  alternates: { canonical: '/authors' },
};

export default NewsroomDirectory;
