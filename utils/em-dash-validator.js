#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Em-Dash Validator
 * Ensures article prose does not use em dashes.
 * Direct quotes, quote attributions, and source-list titles are exempt.
 * Usage: node utils/em-dash-validator.js "content/category/article.mdx"
 */

function proseEmDashCount(content) {
  let inSources = false;

  return content.split(/\r?\n/).reduce((count, line) => {
    const trimmed = line.trim();
    if (/^##\s+sources\s*$/i.test(trimmed)) {
      inSources = true;
      return count;
    }
    if (inSources && /^##\s+\S/.test(trimmed)) {
      inSources = false;
    }
    if (inSources || line.trimStart().startsWith('>')) {
      return count;
    }

    const withoutDirectQuotes = line.replace(/"[^"\r\n]*"/g, '');
    return count + (withoutDirectQuotes.match(/—/g) || []).length;
  }, 0);
}

function validateEmDashes(filepath) {
  if (!fs.existsSync(filepath)) {
    console.error(`❌ ERROR: File not found: ${filepath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filepath, 'utf8');
  const count = proseEmDashCount(content);

  const filename = path.basename(filepath);

  console.log(`\n📄 Analyzing: ${filename}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (count > 0) {
    console.error(
      `❌ FAIL: ${count} em-dash${count === 1 ? '' : 'es'} found in article prose`
    );
    console.error(`\n⚠️  Em-dash overuse is a formulaic AI writing pattern.`);
    console.error(`\n💡 Fix suggestions:`);
    console.error(`   • Use periods (.) for strong breaks`);
    console.error(`   • Use commas (,) for mild pauses`);
    console.error(`   • Use parentheses ( ) for asides`);
    console.error(`   • Rewrite sentences to be more natural`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    process.exit(1);
  } else {
    console.log(`✅ EXCELLENT: No em dashes found in article prose`);
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  process.exit(0);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ ERROR: No file path provided');
  console.log(
    '\nUsage: node utils/em-dash-validator.js "content/category/article.mdx"'
  );
  process.exit(1);
}

const filepath = args[0];
validateEmDashes(filepath);
