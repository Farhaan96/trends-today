import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'apps/web/content/posts');

export interface Post {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  date: string;
  image?: string;
  imageAlt?: string;
  imageAttribution?: string;
  tags?: string[];
  category?: string;
  author?: string;
  readingTime?: string;
  content: string;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      content,
      title: data.title || 'Untitled',
      subtitle: data.subtitle,
      description: data.description || data.meta_description || '',
      date: data.date || new Date().toISOString(),
      image: data.image,
      imageAlt: data.imageAlt,
      imageAttribution: data.imageAttribution,
      tags: data.tags || [],
      category: data.category || 'Technology',
      author: data.author || 'Trends Today Team',
      readingTime: data.readingTime || '5 min read',
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  // Create directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.mdx$/, '');
        return getPostBySlug(slug);
      })
  );

  // Filter out nulls and sort by date
  return allPosts
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(
    (post) => post.category?.toLowerCase() === category.toLowerCase()
  );
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) =>
    post.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}
