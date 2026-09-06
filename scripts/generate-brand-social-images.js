/**
 * Generates the default social-share images and the Organization schema logo
 * referenced by src/app/layout.tsx, src/lib/schema.ts, SchemaMarkup.tsx and
 * ArticleJsonLd.tsx. Mirrors the live header wordmark (red mark + serif
 * "Trends Today") so the shared assets match the site brand.
 *
 * Usage: node scripts/generate-brand-social-images.js
 *
 * Outputs:
 *   public/images/og-default.jpg   1200x630 (Open Graph)
 *   public/images/twitter-card.jpg 1200x600 (Twitter summary_large_image)
 *   public/images/logo.png         512x512  (Organization schema logo)
 */
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images');

const BG = '#f5f2eb';
const TEXT = '#171714';
const TEXT_SOFT = '#625f58';
const ACCENT = '#d83a31';
const ON_ACCENT = '#fffaf4';
const SERIF = "'Newsreader', 'DejaVu Serif', Georgia, serif";
const SANS = "'DM Sans', 'DejaVu Sans', system-ui, sans-serif";

function escape(text) {
  return text.replace(/&/g, '&amp;');
}

function wordmark({ x, y, markSize, fontSize }) {
  const radius = Math.round(markSize * 0.2);
  const gap = Math.round(markSize * 0.35);
  return `
    <rect x="${x}" y="${y}" width="${markSize}" height="${markSize}" rx="${radius}" fill="${ACCENT}"/>
    <text x="${x + markSize / 2}" y="${y + markSize * 0.72}" text-anchor="middle"
      font-family="${SANS}" font-weight="800" font-size="${Math.round(markSize * 0.62)}"
      fill="${ON_ACCENT}">T</text>
    <text x="${x + markSize + gap}" y="${y + markSize * 0.74}"
      font-family="${SERIF}" font-weight="700" font-size="${fontSize}"
      letter-spacing="-1.5" fill="${TEXT}">Trends Today</text>`;
}

function socialCard(width, height) {
  const pad = 96;
  const markSize = 104;
  const wmY = Math.round(height * 0.3);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="${BG}"/>
    <rect x="0" y="0" width="${width}" height="14" fill="${ACCENT}"/>
    ${wordmark({ x: pad, y: wmY, markSize, fontSize: 96 })}
    <text x="${pad}" y="${wmY + markSize + 92}" font-family="${SANS}" font-size="38"
      fill="${TEXT_SOFT}">${escape('Local news, transit, events, food, housing, and sports')}</text>
    <text x="${pad}" y="${wmY + markSize + 144}" font-family="${SANS}" font-size="38"
      fill="${TEXT_SOFT}">from Vancouver and the Lower Mainland.</text>
    <text x="${pad}" y="${height - pad + 12}" font-family="${SANS}" font-weight="600"
      font-size="30" letter-spacing="1" fill="${ACCENT}">trendstoday.ca</text>
  </svg>`;
}

function logoSquare(size) {
  const markSize = Math.round(size * 0.42);
  const markX = Math.round((size - markSize) / 2);
  const markY = Math.round(size * 0.17);
  const radius = Math.round(markSize * 0.2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${BG}"/>
    <rect x="${markX}" y="${markY}" width="${markSize}" height="${markSize}" rx="${radius}" fill="${ACCENT}"/>
    <text x="${size / 2}" y="${markY + markSize * 0.72}" text-anchor="middle"
      font-family="${SANS}" font-weight="800" font-size="${Math.round(markSize * 0.62)}"
      fill="${ON_ACCENT}">T</text>
    <text x="${size / 2}" y="${Math.round(size * 0.8)}" text-anchor="middle"
      font-family="${SERIF}" font-weight="700" font-size="${Math.round(size * 0.13)}"
      letter-spacing="-1" fill="${TEXT}">Trends Today</text>
  </svg>`;
}

async function main() {
  const jobs = [
    {
      file: 'og-default.jpg',
      svg: socialCard(1200, 630),
      write: (img) => img.jpeg({ quality: 88, mozjpeg: true }),
    },
    {
      file: 'twitter-card.jpg',
      svg: socialCard(1200, 600),
      write: (img) => img.jpeg({ quality: 88, mozjpeg: true }),
    },
    {
      file: 'logo.png',
      svg: logoSquare(512),
      write: (img) => img.png({ compressionLevel: 9, palette: true }),
    },
  ];

  for (const job of jobs) {
    const target = path.join(OUT_DIR, job.file);
    const info = await job.write(sharp(Buffer.from(job.svg))).toFile(target);
    console.log(`${job.file}: ${info.width}x${info.height} ${info.size} bytes`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
