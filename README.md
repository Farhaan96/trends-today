# Trends Today - AI-Automated Tech Blog

A lean, reliable AI-automated blog system that publishes 15 high-quality tech articles daily with accurate images, clean minimalist UI, solid SEO, and ad monetization.

<!-- Force Vercel rebuild: 2025-09-11 22:53 -->

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- API Keys (see `.env.example`)

### Setup

1. **Clone and install dependencies:**

```bash
# Install Node dependencies
cd apps/web
npm install
cd ../..

# Install Python dependencies
pip install requests python-dotenv
```

2. **Configure environment:**

```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

3. **Run the web app:**

```bash
cd apps/web
npm run dev
# Visit http://localhost:3000
```

4. **Generate content:**

```bash
# Test run (dry mode - no publishing)
python apps/pipeline/runner.py --limit 3 --dry-run

# Publish articles
python apps/pipeline/runner.py --limit 3 --publish
```

## 📁 Project Structure

```
/apps
  /web          → Next.js blog frontend (minimalist UI)
  /pipeline     → Python content generation pipeline
    - topics.py      → Discover trending topics
    - retrieve.py    → Fetch source content
    - draft.py       → Generate articles with AI
    - qa.py          → Quality assurance pass
    - image.py       → Find and download images
    - seo.py         → SEO optimization
    - publish.py     → Write MDX files
    - runner.py      → Main orchestrator

/packages
  /shared       → Shared types and utilities
```

## 🔑 API Configuration

### Required APIs (Priority Order)

1. **Content Generation** (pick one primary):
   - Claude (Anthropic) - Recommended
   - OpenAI GPT
   - Google Gemini

2. **Research & Sources**:
   - Perplexity AI - Real-time web search
   - Firecrawl - Web scraping (optional)
   - Google Search API (optional)

3. **Images**:
   - Unsplash - Primary image source
   - Pexels - Fallback source

## 🤖 Daily Publishing Schedule

The system publishes 15 articles/day in 3 batches:

```bash
# Morning Batch (9 AM) - 5 articles
python apps/pipeline/runner.py --limit 5 --publish

# Midday Batch (1 PM) - 5 articles
python apps/pipeline/runner.py --limit 5 --publish

# Evening Batch (5 PM) - 5 articles
python apps/pipeline/runner.py --limit 5 --publish
```

### Cron Setup

```cron
0 9 * * * cd /path/to/blog && python apps/pipeline/runner.py --limit 5 --publish
0 13 * * * cd /path/to/blog && python apps/pipeline/runner.py --limit 5 --publish
0 17 * * * cd /path/to/blog && python apps/pipeline/runner.py --limit 5 --publish
```

### GitHub Actions (Alternative)

```yaml
name: Publish Articles
on:
  schedule:
    - cron: '0 9,13,17 * * *'
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install requests python-dotenv
      - run: python apps/pipeline/runner.py --limit 5 --publish
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          UNSPLASH_ACCESS_KEY: ${{ secrets.UNSPLASH_ACCESS_KEY }}
          # Add other API keys...
```

## 🎨 Features

### Minimalist UI

- Clean, leravi.org-inspired design
- Fast page loads (<2s)
- Mobile-responsive
- Card-based article grid
- Category navigation

### SEO Optimized

- Meta tags & OpenGraph
- JSON-LD structured data
- Sitemap generation
- Clean URLs
- Image alt text

### Content Quality

- 600-900 word articles
- 2-4 H2 sections
- Engaging introductions
- Source attribution
- Related articles

### Monetization

- AdSense placeholders
- Strategic ad placement
- Non-intrusive design

## 📊 Monitoring

Check pipeline logs:

```bash
tail -f pipeline.log
```

View generation stats:

```bash
ls reports/pipeline_*.json
```

## 🔧 Customization

### Add New Categories

Edit `apps/web/components/Header.tsx`:

```typescript
const categories = [
  { name: 'Your Category', href: '/category/your-category' },
  // ...
];
```

### Change Publishing Frequency

Edit `.env.local`:

```env
POSTS_PER_DAY=20
ACTIVE_HOURS=06-23
BATCH_SIZE=7
```

### Switch to WordPress

Implement `apps/pipeline/publishers/wordpress_api/publisher.py`:

```python
class WordPressPublisher(PublisherAdapter):
    def publish(self, article, seo, image):
        # Implement WordPress REST API
        pass
```

Then update runner.py to use WordPress adapter.

## 🚦 Quality Gates

The pipeline ensures quality through:

1. **Topic deduplication** - No repeated content
2. **Source verification** - Multiple sources per topic
3. **QA pass** - Grammar, tone, fact-checking
4. **SEO validation** - Meta tags, slug optimization
5. **Image attribution** - Proper licensing

## 📈 Performance Targets

- **Traffic Goal**: 30K monthly visitors
- **Articles**: 15/day → 450/month
- **Avg. Engagement**: 60% time on page
- **Page Speed**: <2s load time
- **SEO**: 50% page 1 rankings

## 🐛 Troubleshooting

### No topics found

- Check Perplexity/Google API keys
- Verify internet connection
- Check `pipeline.log` for errors

### Images not loading

- Verify Unsplash/Pexels API keys
- Check image directory permissions
- Ensure Next.js image domains configured

### Articles not publishing

- Check MDX directory exists
- Verify write permissions
- Review `pipeline.log` for errors

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

---

Built with ❤️ for high-quality, automated content generation.
