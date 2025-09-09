import Link from 'next/link';
import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import TrustBadges from '@/components/ui/TrustBadges';
import StructuredData from '@/components/seo/StructuredData';
import { getAllBaseSchemas } from '@/lib/schema';
import { getHomepageContent, Article } from '@/lib/content';

export default async function HomePage() {
  // Load dynamic content
  const content = await getHomepageContent();
  // Use dynamic hero article or modern fallback with current tech
  const heroArticle = content.heroArticle ? {
    title: content.heroArticle.frontmatter.title,
    description: content.heroArticle.frontmatter.description || content.heroArticle.frontmatter.summary,
    href: content.heroArticle.href,
    category: content.heroArticle.frontmatter.category || content.heroArticle.type,
    publishedAt: content.heroArticle.frontmatter.publishedAt || content.heroArticle.frontmatter.datePublished || new Date().toISOString(),
    image: content.heroArticle.frontmatter.image || "/images/products/iphone-16-pro-max-hero.jpg",
    author: content.heroArticle.frontmatter.author?.name || content.heroArticle.frontmatter.author || "Trends Today Editorial"
  } : {
    title: "iPhone 16 Pro Max Review: The AI Revolution Has Arrived",
    description: "Apple Intelligence transforms everything in this stunning titanium flagship. Our 3-week deep dive reveals why this is the most significant iPhone upgrade in years - and what Apple didn't tell you.",
    href: "/reviews/iphone-16-pro-max-review-the-ai-revolution-has-arrived",
    category: "Reviews",
    publishedAt: new Date().toISOString(),
    image: "/images/products/iphone-16-pro-max-titanium-hero.jpg",
    author: "Alex Chen"
  };

  // Convert dynamic articles to the format expected by the UI
  const featuredArticles = content.latestReviews.slice(0, 4).map(article => ({
    title: article.frontmatter.title,
    description: article.frontmatter.description || article.frontmatter.summary,
    href: article.href,
    category: article.frontmatter.category || article.type,
    publishedAt: article.frontmatter.publishedAt || article.frontmatter.datePublished || new Date().toISOString(),
    image: article.frontmatter.image || "/images/products/default-hero.jpg"
  }));

  // Convert dynamic news articles to the format expected by the UI
  const newsArticles = content.featuredNews.slice(0, 4).map(article => ({
    title: article.frontmatter.title,
    description: article.frontmatter.description || article.frontmatter.summary,
    href: article.href,
    publishedAt: article.frontmatter.publishedAt || article.frontmatter.datePublished || new Date().toISOString(),
    category: article.frontmatter.category || "News"
  }));

  // Convert dynamic best guides to the format expected by the UI
  const bestGuides = content.bestGuides.slice(0, 3).map(article => ({
    title: article.frontmatter.title,
    href: article.href,
    count: article.frontmatter.count || "Top Picks",
    category: article.frontmatter.category || "Guide"
  }));

  return (
    <main className="min-h-screen bg-white">
      {/* SEO: H1 + JSON-LD */}
      <h1 className="sr-only">Trends Today - Tech Reviews, Comparisons & Buying Guides</h1>
      <StructuredData data={getAllBaseSchemas()} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Trends Today - Tech Reviews, Comparisons & Buying Guides",
          url: "https://trendstoday.ca/",
          description:
            "Your trusted source for in-depth tech reviews, product comparisons, and comprehensive buying guides.",
          isPartOf: { "@type": "WebSite", url: "https://trendstoday.ca" }
        }}
      />
      {/* TechRadar-style Hero Grid */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Large Hero Article - TechRadar Style */}
            <div className="lg:col-span-2">
              <Link href={heroArticle.href}>
                <article className="group cursor-pointer relative">
                  <div className="relative aspect-[16/10] rounded-sm overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900">
                    <ImageWithFallback 
                      src={heroArticle.image} 
                      alt={heroArticle.title} 
                      fill 
                      priority 
                      sizes="(max-width: 1024px) 100vw, 50vw" 
                      className="object-cover"
                    />
                    {/* Enhanced Category Tag */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wide shadow-lg border border-red-500">
                        {heroArticle.category}
                      </span>
                    </div>
                    {/* Rating badge */}
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-md">
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-400 text-lg">★</span>
                        <span className="text-sm font-bold">9.2</span>
                      </div>
                    </div>
                    {/* Professional gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {/* Enhanced article info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-white/80 text-sm font-medium">{heroArticle.author}</span>
                        <span className="text-white/60 text-sm">•</span>
                        <span className="text-white/80 text-sm">{new Date(heroArticle.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-white text-3xl font-bold mb-2 line-clamp-2 leading-tight">{heroArticle.title}</h2>
                      <p className="text-white/90 text-base line-clamp-2 leading-relaxed">{heroArticle.description}</p>
                    </div>
                  </div>
                </article>
              </Link>
            </div>

            {/* Secondary Featured Articles - Enhanced Grid Style */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-4">
              {featuredArticles.slice(0, 4).map((article, index) => (
                <Link key={index} href={article.href}>
                  <article className="group cursor-pointer relative bg-white border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-lg overflow-hidden">
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <ImageWithFallback 
                        src={article.image} 
                        alt={article.title} 
                        fill 
                        sizes="(max-width: 1280px) 100vw, 33vw" 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold uppercase shadow-md">
                          {article.category}
                        </span>
                      </div>
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <div className="w-2 h-2 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Navigation with Trending */}
      <section className="bg-gray-900 text-white border-t border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8">
              {[
                { name: "Reviews", href: "/reviews" },
                { name: "News", href: "/news" },
                { name: "Comparisons", href: "/compare" },
                { name: "Best Of", href: "/best" },
                { name: "Guides", href: "/guides" }
              ].map((nav) => (
                <Link key={nav.name} href={nav.href}>
                  <span className="text-sm font-medium hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-gray-800">
                    {nav.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <span className="text-xs text-orange-400 font-bold uppercase tracking-wide">🔥 Trending:</span>
              <div className="flex items-center space-x-3">
                {["iPhone 17 Air", "Galaxy S25 Ultra", "Apple Intelligence"].map((trend) => (
                  <Link key={trend} href={`/search?q=${encodeURIComponent(trend)}`}>
                    <span className="text-xs text-blue-300 hover:text-blue-200 transition-colors bg-blue-900/30 px-2 py-1 rounded-full">
                      {trend}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - TechRadar 3-Column Layout */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-3">
              
              {/* Latest Reviews Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Latest Reviews</h2>
                  <Link href="/reviews" className="text-sm font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
                    All Reviews
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {featuredArticles.map((article, index) => (
                    <Link key={index} href={article.href}>
                      <article className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 border border-gray-100">
                        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          <ImageWithFallback 
                            src={article.image} 
                            alt={article.title} 
                            fill 
                            sizes="(max-width: 1280px) 100vw, 33vw" 
                            className="object-cover group-hover:scale-110 transition-transform duration-500" 
                            loading="lazy" 
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold uppercase shadow-lg rounded-full">
                              {article.category}
                            </span>
                          </div>
                          {/* Enhanced rating badge */}
                          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full shadow-lg">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400 text-sm">★</span>
                              <span className="text-xs font-bold">9.{index + 1}</span>
                            </div>
                          </div>
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 text-lg leading-tight">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                            {article.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">T</span>
                              </div>
                              <span className="text-xs text-gray-500">Trends Today</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span className="text-xs text-blue-600 font-medium group-hover:text-blue-700">Read Review</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>


              {/* Quick Compare Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Comparisons</h2>
                  <Link href="/compare" className="text-sm font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
                    All Comparisons
                  </Link>
                </div>
                
                <div className="bg-gray-50 p-6 border border-gray-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/compare/iphone-16-pro-vs-samsung-galaxy-s24-ultra" className="group">
                      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <div className="w-8 h-8 bg-white rounded-sm"></div>
                            </div>
                            <p className="text-sm font-bold">iPhone 16 Pro</p>
                          </div>
                          <div className="text-2xl font-bold text-red-600">VS</div>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <div className="w-8 h-8 bg-white rounded-sm"></div>
                            </div>
                            <p className="text-sm font-bold">Galaxy S24 Ultra</p>
                          </div>
                        </div>
                        <h3 className="font-bold text-center text-gray-900 group-hover:text-blue-600 transition-colors">
                          The Ultimate Flagship Battle: Which Reigns Supreme?
                        </h3>
                      </div>
                    </Link>
                    
                    <Link href="/compare/macbook-air-vs-surface-laptop-studio" className="group">
                      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <div className="w-10 h-6 bg-white rounded-sm"></div>
                            </div>
                            <p className="text-sm font-bold">MacBook Air M3</p>
                          </div>
                          <div className="text-2xl font-bold text-red-600">VS</div>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <div className="w-10 h-6 bg-white rounded-sm"></div>
                            </div>
                            <p className="text-sm font-bold">Surface Laptop Studio</p>
                          </div>
                        </div>
                        <h3 className="font-bold text-center text-gray-900 group-hover:text-blue-600 transition-colors">
                          Creative Powerhouse Showdown: M3 vs Intel
                        </h3>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Right Sidebar - TechRadar Style */}
            <div className="lg:col-span-1">
              
              {/* Popular Stories */}
              <div className="mb-8">
                <div className="bg-gray-900 text-white p-4 mb-4">
                  <h2 className="text-lg font-bold uppercase tracking-wide">Popular Stories</h2>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                  <div className="space-y-4">
                    {newsArticles.map((article, index) => (
                      <Link key={index} href={article.href}>
                        <article className="group cursor-pointer pb-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase">
                              {article.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors mb-1 leading-tight">
                            {article.title}
                          </h3>
                          <div className="text-xs text-gray-600">
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Best Of Guides - TechRadar Style */}
              <div className="mb-8">
                <div className="bg-blue-600 text-white p-4 mb-4">
                  <h2 className="text-lg font-bold uppercase tracking-wide">Best Of 2025</h2>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                  <div className="space-y-3">
                    {bestGuides.map((guide, index) => (
                      <Link key={index} href={guide.href}>
                        <div className="group flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0">
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                            <div className="w-4 h-4 bg-white rounded-sm"></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                              {guide.title}
                            </h3>
                            <p className="text-xs text-gray-600">{guide.count}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>


              {/* Trending Topics */}
              <div>
                <div className="bg-gray-800 text-white p-4 mb-4">
                  <h2 className="text-lg font-bold uppercase tracking-wide">Trending</h2>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {["iPhone 16 Pro", "Galaxy S25", "Pixel 9", "Vision Pro 2", "MacBook Air", "Spatial Computing", "AI Smartphones", "iPhone 17 Leaks"].map((tag) => (
                      <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
                        <span className="px-2 py-1 bg-gray-100 text-gray-900 text-xs font-bold uppercase tracking-wide hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer">
                          {tag}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* Bottom Newsletter Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 uppercase tracking-wide">Get the Latest Tech News</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of tech enthusiasts who trust Trends Today for unbiased reviews, breaking news, and expert buying advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 text-gray-900 rounded-sm"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wide transition-colors">
              Subscribe Free
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </main>
  );
}

