# Editorial learning ledger

Daily runs write the publication or skip outcome here. Weekly reviews join article-level exports to the release metadata and record one `keep`, `repair`, or `stop` decision.

Accepted analytics input uses this provider-neutral shape:

```json
{
  "status": "available",
  "sources": ["google-search-console", "ga4"],
  "articles": [
    {
      "path": "/technology/example",
      "slug": "example",
      "beat": "software-update-utility",
      "category": "technology",
      "publishedAt": "2026-07-15T07:45:00-07:00",
      "impressions": 120,
      "clicks": 9,
      "engagedSessions": 14,
      "returningSessions": null,
      "appCtaClicks": null,
      "revenue": null,
      "contentCost": null
    }
  ]
}
```

Missing fields stay `null` or absent. They are never converted to zero. Search Console supplies impressions and clicks; GA4 or another analytics source supplies engaged and returning sessions. Vercel Web Analytics confirms page traffic but is not treated as a substitute for unavailable search or engagement fields.
