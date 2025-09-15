const { AIImageGenerator } = require('./utils/ai-image-generator');

async function generateAnunnakiImage() {
  const generator = new AIImageGenerator();

  try {
    const result = await generator.generateFromArticle('C:\\Users\\farha\\OneDrive\\Desktop\\Blog\\content\\science\\anunnaki-sumerian-gods-mystery.mdx');

    console.log('\n✅ Image Generation Complete:');
    console.log(`Filename: ${result.filename}`);
    console.log(`Local path: ${result.localPath}`);
    console.log(`Cost: $${result.cost}`);
    console.log(`Topics: ${result.extractedTopics.slice(0, 3).join(', ')}`);
    console.log(`Technologies: ${result.extractedTech.slice(0, 3).join(', ')}`);
    console.log(`Statistics: ${result.extractedStats.slice(0, 2).join(', ')}`);

    return result.localPath;
  } catch (error) {
    console.error('Failed to generate image:', error.message);
    return null;
  }
}

generateAnunnakiImage().then(imagePath => {
  if (imagePath) {
    console.log(`\nImage successfully generated at: ${imagePath}`);
  }
  process.exit(0);
});