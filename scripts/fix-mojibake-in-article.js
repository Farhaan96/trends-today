#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function fixContent(text) {
  return text
    .split('I��kur').join('Ishkur')
    .split('�?"').join(' — ')
    .replace(/\uFFFD/g, '')
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/fix-mojibake-in-article.js <file.mdx>');
    process.exit(1);
  }
  const full = path.resolve(file);
  const input = fs.readFileSync(full, 'utf8');
  const output = fixContent(input);
  if (output !== input) {
    fs.writeFileSync(full, output);
    console.log('Fixed mojibake in', file);
  } else {
    console.log('No changes needed for', file);
  }
}

main().catch(err => { console.error(err); process.exit(1); });

