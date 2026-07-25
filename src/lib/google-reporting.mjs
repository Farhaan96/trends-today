import { createPrivateKey, sign, timingSafeEqual } from 'node:crypto';

const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const SEARCH_CONSOLE_SCOPE =
  'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REPORTING_CACHE_MS = 10 * 60 * 1000;
const UNAVAILABLE_CACHE_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 8_000;

let cachedAccessToken = null;
let cachedSnapshot = null;

class GoogleReportingError extends Error {
  constructor(provider, reason, status = null) {
    super(`${provider}:${reason}`);
    this.name = 'GoogleReportingError';
    this.provider = provider;
    this.reason = reason;
    this.status = status;
  }
}

function configured(value) {
  return Boolean(value?.trim());
}

function normalizedPrivateKey(value) {
  return value?.replace(/\\n/g, '\n').trim() || '';
}

export function getGoogleReportingConfig(env = process.env) {
  const serviceAccountEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() || '';
  const serviceAccountPrivateKey = normalizedPrivateKey(
    env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );
  const analyticsPropertyId = env.GOOGLE_ANALYTICS_PROPERTY_ID?.trim() || '';
  const searchConsoleSiteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() || '';

  const sharedCredentialsConfigured =
    configured(serviceAccountEmail) && configured(serviceAccountPrivateKey);

  return {
    serviceAccountEmail,
    serviceAccountPrivateKey,
    analyticsPropertyId,
    searchConsoleSiteUrl,
    analyticsConfigured:
      sharedCredentialsConfigured && configured(analyticsPropertyId),
    searchConsoleConfigured:
      sharedCredentialsConfigured && configured(searchConsoleSiteUrl),
  };
}

export function getCompleteDateRange(
  now = Date.now(),
  days = 28,
  timeZone = 'America/Vancouver',
  endOffsetDays = 1
) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(now));
  const value = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );
  const localTodayUtc = Date.UTC(
    Number(value.year),
    Number(value.month) - 1,
    Number(value.day)
  );
  const endDate = new Date(localTodayUtc - endOffsetDays * 24 * 60 * 60 * 1000);
  const startDate = new Date(
    endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000
  );

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    days,
    timeZone,
    completeness: 'complete-local-days',
    endOffsetDays,
  };
}

function base64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/g, '');
}

export function createServiceAccountAssertion(config, now = Date.now()) {
  const issuedAt = Math.floor(now / 1000);
  const header = base64Url(
    JSON.stringify({
      alg: 'RS256',
      typ: 'JWT',
    })
  );
  const claims = base64Url(
    JSON.stringify({
      iss: config.serviceAccountEmail,
      scope: `${GA4_SCOPE} ${SEARCH_CONSOLE_SCOPE}`,
      aud: TOKEN_URL,
      iat: issuedAt,
      exp: issuedAt + 3600,
    })
  );
  const unsignedAssertion = `${header}.${claims}`;
  const signature = sign(
    'RSA-SHA256',
    Buffer.from(unsignedAssertion),
    createPrivateKey(config.serviceAccountPrivateKey)
  );

  return `${unsignedAssertion}.${base64Url(signature)}`;
}

async function fetchJson(
  url,
  options,
  { fetchImpl, provider, timeoutMs = REQUEST_TIMEOUT_MS }
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new GoogleReportingError(
        provider,
        `http_${response.status}`,
        response.status
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof GoogleReportingError) throw error;
    if (error?.name === 'AbortError') {
      throw new GoogleReportingError(provider, 'timeout');
    }
    throw new GoogleReportingError(provider, 'request_failed');
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken(config, fetchImpl, now) {
  const cacheKey = config.serviceAccountEmail;
  if (
    cachedAccessToken?.cacheKey === cacheKey &&
    cachedAccessToken.expiresAt > now + 60_000
  ) {
    return cachedAccessToken.value;
  }

  let assertion;
  try {
    assertion = createServiceAccountAssertion(config, now);
  } catch {
    throw new GoogleReportingError('authentication', 'invalid_private_key');
  }

  const token = await fetchJson(
    TOKEN_URL,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    },
    { fetchImpl, provider: 'authentication' }
  );

  if (!configured(token.access_token)) {
    throw new GoogleReportingError('authentication', 'missing_access_token');
  }

  cachedAccessToken = {
    cacheKey,
    value: token.access_token,
    expiresAt: now + Math.max(60, Number(token.expires_in) || 3600) * 1000,
  };
  return token.access_token;
}

function numericValue(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bearerHeaders(accessToken) {
  return {
    authorization: `Bearer ${accessToken}`,
    'content-type': 'application/json',
  };
}

export async function fetchGa4Report({
  accessToken,
  analyticsPropertyId,
  dateRange,
  fetchImpl = fetch,
}) {
  const data = await fetchJson(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(
      analyticsPropertyId
    )}:batchRunReports`,
    {
      method: 'POST',
      headers: bearerHeaders(accessToken),
      body: JSON.stringify({
        requests: [
          {
            dateRanges: [
              {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
              },
            ],
            metrics: [
              { name: 'activeUsers' },
              { name: 'sessions' },
              { name: 'screenPageViews' },
            ],
          },
          {
            dateRanges: [
              {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
              },
            ],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
            orderBys: [
              {
                metric: { metricName: 'screenPageViews' },
                desc: true,
              },
            ],
            limit: '10',
          },
        ],
      }),
    },
    { fetchImpl, provider: 'google_analytics' }
  );

  const totals = data.reports?.[0]?.rows?.[0]?.metricValues || [];
  const topPages = (data.reports?.[1]?.rows || []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || null,
    pageViews: numericValue(row.metricValues?.[0]?.value, 0),
    sessions: numericValue(row.metricValues?.[1]?.value, 0),
  }));

  return {
    status: 'available',
    propertyId: analyticsPropertyId,
    totals: {
      activeUsers: numericValue(totals[0]?.value, 0),
      sessions: numericValue(totals[1]?.value, 0),
      pageViews: numericValue(totals[2]?.value, 0),
    },
    topPages,
  };
}

export async function fetchSearchConsoleReport({
  accessToken,
  searchConsoleSiteUrl,
  dateRange,
  fetchImpl = fetch,
}) {
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    searchConsoleSiteUrl
  )}/searchAnalytics/query`;
  const commonBody = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    type: 'web',
    dataState: 'final',
  };

  const [totalsData, pagesData] = await Promise.all([
    fetchJson(
      endpoint,
      {
        method: 'POST',
        headers: bearerHeaders(accessToken),
        body: JSON.stringify(commonBody),
      },
      { fetchImpl, provider: 'search_console' }
    ),
    fetchJson(
      endpoint,
      {
        method: 'POST',
        headers: bearerHeaders(accessToken),
        body: JSON.stringify({
          ...commonBody,
          dimensions: ['page'],
          aggregationType: 'byPage',
          rowLimit: 10,
        }),
      },
      { fetchImpl, provider: 'search_console' }
    ),
  ]);

  const totals = totalsData.rows?.[0];
  const topPages = (pagesData.rows || []).map((row) => ({
    url: row.keys?.[0] || null,
    clicks: numericValue(row.clicks, 0),
    impressions: numericValue(row.impressions, 0),
    ctr: numericValue(row.ctr),
    position: numericValue(row.position),
  }));

  return {
    status: 'available',
    siteUrl: searchConsoleSiteUrl,
    totals: {
      clicks: numericValue(totals?.clicks, 0),
      impressions: numericValue(totals?.impressions, 0),
      ctr: numericValue(totals?.ctr),
      position: numericValue(totals?.position),
    },
    topPages,
  };
}

function unavailable(reason) {
  return {
    status: 'unavailable',
    reason,
    totals: null,
    topPages: [],
  };
}

function failureReason(error) {
  if (error instanceof GoogleReportingError) return error.reason;
  return 'request_failed';
}

export async function getGoogleReportingSnapshot({
  env = process.env,
  fetchImpl = fetch,
  now = Date.now(),
  accessTokenProvider = getAccessToken,
  bypassCache = false,
} = {}) {
  const config = getGoogleReportingConfig(env);
  const cacheKey = `${config.analyticsPropertyId}|${config.searchConsoleSiteUrl}`;
  if (
    !bypassCache &&
    cachedSnapshot?.expiresAt > now &&
    cachedSnapshot.cacheKey === cacheKey
  ) {
    return cachedSnapshot.value;
  }

  const analyticsDateRange = getCompleteDateRange(now);
  const searchConsoleDateRange = getCompleteDateRange(
    now,
    28,
    'America/Vancouver',
    3
  );
  let googleAnalytics = unavailable('missing_configuration');
  let googleSearchConsole = unavailable('missing_configuration');

  if (config.analyticsConfigured || config.searchConsoleConfigured) {
    try {
      const accessToken = await accessTokenProvider(config, fetchImpl, now);
      const [analyticsResult, searchConsoleResult] = await Promise.allSettled([
        config.analyticsConfigured
          ? fetchGa4Report({
              accessToken,
              analyticsPropertyId: config.analyticsPropertyId,
              dateRange: analyticsDateRange,
              fetchImpl,
            })
          : Promise.resolve(unavailable('missing_configuration')),
        config.searchConsoleConfigured
          ? fetchSearchConsoleReport({
              accessToken,
              searchConsoleSiteUrl: config.searchConsoleSiteUrl,
              dateRange: searchConsoleDateRange,
              fetchImpl,
            })
          : Promise.resolve(unavailable('missing_configuration')),
      ]);

      googleAnalytics =
        analyticsResult.status === 'fulfilled'
          ? analyticsResult.value
          : unavailable(failureReason(analyticsResult.reason));
      googleSearchConsole =
        searchConsoleResult.status === 'fulfilled'
          ? searchConsoleResult.value
          : unavailable(failureReason(searchConsoleResult.reason));
    } catch (error) {
      const reason = failureReason(error);
      if (config.analyticsConfigured) googleAnalytics = unavailable(reason);
      if (config.searchConsoleConfigured) {
        googleSearchConsole = unavailable(reason);
      }
    }
  }

  const availableProviders = [
    googleAnalytics.status,
    googleSearchConsole.status,
  ].filter((status) => status === 'available').length;
  const value = {
    status:
      availableProviders === 2
        ? 'available'
        : availableProviders === 1
          ? 'partial'
          : 'unavailable',
    windows: {
      googleAnalytics: analyticsDateRange,
      googleSearchConsole: {
        ...searchConsoleDateRange,
        completeness: 'final-data-lag-adjusted',
      },
    },
    googleAnalytics,
    googleSearchConsole,
    generatedAt: new Date(now).toISOString(),
    missingRule:
      'Unavailable metrics are null or omitted and are never represented as zero.',
  };

  if (!bypassCache) {
    cachedSnapshot = {
      cacheKey,
      value,
      expiresAt:
        now +
        (value.status === 'unavailable'
          ? UNAVAILABLE_CACHE_MS
          : REPORTING_CACHE_MS),
    };
  }

  return value;
}

export function hasValidReportingToken(request, expectedToken) {
  if (!configured(expectedToken)) return false;
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) return false;
  const suppliedToken = authorization.slice('Bearer '.length);
  const expected = Buffer.from(expectedToken.trim());
  const supplied = Buffer.from(suppliedToken);
  return (
    expected.length === supplied.length && timingSafeEqual(expected, supplied)
  );
}

export function resetGoogleReportingCacheForTests() {
  cachedAccessToken = null;
  cachedSnapshot = null;
}
