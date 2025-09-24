#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Em-Dash Validator
 * Ensures articles don't exceed the maximum allowed em-dashes (2)
 * Usage: node utils/em-dash-validator.js "content/category/article.mdx"
 */

const MAX_EM_DASHES = 2;

function validateEmDashes(filepath) {
  if (!fs.existsSync(filepath)) {
    console.error(`❌ ERROR: File not found: ${filepath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filepath, 'utf8');
  const emDashMatches = content.match(/—/g);
  const count = emDashMatches ? emDashMatches.length : 0;

  const filename = path.basename(filepath);

  console.log(`\n📄 Analyzing: ${filename}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (count > MAX_EM_DASHES) {
    console.error(
      `❌ FAIL: ${count} em-dashes found (maximum allowed: ${MAX_EM_DASHES})`
    );
    console.error(`\n⚠️  Em-dash overuse is a formulaic AI writing pattern.`);
    console.error(`\n💡 Fix suggestions:`);
    console.error(`   • Use periods (.) for strong breaks`);
    console.error(`   • Use commas (,) for mild pauses`);
    console.error(`   • Use parentheses ( ) for asides`);
    console.error(`   • Rewrite sentences to be more natural`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    process.exit(1);
  } else if (count === 0) {
    console.log(`✅ EXCELLENT: No em-dashes found (ideal!)`);
  } else {
    console.log(
      `✅ PASS: ${count} em-dash${count === 1 ? '' : 'es'} found (within limit)`
    );
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
