# 🔑 API Setup Guide - Trends Today

This guide explains how to configure API keys for the Trends Today agent system.

## 🛡️ Security First

Your API keys are stored in `.env.local` which is:
- ✅ **Excluded from Git** - Never committed to version control
- ✅ **Local only** - Stays on your machine
- ✅ **Environment isolated** - Separate from your code

## 🚀 Quick Start (Priority APIs)

For immediate functionality, set these 4 key APIs in `.env.local`:

### 1. Perplexity AI (Most Important)
```bash
PERPLEXITY_API_KEY=pplx-your-api-key-here
```
- **Get it**: https://www.perplexity.ai/settings/api
- **Cost**: ~$0.50-2.00 per 1000 searches
- **Purpose**: Real-time web research, trend analysis, content intelligence

### 2. Firecrawl (Essential for Web Scraping)
```bash
FIRECRAWL_API_KEY=fc-your-api-key-here
```
- **Get it**: https://www.firecrawl.dev/
- **Cost**: ~$0.25 per page scraped
- **Purpose**: Advanced web scraping, newsroom monitoring

### 3. Unsplash (Professional Images)
```bash
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
```
- **Get it**: https://unsplash.com/developers
- **Cost**: Free (50 requests/hour)
- **Purpose**: High-quality images for articles

### 4. DataForSEO (Keyword Research)
```bash
DATAFORSEO_LOGIN=your-login
DATAFORSEO_PASSWORD=your-password
```
- **Get it**: https://dataforseo.com/
- **Cost**: ~$0.001 per keyword check
- **Purpose**: SEO keyword research and competition analysis

## 🧪 Test Your Setup

After adding API keys, test the agents:

```bash
# Test discovery with real APIs
npm run agents:discovery

# Test content creation
npm run agents:content

# Full batch test (generates 5 articles)
npm run agents:batch
```

## 📊 Expected Performance

With all APIs configured:

### Content Quality Improvements:
- **Research depth**: 10x better with Perplexity real-time data
- **SEO optimization**: Precise keyword targeting vs guesswork
- **Visual appeal**: Professional images vs generic stock photos
- **Trend accuracy**: Real-time trending topics vs stale RSS feeds

### Cost Per Article (Estimated):
- **Perplexity**: $0.10-0.50 for research
- **Firecrawl**: $0.05-0.15 for web scraping  
- **DataForSEO**: $0.01-0.05 for keyword research
- **Unsplash**: Free
- **Total**: ~$0.16-0.70 per premium article

### ROI Calculation:
- **Cost**: $0.50 per article average
- **Target**: 30 visitors per article × 15 articles/day = 450 daily visitors
- **Monthly**: 13,500 visitors for ~$225 in API costs
- **Cost per visitor**: ~$0.017 (extremely cost-effective)

## 🔄 Fallback System

Without API keys, agents run in **demo mode**:
- ✅ Still generates content (but lower quality)
- ✅ Uses cached templates and sample data
- ✅ Perfect for testing the system
- ❌ No real-time data or trend analysis
- ❌ Generic stock images only
- ❌ Limited SEO optimization

## 🛠️ Advanced Configuration

### Optional APIs (Enhanced Features):

#### News & Social Media:
```bash
NEWS_API_KEY=your-newsapi-key          # Breaking news alerts
REDDIT_CLIENT_ID=your-reddit-id        # Reddit trend analysis
```

#### Alternative Services:
```bash
OPENAI_API_KEY=sk-your-openai-key      # Backup for Perplexity
SCRAPINGBEE_API_KEY=your-key          # Backup for Firecrawl
PEXELS_API_KEY=your-pexels-key        # Alternative to Unsplash
```

#### Analytics & Monitoring:
```bash
GA_MEASUREMENT_ID=G-XXXXXXXXXX        # Google Analytics
GOOGLE_SEARCH_CONSOLE_KEY=your-key    # Search performance data
```

## 📈 Optimization Settings

Fine-tune API usage in `.env.local`:

```bash
# Rate Limiting
API_TIMEOUT_MS=30000              # 30-second timeouts
MAX_DAILY_API_CALLS=300           # Budget control
CACHE_TTL_HOURS=1                 # Cache research data

# Batch Settings  
MAX_ARTICLES_PER_BATCH=5          # Articles per batch run
BATCH_EXECUTION_LIMIT=90          # 90 minutes max per batch
CONTENT_QUALITY_THRESHOLD=85      # Minimum quality score

# Operating Modes
AGENT_MODE=production             # production, development, demo
ENABLE_CACHING=true               # Save API calls
ENABLE_FALLBACKS=true             # Graceful degradation
```

## 🚨 Troubleshooting

### Common Issues:

1. **"API key not configured"** - Check `.env.local` file exists
2. **"Rate limit exceeded"** - Increase delays in agent configs
3. **"Timeout errors"** - Increase `API_TIMEOUT_MS` setting
4. **"Demo mode active"** - API keys not loaded, restart agents

### Debug Commands:
```bash
# Check environment loading
node -e "console.log(process.env.PERPLEXITY_API_KEY)"

# Test individual agents
npm run agent:news      # Test news scanner
npm run agent:seo       # Test SEO finder
npm run agent:content   # Test content creator
```

## 💡 Best Practices

1. **Start small** - Add Perplexity first, then expand
2. **Monitor costs** - Set billing alerts on API accounts  
3. **Use caching** - Enable `ENABLE_CACHING=true` to reduce API calls
4. **Batch operations** - Run 3 batches daily vs continuous generation
5. **Quality over quantity** - Better 5 great articles than 20 mediocre ones

## 🔐 Security Checklist

- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit API keys to Git
- ✅ Use environment variables only
- ✅ Set up billing alerts on API accounts
- ✅ Rotate keys periodically for security
- ✅ Use separate keys for development/production

---

**Ready to supercharge your content creation?** Add your API keys to `.env.local` and watch the agents create premium, engaging content that drives real traffic! 🚀