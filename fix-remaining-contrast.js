#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Additional contrast improvements for body text and prose content
const additionalColorMap = {
  'text-gray-700': 'text-gray-900', // Make even darker
  'prose-gray': 'prose-slate', // Better prose colors
  'text-blue-100': 'text-blue-200', // Improve light blue contrast
  'text-purple-100': 'text-purple-200', // Improve light purple contrast
};

// Special patterns for prose and content areas
const prosePatterns = [
  {
    pattern: /prose prose-lg/g,
    replacement: 'prose prose-lg prose-slate',
  },
  {
    pattern: /prose prose-blue/g,
    replacement: 'prose prose-slate',
  },
  {
    pattern: /className="prose/g,
    replacement: 'className="prose prose-slate',
  },
];

function getAllFiles(dir, extension) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, extension));
    } else if (fullPath.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

function enhanceContrast() {
  console.log('🎨 Enhancing text contrast for maximum readability...\n');

  // Find all TypeScript/JavaScript files
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  let allFiles = [];

  for (const ext of extensions) {
    allFiles.push(...getAllFiles('./src', ext));
  }

  let totalFiles = 0;
  let totalReplacements = 0;

  for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    let fileReplacements = 0;

    // Apply additional color improvements
    for (const [oldColor, newColor] of Object.entries(additionalColorMap)) {
      const regex = new RegExp(`\\b${oldColor}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newColor);
        fileReplacements += matches.length;
      }
    }

    // Apply prose pattern improvements
    for (const pattern of prosePatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        content = content.replace(pattern.pattern, pattern.replacement);
        fileReplacements += matches.length;
      }
    }

    if (fileReplacements > 0) {
      fs.writeFileSync(file, content, 'utf-8');
      const relativePath = path.relative(process.cwd(), file);
      console.log(
        `✅ Enhanced ${fileReplacements} contrast issues in ${relativePath}`
      );
      totalFiles++;
      totalReplacements += fileReplacements;
    }
  }

  console.log(
    `\n🎯 Enhanced ${totalReplacements} additional contrast issues across ${totalFiles} files!`
  );
  console.log('📊 Improvements made:');
  console.log('   text-gray-700 → text-gray-900 (maximum darkness)');
  console.log('   prose-gray → prose-slate (better readability)');
  console.log('   Light colors → More visible variants');
}

enhanceContrast();
