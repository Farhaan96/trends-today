import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  fetchGa4PagePeriods,
  fetchGa4Report,
  fetchSearchConsolePagePeriods,
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

test('aggregates GA4 page rows into day-7 and day-28 article periods', async () => {
  const ranges = {
    day7: getCompleteDateRange(Date.parse('2026-07-25T05:00:00.000Z'), 7),
    day28: getCompleteDateRange(Date.parse('2026-07-25T05:00:00.000Z'), 28),
  };
  let requestBody = null;
  const periods = await fetchGa4PagePeriods({
    accessToken: 'test-token',
    analyticsPropertyId: '547027376',
    ranges,
    fetchImpl: async (url, options) => {
      requestBody = JSON.parse(options.body);
      return jsonResponse({
        reports: [
          {
            rows: [
              {
                dimensionValues: [{ value: '/local-news/a' }, { value: 'new' }],
                metricValues: [{ value: '2' }, { value: '2' }, { value: '1' }],
              },
            ],
          },
          {
            rows: [
              {
                dimensionValues: [{ value: '/local-news/a' }, { value: 'new' }],
                metricValues: [{ value: '4' }, { value: '3' }, { value: '2' }],
              },
              {
                dimensionValues: [
                  { value: '/local-news/a' },
                  { value: 'returning' },
                ],
                metricValues: [{ value: '10' }, { value: '8' }, { value: '6' }],
              },
            ],
          },
        ],
      });
    },
  });

  assert.equal(requestBody.requests.length, 2);
  assert.deepEqual(periods.day28.window, ranges.day28);
  assert.deepEqual(periods.day28.pages, [
    {
      path: '/local-news/a',
      pageViews: 14,
      sessions: 11,
      engagedSessions: 8,
      returningSessions: 8,
    },
  ]);
  assert.equal(periods.day7.pages[0].returningSessions, null);
  assert.equal(periods.day7.pages[0].sessions, 2);
});

test('reads Search Console page rows for both decision windows', async () => {
  const ranges = {
    day7: getCompleteDateRange(
      Date.parse('2026-07-25T05:00:00.000Z'),
      7,
      'America/Vancouver',
      3
    ),
    day28: getCompleteDateRange(
      Date.parse('2026-07-25T05:00:00.000Z'),
      28,
      'America/Vancouver',
      3
    ),
  };
  const bodies = [];
  const periods = await fetchSearchConsolePagePeriods({
    accessToken: 'test-token',
    searchConsoleSiteUrl: 'https://www.trendstoday.ca/',
    ranges,
    fetchImpl: async (url, options) => {
      bodies.push(JSON.parse(options.body));
      return jsonResponse({
        rows: [
          {
            keys: ['https://www.trendstoday.ca/local-news/a'],
            clicks: 3,
            impressions: 120,
            ctr: 0.025,
            position: 14.2,
          },
        ],
      });
    },
  });

  assert.equal(bodies.length, 2);
  assert.equal(bodies[0].startDate, ranges.day7.startDate);
  assert.deepEqual(periods.day28.pages[0], {
    url: 'https://www.trendstoday.ca/local-news/a',
    clicks: 3,
    impressions: 120,
    ctr: 0.025,
    position: 14.2,
  });
});

test('an unreported page click-through rate stays null, never zero', async () => {
  const ranges = {
    day7: getCompleteDateRange(Date.parse('2026-07-25T05:00:00.000Z'), 7),
    day28: getCompleteDateRange(Date.parse('2026-07-25T05:00:00.000Z'), 28),
  };
  const periods = await fetchSearchConsolePagePeriods({
    accessToken: 'test-token',
    searchConsoleSiteUrl: 'https://www.trendstoday.ca/',
    ranges,
    fetchImpl: async () =>
      jsonResponse({
        rows: [
          {
            keys: ['https://www.trendstoday.ca/local-news/a'],
            clicks: 3,
            impressions: 120,
          },
        ],
      }),
  });

  assert.equal(periods.day28.pages[0].ctr, null);
  assert.equal(periods.day28.pages[0].position, null);
});

test('exposes article periods and keeps an unavailable provider null', async () => {
  resetGoogleReportingCacheForTests();
  const snapshot = await getGoogleReportingSnapshot({
    env: {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: 'reader@example.iam.gserviceaccount.com',
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: 'unused-in-test',
      GOOGLE_ANALYTICS_PROPERTY_ID: '547027376',
      GOOGLE_SEARCH_CONSOLE_SITE_URL: 'https://www.trendstoday.ca/',
    },
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
            { rows: [] },
            { rows: [] },
          ],
        });
      }
      return jsonResponse({}, 403);
    },
  });

  assert.equal(snapshot.periods.day28.googleAnalytics.window.days, 28);
  assert.deepEqual(snapshot.periods.day7.googleAnalytics.pages, []);
  assert.equal(snapshot.periods.day28.googleSearchConsole, null);
  assert.equal(snapshot.googleAnalytics.status, 'available');
});

test('omits article periods entirely when no provider is configured', async () => {
  resetGoogleReportingCacheForTests();
  const snapshot = await getGoogleReportingSnapshot({
    env: {},
    now: Date.parse('2026-07-25T05:00:00.000Z'),
    bypassCache: true,
    fetchImpl: async () => {
      throw new Error('no provider should be contacted');
    },
  });

  assert.equal(snapshot.status, 'unavailable');
  assert.equal(snapshot.periods.day7.googleAnalytics, null);
  assert.equal(snapshot.periods.day28.googleSearchConsole, null);
});

test('uses constant-time bearer token validation semantics', () => {
  const request = new Request('https://example.com', {
    headers: { authorization: 'Bearer correct-token' },
  });

  assert.equal(hasValidReportingToken(request, 'correct-token'), true);
  assert.equal(hasValidReportingToken(request, 'correct-token\n'), true);
  assert.equal(hasValidReportingToken(request, 'wrong-token'), false);
});
