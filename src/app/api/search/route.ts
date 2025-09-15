import { NextRequest, NextResponse } from 'next/server';

// Mock data - In production, this would query your database or search service
const mockResults = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max Review: The Ultimate Smartphone Experience',
    type: 'review' as const,
    excerpt:
      'After two weeks of intensive testing, the iPhone 15 Pro Max delivers exceptional performance with its A17 Pro chip and impressive camera system.',
    url: '/reviews/iphone-15-pro-max',
    image: '/images/iphone-15-pro.jpg',
    publishedAt: '2024-09-01T10:00:00Z',
    tags: ['iphone', 'apple', 'smartphone', 'review'],
  },
  {
    id: '2',
    title: 'Best Laptops for Students 2025: Budget to Premium Options',
    type: 'guide' as const,
    excerpt:
      'Comprehensive buying guide covering the top laptops for students across different budgets, from budget-friendly options to premium ultrabooks.',
    url: '/best/laptops/students-2025',
    image: '/images/student-laptops.jpg',
    publishedAt: '2024-08-28T14:30:00Z',
    tags: ['laptops', 'students', 'buying-guide', 'budget'],
  },
  {
    id: '3',
    title: 'iPhone 15 Pro vs Samsung Galaxy S24: Ultimate Comparison',
    type: 'comparison' as const,
    excerpt:
      'Head-to-head comparison of the flagship smartphones from Apple and Samsung, covering performance, camera, battery life, and value.',
    url: '/compare/iphone-15-pro-vs-samsung-galaxy-s24',
    image: '/images/iphone-vs-samsung.jpg',
    publishedAt: '2024-08-25T09:15:00Z',
    tags: ['iphone', 'samsung', 'comparison', 'flagship'],
  },
  {
    id: '4',
    title: 'Sony WH-1000XM5 Review: Premium Noise Cancelling Headphones',
    type: 'review' as const,
    excerpt:
      "In-depth review of Sony's flagship noise-cancelling headphones with improved comfort, battery life, and exceptional sound quality.",
    url: '/reviews/sony-wh-1000xm5',
    image: '/images/sony-headphones.jpg',
    publishedAt: '2024-08-20T16:45:00Z',
    tags: ['sony', 'headphones', 'audio', 'noise-cancelling'],
  },
  {
    id: '5',
    title: 'MacBook Air M3 vs Dell XPS 13: Which Should You Buy?',
    type: 'comparison' as const,
    excerpt:
      "Detailed comparison between Apple's latest MacBook Air and Dell's premium ultrabook, focusing on performance, design, and value.",
    url: '/compare/macbook-air-m3-vs-dell-xps-13',
    image: '/images/macbook-vs-dell.jpg',
    publishedAt: '2024-08-18T11:20:00Z',
    tags: ['macbook', 'dell', 'ultrabook', 'comparison'],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Filter results based on query
    const filteredResults = mockResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query) ||
        result.excerpt.toLowerCase().includes(query) ||
        result.tags.some((tag) => tag.toLowerCase().includes(query))
    );

    // Sort by relevance (simple title match scoring)
    const scoredResults = filteredResults
      .map((result) => ({
        ...result,
        score: result.title.toLowerCase().includes(query) ? 2 : 1,
      }))
      .sort((a, b) => b.score - a.score);

    // Remove score from response
    const results = scoredResults.map(({ score: _score, ...result }) => result);

    // Track search
    console.log(`Search performed: "${query}" - ${results.length} results`);

    return NextResponse.json({
      results: results.slice(0, 10), // Limit to 10 results
      total: results.length,
      query,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        results: [],
      },
      { status: 500 }
    );
  }
}
