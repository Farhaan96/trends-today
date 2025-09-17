import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export interface Article {
  slug: string;
  category: string;
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  author: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  content: string;
  mdxContent: string;
  frontmatter: any;
}

export async function getAllArticles(): Promise<Article[]> {
  const categories = [
    'science',
    'culture',
    'psychology',
    'technology',
    'health',
    'space',
  ];
  const articles: Article[] = [];

  for (const category of categories) {
    const categoryPath = path.join(contentDirectory, category);

    if (!fs.existsSync(categoryPath)) {
      continue;
    }

    const files = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith('.mdx'))
      // Exclude backup long-form duplicates (e.g., *.backup.mdx)
      .filter((file) => !/\.backup\.mdx$/i.test(file));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      articles.push({
        slug: file.replace('.mdx', ''),
        category: category,
        title: data.title || 'Untitled',
        description: data.description || '',
        image: data.image || data.images?.featured || '/images/placeholder.jpg',
        publishedAt: data.publishedAt || new Date().toISOString(),
        author:
          typeof data.author === 'string'
            ? { name: data.author }
            : data.author || { name: 'Trends Today' },
        content: content,
        mdxContent: content,
        frontmatter: data,
      });
    }
  }

  // Sort by date, newest first
  return articles.sort((a, b) => {
    const dateA = new Date(a.publishedAt || 0).getTime();
    const dateB = new Date(b.publishedAt || 0).getTime();
    return dateB - dateA;
  });
}

export async function getArticleBySlug(
  category: string,
  slug: string
): Promise<Article | null> {
  // Hide backup long-form duplicates
  if (/\.backup$/i.test(slug)) {
    return null;
  }
  const filePath = path.join(contentDirectory, category, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    slug: slug,
    category: category,
    title: data.title || 'Untitled',
    description: data.description || '',
    image: data.image || data.images?.featured || '/images/placeholder.jpg',
    publishedAt: data.publishedAt || new Date().toISOString(),
    author:
      typeof data.author === 'string'
        ? { name: data.author }
        : data.author || { name: 'Trends Today' },
    content: content,
    mdxContent: content,
    frontmatter: data,
  };
}

export async function getArticlesByCategory(
  category: string
): Promise<Article[]> {
  const categoryPath = path.join(contentDirectory, category);

  if (!fs.existsSync(categoryPath)) {
    return [];
  }

  const files = fs
    .readdirSync(categoryPath)
    .filter((file) => file.endsWith('.mdx'))
    // Exclude backup long-form duplicates (e.g., *.backup.mdx)
    .filter((file) => !/\.backup\.mdx$/i.test(file));
  const articles: Article[] = [];

  for (const file of files) {
    const filePath = path.join(categoryPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    articles.push({
      slug: file.replace('.mdx', ''),
      category: category,
      title: data.title || 'Untitled',
      description: data.description || '',
      image: data.image || data.images?.featured || '/images/placeholder.jpg',
      publishedAt: data.publishedAt || new Date().toISOString(),
      author:
        typeof data.author === 'string'
          ? { name: data.author }
          : data.author || { name: 'Trends Today' },
      content: content,
      mdxContent: content,
      frontmatter: data,
    });
  }

  // Sort by date, newest first
  return articles.sort((a, b) => {
    const dateA = new Date(a.publishedAt || 0).getTime();
    const dateB = new Date(b.publishedAt || 0).getTime();
    return dateB - dateA;
  });
}

export async function getArticlesByAuthor(
  authorName: string
): Promise<Article[]> {
  const allArticles = await getAllArticles();

  return allArticles.filter((article) => {
    const articleAuthor =
      typeof article.author === 'string'
        ? article.author
        : article.author?.name;
    return articleAuthor === authorName;
  });
}
