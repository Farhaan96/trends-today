const fs = require('fs');
const file = process.argv[2];
const s = fs.readFileSync(file, 'utf8');
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (ch === '?') {
    console.log('index', i, 'cp', s.codePointAt(i).toString(16), 'next4', JSON.stringify(s.slice(i, i+4)));
    // show context
    console.log('context', JSON.stringify(s.slice(Math.max(0, i-5), i+10)));
    break;
  }
}
