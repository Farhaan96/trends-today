const fs = require('fs');
const file = process.argv[2];
const s = fs.readFileSync(file, 'utf8');
for (let i = 0; i < s.length - 1; i++) {
  const a = s.codePointAt(i);
  const b = s[i + 1];
  if (a === 0x3f && b === 'T') {
    console.log(
      'Found ?T at',
      i,
      'context',
      JSON.stringify(s.slice(Math.max(0, i - 10), i + 10))
    );
  }
  if (a === 0x3f && s[i + 1] === 'o') {
    console.log(
      'Found ?o at',
      i,
      'context',
      JSON.stringify(s.slice(Math.max(0, i - 10), i + 10))
    );
  }
  if (a === 0x3f && s[i + 1] === '\\' && s[i + 2] === '"') {
    console.log(
      'Found ?\" at',
      i,
      'context',
      JSON.stringify(s.slice(Math.max(0, i - 10), i + 10))
    );
  }
}
