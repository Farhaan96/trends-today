import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/content';

export async function GET() {
  try {
    // Get all posts for RSS feed
    const posts = await getAllPosts();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://trendstoday.ca';

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Trends Today - Latest Tech News &amp; Reviews</title>
    <description>Stay ahead with the latest technology news, in-depth reviews, and expert analysis. Your trusted source for tech trends and innovations.</description>
    <link>${siteUrl}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <managingEditor>editor@trendstoday.ca (Trends Today Editorial)</managingEditor>
    <webMaster>admin@trendstoday.ca (Trends Today Technical)</webMaster>
    <copyright>© ${new Date().getFullYear()} Trends Today. All rights reserved.</copyright>
    <image>
      <url>${siteUrl}/images/logo.png</url>
      <title>Trends Today</title>
      <link>${siteUrl}</link>
      <description>Latest Tech News &amp; Reviews</description>
      <width>144</width>
      <height>144</height>
    </image>
    <ttl>60</ttl>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.frontmatter.title || 'Untitled'}]]></title>
      <description><![CDATA[${post.frontmatter.description || post.frontmatter.excerpt || ''}]]></description>
      <link>${siteUrl}${post.href}</link>
      <guid isPermaLink="true">${siteUrl}${post.href}</guid>
      <pubDate>${new Date(post.frontmatter.publishedAt || post.frontmatter.datePublished || new Date()).toUTCString()}</pubDate>
      <category><![CDATA[${post.type}]]></category>
      <author>${post.frontmatter.author?.name || post.frontmatter.author || 'Trends Today Editorial'}</author>
      ${
        post.frontmatter.image
          ? `
      <media:content url="${siteUrl}${post.frontmatter.image}" medium="image" />
      <enclosure url="${siteUrl}${post.frontmatter.image}" type="image/jpeg" length="0"/>`
          : ''
      }
      <content:encoded><![CDATA[
        ${post.frontmatter.image ? `<img src="${siteUrl}${post.frontmatter.image}" alt="${post.frontmatter.title}" style="max-width:100%;height:auto;margin-bottom:1rem;">` : ''}
        <p>${post.frontmatter.description || post.frontmatter.excerpt || ''}</p>
        <p><a href="${siteUrl}${post.href}">Read the full article on Trends Today</a></p>
      ]]></content:encoded>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// RSS Feed for specific categories
export async function POST(request: Request) {
  try {
    const { category } = await request.json();
    const allPosts = await getAllPosts();
    const posts = allPosts.filter((post) => post.type === category);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://trendstoday.ca';

    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Trends Today - ${categoryTitle}</title>
    <description>Latest ${categoryTitle.toLowerCase()} from Trends Today</description>
    <link>${siteUrl}/${category}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss?category=${category}" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.frontmatter.title || 'Untitled'}]]></title>
      <description><![CDATA[${post.frontmatter.description || ''}]]></description>
      <link>${siteUrl}${post.href}</link>
      <guid isPermaLink="true">${siteUrl}${post.href}</guid>
      <pubDate>${new Date(post.frontmatter.publishedAt || post.frontmatter.datePublished || new Date()).toUTCString()}</pubDate>
      <category><![CDATA[${post.type}]]></category>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800',
      },
    });
  } catch (error) {
    console.error('Category RSS generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
