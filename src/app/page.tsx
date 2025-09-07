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
  // Use dynamic hero article or fallback
  const heroArticle = content.heroArticle ? {
    title: content.heroArticle.frontmatter.title,
    description: content.heroArticle.frontmatter.description || content.heroArticle.frontmatter.summary,
    href: content.heroArticle.href,
    category: content.heroArticle.frontmatter.category || content.heroArticle.type,
    publishedAt: content.heroArticle.frontmatter.publishedAt || content.heroArticle.frontmatter.datePublished || new Date().toISOString(),
    image: content.heroArticle.frontmatter.image || "/images/products/iphone-15-pro-max-hero.jpg",
    author: content.heroArticle.frontmatter.author?.name || content.heroArticle.frontmatter.author || "Trends Today Editorial"
  } : {
    title: "iPhone 15 Pro Max Review: Apple's Most Advanced Phone Yet",
    description: "After two weeks of testing, we dive deep into Apple's flagship to see if the titanium design, A17 Pro chip, and 5x zoom camera justify the premium price tag.",
    href: "/reviews/iphone-15-pro-max-review",
    category: "Reviews",
    publishedAt: "Update to current date",
    image: "/images/products/iphone-15-pro-max-hero.jpg",
    author: "Trends Today Editorial"
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
    count: article.frontmatter.count || "Tested",
    icon: article.frontmatter.icon || "📱"
  }));

  return (
    <main className="min-h-screen bg-white" style={{ fontFamily: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
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
                  <div className="relative aspect-[16/10] rounded-sm overflow-hidden" style={{ backgroundImage: `url(${heroArticle.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                    <ImageWithFallback src={heroArticle.image} alt={heroArticle.title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center hidden">
                      <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center">
                        <span className="text-5xl opacity-60">📱</span>
                      </div>
                    </div>
                    {/* TechRadar-style Category Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wide">
                        {heroArticle.category}
                      </span>
                    </div>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Article info overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h1 className="text-xl lg:text-2xl font-bold mb-2 leading-tight group-hover:text-blue-200 transition-colors">
                        {heroArticle.title}
                      </h1>
                      <div className="flex items-center gap-3 text-sm opacity-90">
                        <span>{heroArticle.author}</span>
                        <span>•</span>
                        <span>{new Date(heroArticle.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </div>

            {/* Secondary Featured Articles - TechRadar Grid Style */}
            <div className="lg:col-span-2 grid grid-cols-1 gap-4">
              {featuredArticles.slice(0, 2).map((article, index) => (
                <Link key={index} href={article.href}>
                  <article className="group cursor-pointer flex gap-4 p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-24 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center hidden">
                        <span className="text-lg opacity-60">📱</span>
                      </div>
                      <div className="absolute top-1 left-1">
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs font-bold uppercase">
                          {article.category.substring(0, 3)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-900 line-clamp-2 mb-2">
                        {article.description}
                      </p>
                      <div className="text-xs text-gray-900">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TechRadar-style Navigation Bar */}
      <section className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-6">
              {[
                { name: "REVIEWS", href: "/reviews", active: false },
                { name: "BUYING GUIDES", href: "/best", active: false },
                { name: "NEWS", href: "/news", active: true },
                { name: "VERSUS", href: "/compare", active: false },
                { name: "HOW TO", href: "/guides", active: false }
              ].map((nav) => (
                <Link key={nav.name} href={nav.href}>
                  <span className={`text-sm font-bold uppercase tracking-wide hover:text-blue-300 transition-colors ${nav.active ? 'text-blue-300 border-b-2 border-blue-300 pb-3' : ''}`}>
                    {nav.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-xs text-gray-300">TRENDING:</span>
              <Link href="/news/iphone-16-leak" className="text-xs text-blue-300 hover:underline">iPhone 16 Pro</Link>
              <Link href="/news/galaxy-s25" className="text-xs text-blue-300 hover:underline">Galaxy S25</Link>
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
                      <article className="group cursor-pointer bg-white border border-gray-200 hover:shadow-lg transition-all duration-200">
                        <div className="relative aspect-[16/10] rounded-sm overflow-hidden" style={{ backgroundImage: `url(${article.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                          <ImageWithFallback src={article.image} alt={article.title} fill sizes="(max-width: 1280px) 100vw, 33vw" className="object-cover" loading="lazy" />
                          <div className="absolute inset-0 flex items-center justify-center hidden">
                            <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center hidden">
                              <span className="text-2xl opacity-60">📱</span>
                            </div>
                          </div>
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold uppercase">
                              {article.category}
                            </span>
                          </div>
                          {/* TechRadar-style rating badge */}
                          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400 text-sm">★</span>
                              <span className="text-xs font-bold">4.5</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-lg">
                            {article.title}
                          </h3>
                          <p className="text-gray-900 text-sm line-clamp-2 mb-3">
                            {article.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-900">
                            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            <span className="font-bold uppercase tracking-wide">Read Review</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Breaking News Strip */}
              <div className="mb-8">
                <div className="bg-red-600 text-white p-4 rounded-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-bold uppercase text-sm bg-white text-red-600 px-2 py-1 rounded">Breaking</span>
                    <span className="font-bold">Apple Vision Pro 2 confirmed for Q4 2025 with major price reduction</span>
                    <Link href="/news/vision-pro-2" className="ml-auto text-sm underline hover:no-underline">Read More</Link>
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
                          <div className="text-xs text-gray-900">
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
                          <span className="text-2xl">{guide.icon}</span>
                          <div>
                            <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                              {guide.title}
                            </h3>
                            <p className="text-xs text-gray-900">{guide.count}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Newsletter Signup - TechRadar Style */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 text-center">
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Stay Updated</h3>
                  <p className="text-sm mb-4 opacity-90">Get the latest tech reviews and news delivered to your inbox</p>
                  <div className="space-y-2">
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 text-gray-900 text-sm rounded"
                    />
                    <button className="w-full bg-white text-purple-600 font-bold py-2 px-4 rounded text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors">
                      Subscribe
                    </button>
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
                    {["iPhone 16 Pro", "Galaxy S25", "Pixel 9", "Vision Pro 2", "MacBook Air", "Tesla Phone"].map((tag) => (
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

      {/* Trust & Authority Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Millions Trust Trends Today
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto mb-8">
              Our expert team of technology professionals brings decades of combined experience 
              from companies like Apple, Samsung, Google, and leading tech publications.
            </p>
          </div>
          
          <TrustBadges variant="horizontal" showAll={true} />
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">25+</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Years Combined Experience</div>
              <div className="text-sm text-gray-800">Former engineers from Apple, Samsung, Google</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Products Reviewed</div>
              <div className="text-sm text-gray-800">Rigorous testing with professional equipment</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Editorial Independence</div>
              <div className="text-sm text-gray-800">No manufacturer influence on our reviews</div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/authors"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Meet Our Expert Team
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Newsletter Section - TechRadar Style */}
      <section className="py-12 bg-slate-900 text-white">
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
          <p className="text-xs text-gray-900 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </main>
  );
}
