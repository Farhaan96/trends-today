import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Article {
  slug: string;
  frontmatter: any;
  type: 'news' | 'reviews' | 'comparisons' | 'guides' | 'best';
  href: string;
  category?: string;
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
    
    const files = fs
      .readdirSync(contentDir)
      .filter(file => file.endsWith('.mdx') || file.endsWith('.json'))
      // Exclude backup long-form duplicates (e.g., *.backup.mdx)
      .filter(file => !/\.backup\.mdx$/i.test(file));
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
  
  // Load articles from NEW category directories
  const allArticles = await getAllPosts();
  
  // Separate articles by type based on their category
  const techArticles = allArticles.filter(a => a.category === 'technology');
  const scienceArticles = allArticles.filter(a => a.category === 'science');
  const cultureArticles = allArticles.filter(a => a.category === 'culture');
  const psychologyArticles = allArticles.filter(a => a.category === 'psychology');
  const healthArticles = allArticles.filter(a => a.category === 'health');
  const spaceArticles = allArticles.filter(a => a.category === 'space');

  // Find hero article (latest article overall)
  const heroArticle = allArticles[0];

  return {
    featuredNews: techArticles.slice(0, 4), // Use tech articles as "news"
    latestReviews: techArticles.filter(a => 
      a.frontmatter.title?.toLowerCase().includes('review')).slice(0, 4),
    latestComparisons: techArticles.filter(a => 
      a.frontmatter.title?.toLowerCase().includes('vs')).slice(0, 2),
    bestGuides: [...scienceArticles, ...cultureArticles, ...psychologyArticles].slice(0, 3),
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
  
  // Load articles from NEW category directories
  const categories = ['science', 'culture', 'psychology', 'technology', 'health', 'space'];
  const articlePromises = categories.map(category => 
    getArticlesFromCategoryDir(path.join(contentBaseDir, category), category)
  );
  
  const articleArrays = await Promise.all(articlePromises);
  
  // Combine all articles and sort by date
  const allArticles = articleArrays.flat().sort((a, b) => {
    const dateA = new Date(a.frontmatter.publishedAt || a.frontmatter.datePublished || '1970-01-01');
    const dateB = new Date(b.frontmatter.publishedAt || b.frontmatter.datePublished || '1970-01-01');
    return dateB.getTime() - dateA.getTime(); // Sort by date, newest first
  });

  return allArticles;
}

// Helper function for category-based articles
async function getArticlesFromCategoryDir(contentDir: string, category: string): Promise<Article[]> {
  try {
    if (!fs.existsSync(contentDir)) {
      return [];
    }
    
    const files = fs.readdirSync(contentDir);
    const articles = files
      .filter(file => file.endsWith('.mdx'))
      // Exclude backup long-form duplicates (e.g., *.backup.mdx)
      .filter(file => !/\.backup\.mdx$/i.test(file))
      .map(file => {
        const filePath = path.join(contentDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent);
        
        return {
          slug: file.replace('.mdx', ''),
          frontmatter: data,
          type: 'news' as Article['type'], // Default type for compatibility
          href: `/${category}/${file.replace('.mdx', '')}`, // Use category-based routing
          category: category
        };
      })
      .filter(article => article.frontmatter.title) // Only include articles with titles
      .sort((a, b) => {
        const dateA = new Date(a.frontmatter.publishedAt || a.frontmatter.datePublished || '1970-01-01');
        const dateB = new Date(b.frontmatter.publishedAt || b.frontmatter.datePublished || '1970-01-01');
        return dateB.getTime() - dateA.getTime();
      });
    
    return articles;
  } catch (error) {
    console.error(`Error loading articles from ${contentDir}:`, error);
    return [];
  }
}
