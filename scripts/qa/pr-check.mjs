import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL;
const outDir = process.env.OUT_DIR;

if (!baseUrl || !outDir) {
  throw new Error(
    'Set BASE_URL and OUT_DIR, for example BASE_URL=http://127.0.0.1:3000 OUT_DIR=qa-screenshots/pr268 node scripts/qa/pr-check.mjs'
  );
}

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];
const routes = [
  { name: 'home', pathname: '/' },
  {
    name: 'minnekhada',
    pathname: '/things-to-do/minnekhada-regional-park-day-trip-guide-2026',
  },
];
const results = [];
const checks = [];

await mkdir(outDir, { recursive: true });

function check(name, pass, actual, expected) {
  checks.push({ name, pass, actual, expected });
}

async function settleImages(page) {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight, 600);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() =>
    [...document.images].every(
      (image) => !image.currentSrc || (image.complete && image.naturalWidth > 0)
    )
  );
  // Measure the settled layout, not mid-way through finite entrance animations.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().endTime !== Infinity
        )
        .map((animation) => animation.finished.catch(() => undefined))
    )
  );
}

const browser = await chromium.launch();
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport,
      colorScheme: 'light',
    });
    const page = await context.newPage();

    for (const route of routes) {
      const response = await page.goto(new URL(route.pathname, baseUrl).href, {
        waitUntil: 'networkidle',
      });
      await settleImages(page);

      const metrics = await page.evaluate(
        ({ routeName, viewportHeight }) => {
          const visible = (element) => {
            if (!(element instanceof HTMLElement)) return false;
            const style = getComputedStyle(element);
            const box = element.getBoundingClientRect();
            return (
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              box.width > 0 &&
              box.height > 0
            );
          };
          const box = (selector) => {
            const element = document.querySelector(selector);
            if (!element || !visible(element)) return null;
            const rect = element.getBoundingClientRect();
            return Object.fromEntries(
              [
                'x',
                'y',
                'top',
                'right',
                'bottom',
                'left',
                'width',
                'height',
              ].map((key) => [key, Math.round(rect[key] * 100) / 100])
            );
          };
          const interactive = [
            ...document.querySelectorAll(
              'a[href], button, input, select, textarea, summary'
            ),
          ].filter(visible);
          const smallTapTargets = interactive
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                tag: element.tagName.toLowerCase(),
                text: (
                  element.textContent ||
                  element.getAttribute('aria-label') ||
                  ''
                )
                  .trim()
                  .replace(/\s+/g, ' ')
                  .slice(0, 80),
                width: Math.round(rect.width * 10) / 10,
                height: Math.round(rect.height * 10) / 10,
              };
            })
            .filter((target) => target.width < 44 || target.height < 44);
          const textElements = [
            ...document.querySelectorAll(
              'p, li, a, span, time, h1, h2, h3, figcaption, button, label'
            ),
          ].filter(
            (element) => visible(element) && (element.textContent || '').trim()
          );
          const textMetrics = textElements.map((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
              tag: element.tagName.toLowerCase(),
              className:
                element instanceof HTMLElement ? element.className : '',
              text: (element.textContent || '')
                .trim()
                .replace(/\s+/g, ' ')
                .slice(0, 80),
              fontSize: Number.parseFloat(style.fontSize),
              clipped:
                element.scrollWidth > element.clientWidth + 2 &&
                style.overflowX !== 'visible',
              width: Math.round(rect.width * 10) / 10,
            };
          });
          const fontSizes = textMetrics
            .map((entry) => entry.fontSize)
            .filter(Number.isFinite);
          const bodyCopy = [
            ...document.querySelectorAll(
              '.cover__deck, .today-brief__headline, .travel-brief__description, .weekend__heading > div:last-child > p, .neighbourhood-card__body > p:not(.eyebrow), .discovery-empty > p, .site-footer__statement'
            ),
          ]
            .filter(
              (element) =>
                visible(element) && (element.textContent || '').trim()
            )
            .map((element) => ({
              text: (element.textContent || '')
                .trim()
                .replace(/\s+/g, ' ')
                .slice(0, 80),
              fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
            }))
            .filter((entry) => Number.isFinite(entry.fontSize));
          const common = {
            title: document.title,
            statusWidth: {
              scrollWidth: document.documentElement.scrollWidth,
              clientWidth: document.documentElement.clientWidth,
            },
            horizontalOverflow:
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
            h1Count: document.querySelectorAll('h1').length,
            brokenImages: [...document.images].filter(
              (image) =>
                image.currentSrc &&
                (!image.complete || image.naturalWidth === 0)
            ).length,
            imagesMissingAlt: [...document.images].filter(
              (image) => !image.hasAttribute('alt') || !image.alt.trim()
            ).length,
            smallestTextFontPx: fontSizes.length
              ? Math.min(...fontSizes)
              : null,
            smallestBodyFontPx: bodyCopy.length
              ? Math.min(...bodyCopy.map((entry) => entry.fontSize))
              : null,
            undersizedBodyCopy: bodyCopy.filter((entry) => entry.fontSize < 16),
            clippedText: textMetrics.filter((entry) => entry.clipped),
            tapTargetCount: interactive.length,
            tapTargetsUnder44: smallTapTargets,
            darkModeSupported:
              getComputedStyle(
                document.querySelector('.cinematic-home') || document.body
              ).colorScheme !== 'light' ||
              Boolean(
                document.querySelector(
                  '[aria-label*="dark" i], [title*="dark" i], .dark-mode-toggle'
                )
              ),
          };

          if (routeName !== 'home') {
            return {
              ...common,
              articleTitle:
                document.querySelector('h1')?.textContent?.trim() || '',
              articleHero: box('.article-hero'),
            };
          }

          const h1 = document.querySelector('.cover h1');
          const h1Text = h1?.textContent?.trim().replace(/\s+/g, ' ') || '';
          const h1Style = h1 ? getComputedStyle(h1) : null;
          const media = document.querySelector('.cover__media');
          const coverImage = media?.querySelector('img') || null;
          const mediaBox = box('.cover__media');
          const inner = document.querySelector('.cover__inner');
          const innerStyle = inner ? getComputedStyle(inner) : null;
          const innerBox = inner?.getBoundingClientRect();
          const contentWidth =
            innerBox && innerStyle
              ? innerBox.width -
                Number.parseFloat(innerStyle.paddingLeft) -
                Number.parseFloat(innerStyle.paddingRight)
              : null;
          const headings = [
            ...document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
          ]
            .filter(visible)
            .map((element) =>
              (element.textContent || '').trim().replace(/\s+/g, ' ')
            );
          const latestDates = [
            ...document.querySelectorAll('.today-brief__date'),
          ]
            .filter(visible)
            .slice(0, 3)
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                text: element.textContent?.trim() || '',
                top: Math.round(rect.top * 100) / 100,
                bottom: Math.round(rect.bottom * 100) / 100,
                aboveFold: rect.bottom <= viewportHeight,
              };
            });
          const latestHeading = document.querySelector('.today-brief h2');
          const latestLinks = [
            ...document.querySelectorAll('.today-brief__link'),
          ].filter(visible);
          const rounded = (value) => Math.round(value * 100) / 100;
          const cardSections = [
            {
              name: 'Latest',
              selector: '.today-brief__link',
              body: '.today-brief__body',
              headline: '.today-brief__headline',
              thumbnail: '.today-brief__thumb',
            },
            {
              name: 'Travel',
              selector: '.travel-brief article',
              body: '.travel-brief__body',
              headline: 'h3',
              thumbnail: '.story-thumb',
            },
            {
              name: 'Neighbourhood',
              selector: '.neighbourhood-grid article',
              body: '.neighbourhood-card__body',
              headline: 'h3',
              thumbnail: '.story-thumb',
            },
          ].map((section) => ({
            name: section.name,
            cards: [...document.querySelectorAll(section.selector)]
              .filter(visible)
              .map((card) => {
                const body = card.querySelector(section.body);
                const headline = card.querySelector(section.headline);
                const headlineStyle = headline
                  ? getComputedStyle(headline)
                  : null;
                const lineHeight = headline
                  ? Number.parseFloat(headlineStyle.lineHeight)
                  : 0;
                const cardRect = card.getBoundingClientRect();
                const bodyRect = body?.getBoundingClientRect();
                const thumbnail = card.querySelector(section.thumbnail);
                const thumbnailRect = visible(thumbnail)
                  ? thumbnail.getBoundingClientRect()
                  : null;
                return {
                  width: rounded(cardRect.width),
                  textWidth: bodyRect ? rounded(bodyRect.width) : 0,
                  hasThumbnail: Boolean(thumbnailRect),
                  thumbnailAboveText: Boolean(
                    thumbnailRect &&
                      bodyRect &&
                      thumbnailRect.bottom <= bodyRect.top + 1
                  ),
                  headlineLines:
                    headline && lineHeight
                      ? Math.ceil(
                          headline.getBoundingClientRect().height / lineHeight
                        )
                      : 0,
                  headlineFullyVisible: Boolean(
                    headline &&
                      headline.scrollHeight <= headline.clientHeight + 1 &&
                      headline.scrollWidth <= headline.clientWidth + 1
                  ),
                  headlineLineClamp: headlineStyle?.webkitLineClamp || '',
                  headlineTextOverflow: headlineStyle?.textOverflow || '',
                  gridTemplateColumns:
                    getComputedStyle(card).gridTemplateColumns,
                };
              }),
          }));
          const pillBoxes = [
            ...document.querySelectorAll('.city-filters button'),
          ]
            .filter(visible)
            .map((pill) => {
              const rect = pill.getBoundingClientRect();
              const range = document.createRange();
              range.selectNodeContents(pill);
              const textRect = range.getBoundingClientRect();
              const style = getComputedStyle(pill);
              const paddingLeft = Number.parseFloat(style.paddingLeft);
              const paddingRight = Number.parseFloat(style.paddingRight);
              return {
                text: pill.textContent?.trim() || '',
                left: rounded(rect.left),
                right: rounded(rect.right),
                top: rounded(rect.top),
                bottom: rounded(rect.bottom),
                width: rounded(rect.width),
                height: rounded(rect.height),
                clientWidth: pill.clientWidth,
                scrollWidth: pill.scrollWidth,
                labelWidth: rounded(textRect.width),
                paddingLeft: rounded(paddingLeft),
                paddingRight: rounded(paddingRight),
                textBox: {
                  left: rounded(textRect.left),
                  right: rounded(textRect.right),
                  top: rounded(textRect.top),
                  bottom: rounded(textRect.bottom),
                },
              };
            });
          const overlappingPills = pillBoxes.flatMap((pill, index) =>
            pillBoxes.slice(index + 1).flatMap((other) => {
              const boxesOverlap =
                pill.left < other.right &&
                pill.right > other.left &&
                pill.top < other.bottom &&
                pill.bottom > other.top;
              const textRangesOverlap =
                pill.textBox.left < other.textBox.right &&
                pill.textBox.right > other.textBox.left &&
                pill.textBox.top < other.textBox.bottom &&
                pill.textBox.bottom > other.textBox.top;
              return boxesOverlap || textRangesOverlap
                ? [
                    `${pill.text} / ${other.text} (${[
                      boxesOverlap ? 'boxes' : '',
                      textRangesOverlap ? 'text ranges' : '',
                    ]
                      .filter(Boolean)
                      .join(' + ')})`,
                  ]
                : [];
            })
          );
          const leadHref = document
            .querySelector('.cover__frame')
            ?.getAttribute('href');
          const slogan = document.querySelector('.tt-slogan');
          const deck = document.querySelector('.cover__deck');
          const headlineGap =
            h1 && latestHeading
              ? latestHeading.getBoundingClientRect().top -
                h1.getBoundingClientRect().bottom
              : null;

          return {
            ...common,
            leadTitle: h1Text,
            visibleHeadingMatchesForLead: headings.filter(
              (heading) => heading === h1Text
            ).length,
            coverFrame: box('.cover__frame'),
            coverCaption: box('.cover__caption'),
            coverMedia: mediaBox,
            coverContentWidth:
              contentWidth === null
                ? null
                : Math.round(contentWidth * 100) / 100,
            coverAspectRatio:
              mediaBox && mediaBox.height
                ? Math.round((mediaBox.width / mediaBox.height) * 1000) / 1000
                : null,
            coverObjectFit: media
              ? coverImage
                ? getComputedStyle(coverImage).objectFit
                : null
              : null,
            expectedCoverObjectFit:
              media?.getAttribute('data-image-fit') || null,
            imageBeforeTitle:
              Boolean(mediaBox && h1) &&
              mediaBox.top < h1.getBoundingClientRect().top,
            headline: h1
              ? {
                  fontSize: h1Style?.fontSize,
                  lineHeight: h1Style?.lineHeight,
                  lineClamp: h1Style?.webkitLineClamp,
                  clientHeight: h1.clientHeight,
                  scrollHeight: h1.scrollHeight,
                  fullyVisible: h1.scrollHeight <= h1.clientHeight,
                }
              : null,
            headlineToLatestGapPx:
              headlineGap === null ? null : Math.round(headlineGap * 100) / 100,
            slogan: slogan
              ? {
                  text: slogan.textContent?.trim() || '',
                  fontSize: getComputedStyle(slogan).fontSize,
                  visible: visible(slogan),
                }
              : null,
            coverTransform: getComputedStyle(
              document.querySelector('.cover__frame')
            ).transform,
            deckVisible: deck ? visible(deck) : false,
            latestSkipsLead: latestLinks.every(
              (link) => link.getAttribute('href') !== leadHref
            ),
            latestHeadlineLineClamps: latestLinks.map(
              (link) =>
                getComputedStyle(link.querySelector('.today-brief__headline'))
                  .webkitLineClamp
            ),
            latestGridTemplateColumns: latestLinks.map(
              (link) => getComputedStyle(link).gridTemplateColumns
            ),
            cardSections,
            pillBoxes,
            overlappingPills,
            latestDates,
          };
        },
        { routeName: route.name, viewportHeight: viewport.height }
      );

      const screenshot = `${route.name}-${viewport.width}x${viewport.height}-light.png`;
      await page.screenshot({
        path: path.join(outDir, screenshot),
        fullPage: true,
      });
      const record = {
        route: route.pathname,
        viewport,
        colorScheme: 'light',
        httpStatus: response?.status() ?? null,
        screenshot,
        metrics,
      };
      results.push(record);

      const prefix = `${route.name} ${viewport.width}x${viewport.height}`;
      check(
        `${prefix}: HTTP 200`,
        record.httpStatus === 200,
        record.httpStatus,
        200
      );
      check(
        `${prefix}: no horizontal overflow`,
        metrics.horizontalOverflow === 0,
        metrics.horizontalOverflow,
        0
      );
      check(`${prefix}: one h1`, metrics.h1Count === 1, metrics.h1Count, 1);
      check(
        `${prefix}: images load`,
        metrics.brokenImages === 0,
        metrics.brokenImages,
        0
      );
      check(
        `${prefix}: image alts present`,
        metrics.imagesMissingAlt === 0,
        metrics.imagesMissingAlt,
        0
      );

      if (route.name === 'home') {
        check(
          `${prefix}: lead title appears once among visible headings`,
          metrics.visibleHeadingMatchesForLead === 1,
          metrics.visibleHeadingMatchesForLead,
          1
        );
        check(
          `${prefix}: full lead headline`,
          metrics.headline?.fullyVisible === true,
          metrics.headline,
          'scrollHeight <= clientHeight'
        );
        if (viewport.width <= 430) {
          check(
            `${prefix}: cover title is no larger than 31px`,
            Number.parseFloat(metrics.headline?.fontSize) <= 31,
            metrics.headline?.fontSize,
            '<= 31px'
          );
        }
        check(
          `${prefix}: correct cover object-fit`,
          metrics.coverObjectFit === metrics.expectedCoverObjectFit,
          metrics.coverObjectFit,
          metrics.expectedCoverObjectFit
        );
        check(
          `${prefix}: 14px slogan`,
          metrics.slogan?.visible === true &&
            metrics.slogan?.fontSize === '14px',
          metrics.slogan,
          'visible at 14px'
        );
        check(
          `${prefix}: no cover tilt`,
          metrics.coverTransform === 'none',
          metrics.coverTransform,
          'none'
        );
        check(
          `${prefix}: Latest excludes cover story`,
          metrics.latestSkipsLead === true,
          metrics.latestSkipsLead,
          true
        );
        check(
          `${prefix}: Latest uses a 96px thumbnail column`,
          metrics.latestGridTemplateColumns.length > 0 &&
            metrics.latestGridTemplateColumns.every(
              (columns) => Math.abs(Number.parseFloat(columns) - 96) <= 0.1
            ),
          metrics.latestGridTemplateColumns,
          'first computed grid track is 96px'
        );
        check(
          `${prefix}: city pills are at least 44px in both dimensions`,
          metrics.pillBoxes.length > 0 &&
            metrics.pillBoxes.every(
              (pill) => pill.width >= 44 && pill.height >= 44
            ),
          metrics.pillBoxes,
          'all widths and heights >= 44px'
        );
        check(
          `${prefix}: city pill boxes and text ranges do not overlap`,
          metrics.overlappingPills.length === 0,
          metrics.overlappingPills,
          []
        );
        check(
          `${prefix}: city pill labels fit their intrinsic padded widths`,
          metrics.pillBoxes.length > 0 &&
            metrics.pillBoxes.every(
              (pill) =>
                pill.scrollWidth <= pill.clientWidth &&
                pill.width + 0.5 >=
                  pill.labelWidth + pill.paddingLeft + pill.paddingRight
            ),
          metrics.pillBoxes,
          'scrollWidth <= clientWidth and width >= Range text width + horizontal padding'
        );
      }

      if (route.name === 'home' && viewport.width <= 430) {
        for (const section of metrics.cardSections) {
          check(
            `${prefix}: ${section.name} cards have usable phone columns`,
            section.cards.length > 0 &&
              section.cards.every(
                (card) =>
                  card.width >= 280 &&
                  (section.name === 'Latest'
                    ? card.textWidth >= 200 &&
                      card.hasThumbnail &&
                      Math.abs(
                        Number.parseFloat(card.gridTemplateColumns) - 96
                      ) <= 0.1
                    : card.textWidth >= 280 &&
                      (!card.hasThumbnail || card.thumbnailAboveText))
              ),
            section.cards,
            section.name === 'Latest'
              ? 'card >= 280px; text >= 200px beside a 96px thumbnail'
              : 'card and text >= 280px; thumbnail absent or stacked above text'
          );
          if (section.name !== 'Latest') {
            check(
              `${prefix}: ${section.name} headlines are fully readable`,
              section.cards.every(
                (card) =>
                  card.headlineLines > 0 &&
                  card.headlineFullyVisible &&
                  (card.headlineLineClamp === 'none' ||
                    card.headlineLineClamp === 'unset') &&
                  card.headlineTextOverflow !== 'ellipsis'
              ),
              section.cards,
              'fully visible; no line clamp or ellipsis'
            );
          }
        }
        check(
          `${prefix}: tap targets are at least 44px`,
          metrics.tapTargetsUnder44.length === 0,
          metrics.tapTargetsUnder44,
          []
        );
        check(
          `${prefix}: body copy is at least 16px`,
          metrics.smallestBodyFontPx >= 16,
          metrics.undersizedBodyCopy,
          'all body copy >= 16px'
        );
        check(
          `${prefix}: all text is at least 12px`,
          metrics.smallestTextFontPx >= 12,
          metrics.smallestTextFontPx,
          '>= 12px'
        );
        check(
          `${prefix}: no horizontally clipped text`,
          metrics.clippedText.length === 0,
          metrics.clippedText,
          []
        );
        check(
          `${prefix}: cover fills content width`,
          metrics.coverMedia?.width >= metrics.coverContentWidth - 1,
          metrics.coverMedia?.width,
          `>= ${metrics.coverContentWidth - 1}`
        );
        check(
          `${prefix}: cover is 16:9`,
          Math.abs(metrics.coverAspectRatio - 16 / 9) <= 0.015,
          metrics.coverAspectRatio,
          1.778
        );
        check(
          `${prefix}: image comes before title`,
          metrics.imageBeforeTitle === true,
          metrics.imageBeforeTitle,
          true
        );
        check(
          `${prefix}: Latest headlines clamp at 3 lines`,
          metrics.latestHeadlineLineClamps.every((value) => value === '3'),
          metrics.latestHeadlineLineClamps,
          'all 3'
        );
        check(
          `${prefix}: cover dek hidden`,
          metrics.deckVisible === false,
          metrics.deckVisible,
          false
        );
        check(
          `${prefix}: 20px title-to-Latest gap`,
          Math.abs(metrics.headlineToLatestGapPx - 20) <= 1,
          metrics.headlineToLatestGapPx,
          '20 +/- 1'
        );
      }

      if (route.name === 'home' && viewport.width === 768) {
        check(
          `${prefix}: cover caption stays inside the viewport`,
          metrics.coverCaption !== null &&
            metrics.coverCaption.left >= 0 &&
            metrics.coverCaption.right <= viewport.width &&
            metrics.coverCaption.top >= metrics.coverMedia.bottom,
          metrics.coverCaption,
          'inside 768px viewport and below cover media'
        );
        const latest = metrics.cardSections.find(
          (section) => section.name === 'Latest'
        );
        check(
          `${prefix}: Latest text column is not squeezed`,
          latest?.cards.length > 0 &&
            latest.cards.every(
              (card) => card.textWidth >= 280 && card.hasThumbnail
            ),
          latest?.cards,
          'visible thumbnails and text columns >= 280px'
        );
      }

      if (route.name === 'home' && viewport.width >= 1280) {
        check(
          `${prefix}: cover dek visible`,
          metrics.deckVisible === true,
          metrics.deckVisible,
          true
        );
      }

      if (route.name === 'home' && viewport.width === 390) {
        check(
          `${prefix}: three Latest dates above fold`,
          metrics.latestDates.length === 3 &&
            metrics.latestDates.every((date) => date.aboveFold),
          metrics.latestDates,
          '3 dates with bottom <= 844'
        );
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  outDir,
  viewports,
  screenshots: results.map((result) => result.screenshot),
  checks,
  results,
  summary: {
    passed: checks.filter((item) => item.pass).length,
    failed: checks.filter((item) => !item.pass).length,
  },
};
await writeFile(
  path.join(outDir, 'metrics.json'),
  `${JSON.stringify(report, null, 2)}\n`
);

if (report.summary.failed) {
  throw new Error(
    `${report.summary.failed} QA check(s) failed; see ${path.join(outDir, 'metrics.json')}`
  );
}

console.log(
  `PASS: ${report.summary.passed} checks; screenshots and metrics written to ${outDir}`
);
