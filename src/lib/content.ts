import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Article {
  slug: string;
  frontmatter: any;
  type: 'news' | 'reviews' | 'comparisons' | 'guides' | 'best';
  href: string;
}

export interface HomepageContent {
  featuredNews: Article[];
  latestReviews: Article[];
  latestComparisons: Article[];
  bestGuides: Article[];
  heroArticle?: Article;
}

// Get all articles from a specific content directory
async function getArticlesFromDir(
  contentDir: string, 
  type: Article['type']
): Promise<Article[]> {
  try {
    if (!fs.existsSync(contentDir)) {
      return [];
    }
    
    const files = fs.readdirSync(contentDir);
    const articles = files
      .filter(file => file.endsWith('.mdx') || file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(contentDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        let frontmatter;
        if (file.endsWith('.mdx')) {
          const { data } = matter(fileContent);
          frontmatter = data;
        } else {
          // For JSON files, parse the entire content
          frontmatter = JSON.parse(fileContent);
        }
        
        return {
          slug: file.replace(/\.(mdx|json)$/, ''),
          frontmatter,
          type,
          href: `/${type}/${file.replace(/\.(mdx|json)$/, '')}`
        };
      })
      .filter(article => article.frontmatter.title) // Only include articles with titles
      .sort((a, b) => {
        const dateA = new Date(a.frontmatter.publishedAt || a.frontmatter.datePublished || '1970-01-01');
        const dateB = new Date(b.frontmatter.publishedAt || b.frontmatter.datePublished || '1970-01-01');
        return dateB.getTime() - dateA.getTime(); // Sort by date, newest first
      });
    
    return articles;
  } catch (error) {
    console.error(`Error loading articles from ${contentDir}:`, error);
    return [];
  }
}

// Get all content for homepage
export async function getHomepageContent(): Promise<HomepageContent> {
  const contentBaseDir = path.join(process.cwd(), 'content');
  
  // Load articles from different directories
  const [newsArticles, reviewArticles, comparisonArticles, guideArticles] = await Promise.all([
    getArticlesFromDir(path.join(contentBaseDir, 'news'), 'news'),
    getArticlesFromDir(path.join(contentBaseDir, 'reviews'), 'reviews'),
    getArticlesFromDir(path.join(contentBaseDir, 'comparisons'), 'comparisons'),
    getArticlesFromDir(path.join(contentBaseDir, 'best'), 'best')
  ]);

  // Find hero article (featured news or latest review)
  const heroArticle = newsArticles.find(article => article.frontmatter.featured) || 
                     newsArticles[0] || 
                     reviewArticles[0];

  return {
    featuredNews: newsArticles.slice(0, 4),
    latestReviews: reviewArticles.slice(0, 4),
    latestComparisons: comparisonArticles.slice(0, 2),
    bestGuides: guideArticles.slice(0, 3),
    heroArticle
  };
}

// Get a single article by slug and type
export async function getArticle(slug: string, type: Article['type']): Promise<Article | null> {
  try {
    const contentDir = path.join(process.cwd(), 'content', type);
    const filePath = path.join(contentDir, `${slug}.mdx`);
    const jsonFilePath = path.join(contentDir, `${slug}.json`);
    
    let filePathToUse = '';
    let isJson = false;
    
    if (fs.existsSync(filePath)) {
      filePathToUse = filePath;
    } else if (fs.existsSync(jsonFilePath)) {
      filePathToUse = jsonFilePath;
      isJson = true;
    } else {
      return null;
    }
    
    const fileContent = fs.readFileSync(filePathToUse, 'utf-8');
    
    let frontmatter;
    if (isJson) {
      frontmatter = JSON.parse(fileContent);
    } else {
      const { data } = matter(fileContent);
      frontmatter = data;
    }
    
    return {
      slug,
      frontmatter,
      type,
      href: `/${type}/${slug}`
    };
  } catch (error) {
    console.error(`Error loading article ${slug} from ${type}:`, error);
    return null;
  }
}

// Get all articles of a specific type
export async function getArticlesByType(type: Article['type']): Promise<Article[]> {
  const contentDir = path.join(process.cwd(), 'content', type);
  return getArticlesFromDir(contentDir, type);
}

// Get all posts from all content types (for RSS feed)
export async function getAllPosts(): Promise<Article[]> {
  const contentBaseDir = path.join(process.cwd(), 'content');
  
  // Load articles from all directories
  const [newsArticles, reviewArticles, comparisonArticles, guideArticles, bestArticles] = await Promise.all([
    getArticlesFromDir(path.join(contentBaseDir, 'news'), 'news'),
    getArticlesFromDir(path.join(contentBaseDir, 'reviews'), 'reviews'),
    getArticlesFromDir(path.join(contentBaseDir, 'comparisons'), 'comparisons'),
    getArticlesFromDir(path.join(contentBaseDir, 'guides'), 'guides'),
    getArticlesFromDir(path.join(contentBaseDir, 'best'), 'best')
  ]);

  // Combine all articles and sort by date
  const allArticles = [
    ...newsArticles,
    ...reviewArticles, 
    ...comparisonArticles,
    ...guideArticles,
    ...bestArticles
  ].sort((a, b) => {
    const dateA = new Date(a.frontmatter.publishedAt || a.frontmatter.datePublished || '1970-01-01');
    const dateB = new Date(b.frontmatter.publishedAt || b.frontmatter.datePublished || '1970-01-01');
    return dateB.getTime() - dateA.getTime(); // Sort by date, newest first
  });

  return allArticles;
}
