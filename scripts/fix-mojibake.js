const fs = require('fs');
const path = require('path');

const root = process.cwd();
const contentDir = path.join(root, 'content');

// Map of common mojibake sequences -> proper punctuation
const replacements = [
  { from: /\uFFFD\?T/g, to: '’' }, // Christie�?Ts -> Christie’s
  { from: /\uFFFD\?o/g, to: '“' }, // �?o -> “
  { from: /\uFFFD\?\?/g, to: '”' }, // �?? -> ”
  { from: /\uFFFD\\\"/g, to: '—' }, // �?\" -> — (em dash)
  { from: /\uFFFD\?"/g, to: '—' }, // fallback variant
  { from: /\uFFFD/g, to: '—' }, // any stray replacement char -> em dash as a safe default
];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (p.endsWith('.mdx') || p.endsWith('.md')) yield p;
  }
}

let changed = 0;
for (const file of walk(contentDir)) {
  let src = fs.readFileSync(file, 'utf8');
  let out = src;
  for (const { from, to } of replacements) {
    out = out.replace(from, to);
  }
  if (out !== src) {
    fs.writeFileSync(file, out, 'utf8');
    console.log('Fixed mojibake in', path.relative(root, file));
    changed++;
  }
}

if (!changed) {
  console.log('No mojibake sequences found.');
}
