const fs = require('fs');
const path = require('path');

// Simple script to check if we have any existing content about Parker Solar Probe
const contentDir = path.join(__dirname, 'content');

function searchForTopic(searchTerm) {
    const results = [];

    function searchInDir(dir) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                searchInDir(filePath);
            } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const lowerContent = content.toLowerCase();
                    const lowerSearch = searchTerm.toLowerCase();

                    if (lowerContent.includes(lowerSearch) ||
                        lowerContent.includes('parker solar probe') ||
                        lowerContent.includes('parker probe') ||
                        lowerContent.includes('nasa sun mission') ||
                        lowerContent.includes('solar probe')) {
                        results.push({
                            file: filePath,
                            matches: true,
                            snippet: content.substring(0, 200) + '...'
                        });
                    }
                } catch (err) {
                    // Skip files that can't be read
                }
            }
        });
    }

    if (fs.existsSync(contentDir)) {
        searchInDir(contentDir);
    }

    return results;
}

// Check for Parker Solar Probe coverage
const results = searchForTopic('parker solar probe');

console.log('=== DUPLICATE CHECK: Parker Solar Probe ===');
console.log(`Found ${results.length} potential matches:`);

if (results.length === 0) {
    console.log('✅ NO DUPLICATES FOUND - Topic is safe to proceed!');
} else {
    console.log('❌ POTENTIAL DUPLICATES FOUND:');
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.file}`);
        console.log(`   Snippet: ${result.snippet}`);
        console.log('');
    });
}