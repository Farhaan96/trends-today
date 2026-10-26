import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL;
const outputDirectory = resolve(process.env.OUT_DIR || 'qa-screenshots/pr271');
const articlePath =
  process.env.ARTICLE_PATH ||
  '/things-to-do/minnekhada-regional-park-day-trip-guide-2026';

assert.ok(baseUrl, 'BASE_URL is required (for example http://127.0.0.1:3000)');

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];
const routes = [
  { name: 'home', path: '/' },
  { name: 'article', path: articlePath },
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function themeTokens(page, colorScheme) {
  await page.emulateMedia({ colorScheme });
  await page.goto(new URL('/', baseUrl).href, { waitUntil: 'networkidle' });
  return page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      colorScheme: root.colorScheme,
      background: root.getPropertyValue('--color-bg').trim(),
      text: root.getPropertyValue('--color-text').trim(),
      accent: root.getPropertyValue('--color-accent').trim(),
    };
  });
}

const themeProbe = await browser.newPage({ viewport: viewports[0] });
const lightTokens = await themeTokens(themeProbe, 'light');
const darkTokens = await themeTokens(themeProbe, 'dark');
await themeProbe.close();

const darkModeSupported =
  darkTokens.colorScheme.includes('dark') &&
  JSON.stringify(lightTokens) !== JSON.stringify(darkTokens);
const themes = ['light', 'dark'];
const results = {
  baseUrl,
  articlePath,
  darkModeSupported,
  themeProbe: { light: lightTokens, dark: darkTokens },
  runs: [],
};

try {
  for (const theme of themes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        colorScheme: theme,
        viewport,
      });

      for (const route of routes) {
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        page.on('console', (message) => {
          if (message.type() === 'error') consoleErrors.push(message.text());
        });
        page.on('pageerror', (error) => pageErrors.push(error.message));

        const response = await page.goto(new URL(route.path, baseUrl).href, {
          waitUntil: 'networkidle',
        });
        await page.evaluate(async () => {
          await document.fonts.ready;
          const images = [...document.images];
          // Lazy images in collapsed containers never load; load them eagerly.
          for (const image of images) image.loading = 'eager';
          await Promise.all(
            images.map((image) => {
              if (image.complete) return undefined;
              return new Promise((done) => {
                image.addEventListener('load', done, { once: true });
                image.addEventListener('error', done, { once: true });
              });
            })
          );
        });

        const metrics = await page.evaluate(() => {
          const parseColor = (color) => {
            const channels = color.match(/[\d.]+/g)?.map(Number) || [];
            if (channels.length < 3) return null;
            return {
              red: channels[0],
              green: channels[1],
              blue: channels[2],
              alpha: channels[3] ?? 1,
            };
          };
          const composite = (foreground, background) => ({
            red:
              foreground.red * foreground.alpha +
              background.red * (1 - foreground.alpha),
            green:
              foreground.green * foreground.alpha +
              background.green * (1 - foreground.alpha),
            blue:
              foreground.blue * foreground.alpha +
              background.blue * (1 - foreground.alpha),
            alpha: 1,
          });
          const effectiveBackground = (element) => {
            const layers = [];
            let current = element;
            while (current) {
              const color = parseColor(
                getComputedStyle(current).backgroundColor
              );
              if (color && color.alpha > 0) layers.push(color);
              if (color?.alpha === 1) break;
              current = current.parentElement;
            }
            return layers
              .reverse()
              .reduce((background, layer) => composite(layer, background), {
                red: 255,
                green: 255,
                blue: 255,
                alpha: 1,
              });
          };
          const luminance = (color) => {
            const linear = [color.red, color.green, color.blue].map(
              (channel) => {
                const value = channel / 255;
                return value <= 0.04045
                  ? value / 12.92
                  : ((value + 0.055) / 1.055) ** 2.4;
              }
            );
            return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
          };
          const contrast = (foreground, background) => {
            const foregroundLuminance = luminance(foreground);
            const backgroundLuminance = luminance(background);
            return (
              (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
              (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
            );
          };
          const visible = (element) => {
            const box = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return (
              box.width > 0 &&
              box.height > 0 &&
              style.display !== 'none' &&
              style.visibility !== 'hidden'
            );
          };
          const descriptor = (element) => {
            const tag = element.tagName.toLowerCase();
            const id = element.id ? `#${element.id}` : '';
            const classes = [...element.classList]
              .slice(0, 3)
              .map((name) => `.${name}`)
              .join('');
            return `${tag}${id}${classes}`;
          };
          const rootStyle = getComputedStyle(document.documentElement);
          const accentColors = new Set(
            ['--color-accent', '--color-accent-strong']
              .map((token) => {
                const probe = document.createElement('span');
                probe.style.color = `var(${token})`;
                document.body.append(probe);
                const color = getComputedStyle(probe).color;
                probe.remove();
                return color;
              })
              .filter(Boolean)
          );
          const accentContrast = [];

          for (const element of document.querySelectorAll('body *')) {
            if (!visible(element)) continue;
            const style = getComputedStyle(element);
            const foreground = parseColor(style.color);
            const background = parseColor(style.backgroundColor);
            const hasText = [...element.childNodes].some(
              (node) =>
                node.nodeType === Node.TEXT_NODE &&
                Boolean(node.textContent?.trim())
            );

            if (accentColors.has(style.color) && foreground) {
              const surface = effectiveBackground(element);
              accentContrast.push({
                element: descriptor(element),
                use: hasText ? 'text' : 'graphic',
                foreground: style.color,
                background: `rgb(${surface.red}, ${surface.green}, ${surface.blue})`,
                ratio: contrast(foreground, surface),
                requiredRatio: hasText ? 4.5 : 3,
                text: hasText ? element.textContent.trim().slice(0, 100) : '',
              });
            }

            if (
              accentColors.has(style.backgroundColor) &&
              background &&
              foreground
            ) {
              accentContrast.push({
                element: descriptor(element),
                use: 'accent-background',
                foreground: style.color,
                background: style.backgroundColor,
                ratio: contrast(foreground, background),
                requiredRatio: hasText ? 4.5 : 3,
                text: hasText ? element.textContent.trim().slice(0, 100) : '',
              });
            }
          }

          const authorButton = document.querySelector(
            '.author-more__action .primary-button'
          );
          const authorButtonStyle = authorButton
            ? getComputedStyle(authorButton)
            : null;
          const authorForeground = authorButtonStyle
            ? parseColor(authorButtonStyle.color)
            : null;
          const authorBackground = authorButtonStyle
            ? parseColor(authorButtonStyle.backgroundColor)
            : null;
          const hero = document.querySelector('.article-hero');
          const articleMeta = document.querySelector('.article-meta');
          const metaAuthor = document.querySelector('.article-meta__author');
          const metaAuthorLink = metaAuthor?.querySelector('a');
          const heroImage = hero?.querySelector('img');
          const heroBox = hero?.getBoundingClientRect();
          const bodyText = [...document.querySelectorAll('.prose p, .prose li')]
            .filter(visible)
            .map((element) =>
              Number.parseFloat(getComputedStyle(element).fontSize)
            );
          const tapTargets = [
            ...document.querySelectorAll(
              'a[href], button, input, select, textarea, [role="button"]'
            ),
          ]
            .filter(visible)
            .map((element) => {
              const box = element.getBoundingClientRect();
              return {
                element: descriptor(element),
                width: box.width,
                height: box.height,
                text: element.textContent?.trim().slice(0, 80) || '',
              };
            });
          const textElements = [
            ...document.querySelectorAll(
              'body *:not(script):not(style):not(noscript)'
            ),
          ]
            .filter(visible)
            .filter((element) =>
              [...element.childNodes].some(
                (node) =>
                  node.nodeType === Node.TEXT_NODE &&
                  Boolean(node.textContent?.trim())
              )
            )
            .map((element) => ({
              element: descriptor(element),
              fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
              text: element.textContent?.trim().slice(0, 100) || '',
            }));
          const headings = [
            ...document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
          ]
            .filter(visible)
            .map((element) => ({
              element: descriptor(element),
              level: Number(element.tagName.slice(1)),
              text: element.textContent?.trim() || '',
              normalizedText: (element.textContent || '')
                .trim()
                .replace(/\s+/g, ' ')
                .toLocaleLowerCase('en'),
            }));
          const duplicateHeadingText = [
            ...new Set(
              headings
                .filter(
                  (heading, index) =>
                    heading.normalizedText &&
                    headings.findIndex(
                      (candidate) =>
                        candidate.normalizedText === heading.normalizedText
                    ) !== index
                )
                .map((heading) => heading.normalizedText)
            ),
          ];
          const images = [...document.images].map((image) => ({
            src: image.currentSrc || image.src,
            alt: image.alt,
            complete: image.complete,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
          }));
          const keyText = [
            ...document.querySelectorAll(
              'h1, .article-deck, .author-more__action .primary-button'
            ),
          ]
            .filter(visible)
            .map((element) => ({
              element: descriptor(element),
              text: element.textContent?.trim() || '',
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
              clientHeight: element.clientHeight,
              scrollHeight: element.scrollHeight,
              clipped:
                element.scrollWidth > element.clientWidth ||
                element.scrollHeight > element.clientHeight,
            }));

          return {
            document: {
              clientWidth: document.documentElement.clientWidth,
              scrollWidth: document.documentElement.scrollWidth,
              horizontalOverflow:
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth,
              h1Count: document.querySelectorAll('h1').length,
              headings,
              duplicateHeadingText,
              colorScheme: rootStyle.colorScheme,
            },
            authorButton: authorButtonStyle
              ? {
                  found: true,
                  color: authorButtonStyle.color,
                  backgroundColor: authorButtonStyle.backgroundColor,
                  contrast:
                    authorForeground && authorBackground
                      ? contrast(authorForeground, authorBackground)
                      : null,
                  box: authorButton.getBoundingClientRect().toJSON(),
                  text: authorButton.textContent.trim(),
                }
              : { found: false },
            articleMeta:
              articleMeta && metaAuthor
                ? {
                    fontSize: Number.parseFloat(
                      getComputedStyle(articleMeta).fontSize
                    ),
                    detailsBottom: Math.max(
                      ...[...articleMeta.children]
                        .filter((child) => child !== metaAuthor)
                        .map((child) => child.getBoundingClientRect().bottom)
                    ),
                    authorBox: metaAuthor.getBoundingClientRect().toJSON(),
                    authorTapBox:
                      metaAuthorLink?.getBoundingClientRect().toJSON() || null,
                    authorContrast: metaAuthorLink
                      ? contrast(
                          parseColor(getComputedStyle(metaAuthorLink).color),
                          effectiveBackground(metaAuthorLink)
                        )
                      : null,
                    detailsLineCount: new Set(
                      [...articleMeta.children]
                        .filter((child) => child !== metaAuthor)
                        .map((child) =>
                          Math.round(child.getBoundingClientRect().top)
                        )
                    ).size,
                  }
                : null,
            accentContrast,
            accentContrastFailures: accentContrast.filter(
              (entry) => entry.ratio < entry.requiredRatio
            ),
            hero: heroBox
              ? {
                  box: heroBox.toJSON(),
                  aspectRatio: heroBox.width / heroBox.height,
                  isMap: hero.classList.contains('article-hero--map'),
                  backgroundColor: getComputedStyle(hero).backgroundColor,
                  imageObjectFit: heroImage
                    ? getComputedStyle(heroImage).objectFit
                    : null,
                }
              : null,
            smallestBodyFontPx: bodyText.length ? Math.min(...bodyText) : null,
            smallestTextPx: textElements.length
              ? Math.min(...textElements.map(({ fontSize }) => fontSize))
              : null,
            textBelow12px: textElements.filter(({ fontSize }) => fontSize < 12),
            images: {
              total: images.length,
              missingAlt: images.filter((image) => !image.alt.trim()),
              broken: images.filter(
                (image) => !image.complete || image.naturalWidth === 0
              ),
            },
            keyText,
            tapTargets: {
              total: tapTargets.length,
              below44px: tapTargets.filter(
                ({ width, height }) =>
                  Math.round(width * 100) / 100 < 44 ||
                  Math.round(height * 100) / 100 < 44
              ),
            },
          };
        });

        const screenshot = `${route.name}-${theme}-${viewport.width}x${viewport.height}.png`;
        await page.screenshot({
          fullPage: true,
          path: resolve(outputDirectory, screenshot),
        });
        results.runs.push({
          route: route.path,
          theme,
          viewport,
          status: response?.status() ?? null,
          screenshot,
          consoleErrors,
          pageErrors,
          metrics,
        });
        await page.close();
      }

      await context.close();
    }
  }
} finally {
  await browser.close();
}

await writeFile(
  resolve(outputDirectory, 'metrics.json'),
  `${JSON.stringify(results, null, 2)}\n`
);

const articleRuns = results.runs.filter((run) => run.route === articlePath);
assert.ok(articleRuns.length > 0, 'expected article QA results');
// Duplicate-heading enforcement covers the article template this PR owns; the
// homepage repeats story titles across modules (tracked by the homepage work).
for (const run of articleRuns) {
  assert.deepEqual(
    run.metrics.document.duplicateHeadingText,
    [],
    `${run.route} repeats heading text at ${run.viewport.width}x${run.viewport.height}`
  );
}
for (const run of results.runs) {
  assert.equal(run.status, 200, `${run.route} must return HTTP 200`);
  assert.equal(
    run.metrics.document.horizontalOverflow,
    false,
    `${run.route} has horizontal overflow at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.equal(
    run.metrics.document.h1Count,
    1,
    `${run.route} must render exactly one h1 at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.deepEqual(
    run.metrics.accentContrastFailures,
    [],
    `accent contrast failures on ${run.route} at ${run.viewport.width}x${run.viewport.height}`
  );
}

const phoneArticleRuns = articleRuns.filter((run) => run.viewport.width <= 430);
assert.ok(phoneArticleRuns.length > 0, 'expected phone article QA results');
for (const run of phoneArticleRuns) {
  assert.ok(
    run.metrics.articleMeta,
    `article meta missing at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.equal(
    run.metrics.articleMeta.fontSize,
    13,
    `article meta must be 13px at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.equal(
    run.metrics.articleMeta.detailsLineCount,
    1,
    `article details must occupy one line at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.ok(
    run.metrics.articleMeta.authorBox.top >=
      run.metrics.articleMeta.detailsBottom,
    `article author must have its own line at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.ok(
    run.metrics.articleMeta.authorTapBox?.height >= 44,
    `article author target is shorter than 44px at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.deepEqual(
    run.metrics.tapTargets.below44px,
    [],
    `article tap targets are smaller than 44px at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.deepEqual(
    run.metrics.textBelow12px,
    [],
    `article text is smaller than 12px at ${run.viewport.width}x${run.viewport.height}`
  );
}

for (const run of articleRuns) {
  assert.ok(
    run.metrics.articleMeta,
    `article meta missing at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.ok(
    run.metrics.articleMeta.authorContrast >= 7,
    `article author contrast is ${run.metrics.articleMeta.authorContrast}:1 at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.equal(
    run.metrics.authorButton.found,
    true,
    `author button missing at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.ok(
    run.metrics.authorButton.contrast >= 7,
    `author button contrast is ${run.metrics.authorButton.contrast}:1 at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.equal(
    run.metrics.hero.imageObjectFit,
    'cover',
    `generated hero must use cover at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.ok(
    Math.abs(run.metrics.hero.aspectRatio - 16 / 9) < 0.02,
    `generated hero aspect ratio is ${run.metrics.hero.aspectRatio} at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.ok(
    run.viewport.width < 1280 || run.metrics.hero.box.height <= 720.5,
    `desktop hero is ${run.metrics.hero.box.height}px tall at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.ok(
    run.metrics.smallestBodyFontPx >= 16,
    `smallest article body text is ${run.metrics.smallestBodyFontPx}px at ${run.viewport.width}x${run.viewport.height}`
  );
  assert.deepEqual(
    run.metrics.keyText.filter((entry) => entry.clipped),
    [],
    `key article text is clipped at ${run.viewport.width}x${run.viewport.height}`
  );
}

console.log(
  `Wrote ${results.runs.length} screenshots and metrics.json to ${outputDirectory}`
);
