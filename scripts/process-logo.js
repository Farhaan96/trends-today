#!/usr/bin/env node

/*
 Trim transparent padding from the brand logo and export a tight version.
 Requires dev dependency: sharp
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

async function main() {
  const src = path.join(process.cwd(), 'public', 'images', 'brand', 'trends-today-logo.png');
  const out = path.join(process.cwd(), 'public', 'images', 'brand', 'trends-today-logo-tight.png');

  if (!fs.existsSync(src)) {
    console.error('Source logo not found at', src);
    process.exit(1);
  }

  const image = sharp(src);

  // Auto-trim borders and ensure sensible output size
  await image
    .trim() // auto-trim bordering space
    .png({ compressionLevel: 9 })
    .toFile(out);

  console.log('Wrote', out);
}

main().catch((e) => { console.error(e); process.exit(1); });
