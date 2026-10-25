import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
const outDir = process.env.OUT_DIR;

if (!baseUrl || !outDir) {
  throw new Error(
    'Set BASE_URL and OUT_DIR, for example BASE_URL=http://127.0.0.1:3000 OUT_DIR=qa-screenshots/pr269 node scripts/qa/pr-check.mjs'
  );
}

const generatedGuideSlugs = [
  'minnekhada-regional-park-day-trip-guide-2026',
  'iona-beach-regional-park-day-trip-guide-2026',
  'burnaby-mountain-conservation-area-day-trip-guide-2026',
  'central-park-burnaby-day-trip-guide-2026',
];
const routes = [
  {
    name: 'photoreal-minnekhada',
    path: '/things-to-do/minnekhada-regional-park-day-trip-guide-2026',
    expectedCaption:
      'AI-generated image, not a photo of Minnekhada Regional Park.',
    expectedAltPrefix: 'AI-generated image of ',
  },
  {
    name: 'illustration-vancouver',
    path: '/food-drink/ramen-danbo-main-st-opening-vancouver',
    expectedCaption: 'Generated illustration by Trends Today, not a photo.',
    expectedAltPrefix: 'Generated illustration of ',
  },
];
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];
const failures = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport,
      colorScheme: 'light',
    });

    for (const route of routes) {
      const page = await context.newPage();
      const response = await page.goto(`${baseUrl}${route.path}`, {
        waitUntil: 'domcontentloaded',
      });
      // Load lazy images up front (some sit in collapsed containers), then wait.
      await page.evaluate(() => {
        for (const image of document.images) image.loading = 'eager';
      });
      await page.waitForFunction(() =>
        Array.from(document.images).every((image) => image.complete)
      );

      const metrics = await page.evaluate(
        ({
          expectedCaption,
          expectedAltPrefix,
          generatedGuideSlugs,
          routeName,
        }) => {
          const visible = (element) => {
            const style = getComputedStyle(element);
            const box = element.getBoundingClientRect();
            return (
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              box.width > 0 &&
              box.height > 0
            );
          };
          const box = (element) => {
            if (!element) return null;
            const rect = element.getBoundingClientRect();
            return {
              x: Number(rect.x.toFixed(2)),
              y: Number(rect.y.toFixed(2)),
              width: Number(rect.width.toFixed(2)),
              height: Number(rect.height.toFixed(2)),
            };
          };
          const parseRgb = (value) => {
            const match = value.match(/[\d.]+/g);
            return match?.length >= 3 ? match.slice(0, 3).map(Number) : null;
          };
          const luminance = (rgb) => {
            const channels = rgb.map((channel) => {
              const value = channel / 255;
              return value <= 0.04045
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4;
            });
            return (
              channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
            );
          };
          const contrast = (foreground, background) => {
            const foregroundRgb = parseRgb(foreground);
            const backgroundRgb = parseRgb(background);
            if (!foregroundRgb || !backgroundRgb) return null;
            const lighter = Math.max(
              luminance(foregroundRgb),
              luminance(backgroundRgb)
            );
            const darker = Math.min(
              luminance(foregroundRgb),
              luminance(backgroundRgb)
            );
            return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
          };
          const prefixCount = (value) =>
            value.toLowerCase().split(expectedAltPrefix.trim().toLowerCase())
              .length - 1;
          const imageDetails = (image) => ({
            src: image.currentSrc || image.src,
            alt: image.alt,
            prefixCount: prefixCount(image.alt),
            box: box(image),
          });
          const captionDetails = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const style = getComputedStyle(element);
            return {
              text: element.textContent?.trim() || '',
              exactText: element.textContent?.trim() === expectedCaption,
              fontSizePx: Number.parseFloat(style.fontSize),
              color: style.color,
              backgroundColor: style.backgroundColor,
              contrast: contrast(style.color, style.backgroundColor),
              box: box(element),
            };
          };

          const headings = Array.from(
            document.querySelectorAll('h1, h2, h3, h4, h5, h6')
          )
            .filter(visible)
            .map((heading) => heading.textContent?.trim() || '')
            .filter(Boolean);
          const headingCounts = new Map();
          for (const heading of headings) {
            headingCounts.set(heading, (headingCounts.get(heading) || 0) + 1);
          }
          const duplicateHeadingTexts = Array.from(headingCounts)
            .filter(([, count]) => count > 1)
            .map(([text, count]) => ({ text, count }));

          const tapTargets = Array.from(
            document.querySelectorAll(
              'a, button, input, select, textarea, [role="button"]'
            )
          ).filter(visible);
          const smallTapTargets = tapTargets
            .map((element) => ({
              label:
                element.getAttribute('aria-label') ||
                element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ||
                element.tagName.toLowerCase(),
              box: box(element),
            }))
            .filter(
              (target) =>
                target.box && (target.box.width < 44 || target.box.height < 44)
            );

          const bodyText = Array.from(
            document.querySelectorAll(
              '.article-content p, .article-content li, .article-dek-body, .cover__deck, .today-brief__headline, .travel-brief__description, .neighbourhood-grid article > p:not(.eyebrow)'
            )
          ).filter(visible);
          const bodyFontSizes = bodyText.map((element) =>
            Number.parseFloat(getComputedStyle(element).fontSize)
          );

          const allImages = Array.from(document.images);
          const brokenImages = allImages
            .filter((image) => image.complete && image.naturalWidth === 0)
            .map((image) => image.currentSrc || image.src);
          const generatedHomepageImages =
            routeName === 'home'
              ? allImages
                  .filter((image) =>
                    generatedGuideSlugs.some((slug) =>
                      (image.currentSrc || image.src).includes(slug)
                    )
                  )
                  .map(imageDetails)
              : [];
          const generatedBriefImages =
            routeName === 'home'
              ? Array.from(document.querySelectorAll('.today-brief__thumb img'))
                  .filter((image) =>
                    generatedGuideSlugs.some((slug) =>
                      (image.currentSrc || image.src).includes(slug)
                    )
                  )
                  .map(imageDetails)
              : [];

          const coverImage = document.querySelector('.cover__media img');
          const articleHero = document.querySelector(
            '.article-hero .editorial-image'
          );
          return {
            title: document.title,
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            horizontalOverflowPx: Math.max(
              0,
              document.documentElement.scrollWidth -
                document.documentElement.clientWidth
            ),
            h1Count: document.querySelectorAll('h1').length,
            duplicateHeadingTexts,
            smallestBodyFontPx: bodyFontSizes.length
              ? Math.min(...bodyFontSizes)
              : null,
            tapTargetCount: tapTargets.length,
            tapTargetsBelow44Count: smallTapTargets.length,
            tapTargetsBelow44: smallTapTargets.slice(0, 20),
            imageCount: allImages.length,
            brokenImages,
            generatedHomepageImages,
            generatedBriefImages,
            coverImage: coverImage ? imageDetails(coverImage) : null,
            coverCaption: captionDetails('.cover__generated-caption'),
            articleHero: articleHero ? imageDetails(articleHero) : null,
            articleCaption: captionDetails('.article-hero-caption'),
            expectedCaption,
          };
        },
        {
          expectedCaption: route.expectedCaption,
          expectedAltPrefix: route.expectedAltPrefix,
          generatedGuideSlugs,
          routeName: route.name,
        }
      );

      const size = `${viewport.width}x${viewport.height}`;
      const screenshot = `${route.name}-${size}-light.png`;
      await page.screenshot({
        path: path.join(outDir, screenshot),
        fullPage: true,
      });

      const record = {
        route: route.path,
        viewport,
        colorScheme: 'light',
        httpStatus: response?.status() ?? null,
        screenshot,
        metrics,
      };
      results.push(record);

      if (!response?.ok()) {
        failures.push(`${route.name} ${size}: HTTP ${response?.status()}`);
      }
      if (metrics.horizontalOverflowPx !== 0) {
        failures.push(
          `${route.name} ${size}: ${metrics.horizontalOverflowPx}px horizontal overflow`
        );
      }
      if (metrics.brokenImages.length) {
        failures.push(`${route.name} ${size}: broken images`);
      }

      if (
        !metrics.articleHero?.alt.startsWith(route.expectedAltPrefix) ||
        metrics.articleHero.prefixCount !== 1
      ) {
        failures.push(`${route.name} ${size}: article hero alt disclosure`);
      }
      if (
        !metrics.articleCaption?.exactText ||
        metrics.articleCaption.fontSizePx < 13 ||
        metrics.articleCaption.contrast < 4.5
      ) {
        failures.push(`${route.name} ${size}: article hero caption`);
      }

      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  baseUrl,
  generatedAt: new Date().toISOString(),
  screenshots: results.map((result) => result.screenshot),
  failures,
  results,
};
await writeFile(
  path.join(outDir, 'metrics.json'),
  `${JSON.stringify(report, null, 2)}\n`
);

if (failures.length) {
  console.error(`PR #269 QA failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(
    `PR #269 QA passed at ${viewports.length} viewports. Results: ${path.join(outDir, 'metrics.json')}`
  );
}
