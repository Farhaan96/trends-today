// Generate timestamp-based filename for new Anunnaki image
const now = new Date();
const timestamp = now.getTime();
const filename = `ai-generated-anunnaki-${timestamp}.png`;
const localPath = `/images/ai-generated/${filename}`;

console.log('New image details:');
console.log(`Timestamp: ${timestamp}`);
console.log(`Filename: ${filename}`);
console.log(`Local path: ${localPath}`);
console.log(`Current date: ${now.toISOString()}`);

// For the article update
console.log('\nFor frontmatter update:');
console.log(`image: ${localPath}`);
console.log(`imageAlt: Ancient Sumerian clay tablets with cuneiform script and archaeological artifacts depicting Anunnaki mythology in scholarly presentation`);