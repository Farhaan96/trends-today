# Google reporting

Trends Today reads GA4 and Search Console data through a single Google service
account. Reporting access is read-only and the returned window uses the most
recent 28 complete days in `America/Vancouver`.

## Google configuration

1. Enable the Google Analytics Data API and Search Console API in the service
   account's Google Cloud project.
2. Add the service account email as a Viewer on GA4 property `547027376`.
3. Add the same email as a restricted user on the Search Console property
   `https://www.trendstoday.ca/`.
4. Configure these production environment variables:
   - `GOOGLE_ANALYTICS_PROPERTY_ID`
   - `GOOGLE_SEARCH_CONSOLE_SITE_URL`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `ANALYTICS_REPORTING_TOKEN`

Keep the private key and reporting token server-only. Do not prefix either with
`NEXT_PUBLIC_`.

## Reading the report

Request the protected endpoint with:

```text
GET /api/analytics/reporting
Authorization: Bearer <ANALYTICS_REPORTING_TOKEN>
```

The response contains:

- GA4 active users, sessions, page views, and top pages;
- Search Console clicks, impressions, click-through rate, average position,
  and top pages;
- a provider status of `available`, `partial`, or `unavailable`;
- `null` or omitted values for unavailable metrics, never fabricated zeros.

The server caches successful and partial snapshots for ten minutes. Provider
requests time out independently, so a Search Console failure does not erase a
valid GA4 result.
