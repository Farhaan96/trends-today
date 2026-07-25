import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  fetchGa4Report,
  fetchSearchConsoleReport,
  getCompleteDateRange,
  getGoogleReportingConfig,
  getGoogleReportingSnapshot,
  hasValidReportingToken,
  resetGoogleReportingCacheForTests,
} from '../src/lib/google-reporting.mjs';

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return data;
    },
  };
}

test('builds a 28-day window from complete Vancouver days', () => {
  assert.deepEqual(
    getCompleteDateRange(Date.parse('2026-07-25T05:00:00.000Z')),
    {
      startDate: '2026-06-26',
      endDate: '2026-07-23',
      days: 28,
      timeZone: 'America/Vancouver',
      completeness: 'complete-local-days',
      endOffsetDays: 1,
    }
  );
});

test('lags the Search Console window to finalized data', () => {
  assert.deepEqual(
    getCompleteDateRange(
      Date.parse('2026-07-25T05:00:00.000Z'),
      28,
      'America/Vancouver',
      3
    ),
    {
      startDate: '2026-06-24',
      endDate: '2026-07-21',
      days: 28,
      timeZone: 'America/Vancouver',
      completeness: 'complete-local-days',
      endOffsetDays: 3,
    }
  );
});

test('requires shared credentials for provider configuration', () => {
  const config = getGoogleReportingConfig({
    GOOGLE_ANALYTICS_PROPERTY_ID: '547027376',
    GOOGLE_SEARCH_CONSOLE_SITE_URL: 'https://www.trendstoday.ca/',
  });

  assert.equal(config.analyticsConfigured, false);
  assert.equal(config.searchConsoleConfigured, false);
});

test('maps GA4 totals and top pages without summing unique users', async () => {
  const report = await fetchGa4Report({
    accessToken: 'test-token',
    analyticsPropertyId: '547027376',
    dateRange: { startDate: '2026-06-26', endDate: '2026-07-23' },
    fetchImpl: async () =>
      jsonResponse({
        reports: [
          {
            rows: [
              {
                metricValues: [
                  { value: '12' },
                  { value: '18' },
                  { value: '31' },
                ],
              },
            ],
          },
          {
            rows: [
              {
                dimensionValues: [{ value: '/local-news/example' }],
                metricValues: [{ value: '9' }, { value: '7' }],
              },
            ],
          },
        ],
      }),
  });

  assert.deepEqual(report.totals, {
    activeUsers: 12,
    sessions: 18,
    pageViews: 31,
  });
  assert.deepEqual(report.topPages[0], {
    path: '/local-news/example',
    pageViews: 9,
    sessions: 7,
  });
});

test('maps Search Console totals separately from page rows', async () => {
  const report = await fetchSearchConsoleReport({
    accessToken: 'test-token',
    searchConsoleSiteUrl: 'https://www.trendstoday.ca/',
    dateRange: { startDate: '2026-06-26', endDate: '2026-07-23' },
    fetchImpl: async (_url, options) => {
      const body = JSON.parse(options.body);
      if (body.dimensions) {
        return jsonResponse({
          rows: [
            {
              keys: ['https://www.trendstoday.ca/local-news/example'],
              clicks: 3,
              impressions: 20,
              ctr: 0.15,
              position: 6.4,
            },
          ],
        });
      }
      return jsonResponse({
        rows: [
          {
            clicks: 5,
            impressions: 42,
            ctr: 5 / 42,
            position: 8.2,
          },
        ],
      });
    },
  });

  assert.deepEqual(report.totals, {
    clicks: 5,
    impressions: 42,
    ctr: 5 / 42,
    position: 8.2,
  });
  assert.equal(report.topPages[0].clicks, 3);
});

test('keeps a failed provider unavailable while returning verified data', async () => {
  resetGoogleReportingCacheForTests();
  const env = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: 'reader@example.iam.gserviceaccount.com',
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: 'unused-in-test',
    GOOGLE_ANALYTICS_PROPERTY_ID: '547027376',
    GOOGLE_SEARCH_CONSOLE_SITE_URL: 'https://www.trendstoday.ca/',
  };
  const snapshot = await getGoogleReportingSnapshot({
    env,
    now: Date.parse('2026-07-25T05:00:00.000Z'),
    bypassCache: true,
    accessTokenProvider: async () => 'test-token',
    fetchImpl: async (url) => {
      if (url.includes('analyticsdata.googleapis.com')) {
        return jsonResponse({
          reports: [
            {
              rows: [
                {
                  metricValues: [
                    { value: '1' },
                    { value: '2' },
                    { value: '3' },
                  ],
                },
              ],
            },
            { rows: [] },
          ],
        });
      }
      return jsonResponse({}, 403);
    },
  });

  assert.equal(snapshot.status, 'partial');
  assert.equal(snapshot.googleAnalytics.status, 'available');
  assert.equal(snapshot.googleSearchConsole.status, 'unavailable');
  assert.equal(snapshot.googleSearchConsole.totals, null);
  assert.equal(
    snapshot.windows.googleSearchConsole.completeness,
    'final-data-lag-adjusted'
  );
});

test('uses constant-time bearer token validation semantics', () => {
  const request = new Request('https://example.com', {
    headers: { authorization: 'Bearer correct-token' },
  });

  assert.equal(hasValidReportingToken(request, 'correct-token'), true);
  assert.equal(hasValidReportingToken(request, 'correct-token\n'), true);
  assert.equal(hasValidReportingToken(request, 'wrong-token'), false);
});
