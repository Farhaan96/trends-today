const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(res);
    } else if (res.endsWith('.md') || res.endsWith('.mdx')) {
      yield res;
    }
  }
}

let failed = 0;
for (const file of walk(path.join(process.cwd(), 'content'))) {
  const src = fs.readFileSync(file, 'utf8');
  try {
    matter(src);
  } catch (e) {
    failed++;
    console.error(
      `YAML error in ${path.relative(process.cwd(), file)}: ${e.message}`
    );
  }
}
if (failed) {
  console.error(`\nTotal files with YAML errors: ${failed}`);
  process.exit(1);
} else {
  console.log('All frontmatter parsed successfully.');
}
