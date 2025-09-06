import Link from 'next/link';

export default function HomePage() {
  const heroArticle = {
    title: "iPhone 15 Pro Max Review: Apple's Most Advanced Phone Yet",
    description: "After two weeks of testing, we dive deep into Apple's flagship to see if the titanium design, A17 Pro chip, and 5x zoom camera justify the premium price tag.",
    href: "/reviews/iphone-15-pro-max-review",
    category: "Reviews",
    publishedAt: "2025-01-15",
    image: "/images/iphone-15-pro-hero.jpg",
    author: "Trends Today Editorial"
  };

  const featuredArticles = [
    {
      title: "Samsung Galaxy S24 Ultra Review: Android Excellence",
      description: "Samsung's latest flagship brings incredible camera capabilities and S Pen productivity to challenge the iPhone 15 Pro Max.",
      href: "/reviews/samsung-galaxy-s24-ultra-review", 
      category: "Reviews",
      publishedAt: "2025-01-14",
      image: "/images/galaxy-s24-ultra.jpg"
    },
    {
      title: "iPhone 15 Pro vs Galaxy S24: Ultimate Flagship Battle", 
      description: "We compare Apple and Samsung's flagship phones across camera, performance, battery, and value.",
      href: "/compare/iphone-15-pro-vs-samsung-galaxy-s24",
      category: "Comparisons", 
      publishedAt: "2025-01-13",
      image: "/images/iphone-vs-samsung.jpg"
    },
    {
      title: "Google Pixel 8 Pro Review: AI Photography Perfected",
      description: "Google's computational photography reaches new heights with the Pixel 8 Pro's advanced AI features.",
      href: "/reviews/google-pixel-8-pro-review",
      category: "Reviews",
      publishedAt: "2025-01-12", 
      image: "/images/pixel-8-pro.jpg"
    },
    {
      title: "OnePlus 12 Review: Speed Demon Returns",
      description: "OnePlus is back with blazing fast charging, flagship performance, and competitive pricing.",
      href: "/reviews/oneplus-12-review",
      category: "Reviews", 
      publishedAt: "2025-01-11",
      image: "/images/oneplus-12.jpg"
    }
  ];

  const newsArticles = [
    {
      title: "Apple Vision Pro 2 Development Confirmed for Late 2025",
      description: "Sources confirm Apple is working on a lighter, cheaper second-generation Vision Pro with improved displays.",
      href: "/news/apple-vision-pro-2-development",
      publishedAt: "2025-01-15",
      category: "Breaking"
    },
    {
      title: "Samsung Galaxy S25 Series Launch Date Leaked",
      description: "Reliable leakers suggest Samsung will unveil the Galaxy S25 lineup in February with major AI upgrades.",
      href: "/news/galaxy-s25-launch-date",
      publishedAt: "2025-01-14", 
      category: "News"
    },
    {
      title: "Google Pixel 9 Pro Design Revealed in Leaked Renders",
      description: "New leaked renders show a redesigned camera bar and refined design language for Google's next flagship.",
      href: "/news/pixel-9-pro-design-leak",
      publishedAt: "2025-01-13",
      category: "Leaks"
    }
  ];

  const bestGuides = [
    { 
      title: "Best Smartphones 2025", 
      href: "/best/smartphones/2025", 
      count: "12 tested",
      icon: "📱"
    },
    { 
      title: "Best Laptops 2025", 
      href: "/best/laptops/2025", 
      count: "8 tested", 
      icon: "💻"
    },
    { 
      title: "Best Headphones 2025", 
      href: "/best/headphones/2025", 
      count: "15 tested",
      icon: "🎧"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section - TechRadar Style */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Hero Article */}
            <div className="lg:col-span-2">
              <Link href={heroArticle.href}>
                <article className="group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-4xl">📱</span>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded">
                        {heroArticle.category}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {heroArticle.title}
                    </h1>
                    <p className="text-gray-600 leading-relaxed">
                      {heroArticle.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {heroArticle.author}</span>
                      <span>•</span>
                      <span>{new Date(heroArticle.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              </Link>
            </div>

            {/* Sidebar - Latest News */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Latest News
                </h2>
                <div className="space-y-4">
                  {newsArticles.map((article, index) => (
                    <Link key={index} href={article.href}>
                      <article className="group cursor-pointer pb-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {article.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {article.description}
                        </p>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Best Of Guides */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Best Of 2025
                </h2>
                <div className="space-y-3">
                  {bestGuides.map((guide, index) => (
                    <Link key={index} href={guide.href}>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
                        <span className="text-2xl">{guide.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {guide.title}
                          </h3>
                          <p className="text-sm text-gray-500">{guide.count}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reviews Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Reviews</h2>
            <Link href="/reviews" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              All Reviews →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredArticles.map((article, index) => (
              <Link key={index} href={article.href}>
                <article className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📱</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {article.description}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      <section className="py-8 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Reviews", href: "/reviews", icon: "⭐", color: "bg-red-50 text-red-600" },
              { name: "Comparisons", href: "/compare", icon: "⚖️", color: "bg-blue-50 text-blue-600" },
              { name: "Buying Guides", href: "/best", icon: "🛒", color: "bg-green-50 text-green-600" },
              { name: "News", href: "/news", icon: "📰", color: "bg-purple-50 text-purple-600" }
            ].map((category) => (
              <Link key={category.name} href={category.href}>
                <div className={`${category.color} rounded-lg p-4 text-center hover:shadow-sm transition-shadow cursor-pointer`}>
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}