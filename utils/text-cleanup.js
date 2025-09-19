/**
 * Text Cleanup Utilities
 * Fixes common formatting issues from AI content generation
 * Specifically handles em dashes, bold markers, and spacing issues
 */

class TextCleanup {
  static cleanText(content) {
    let cleaned = content;

    // Remove em dashes and convert to proper punctuation
    // Replace em dashes with periods or commas based on context
    cleaned = cleaned.replace(/\s*—\s*/g, '. ');

    // Remove regular dashes used for emphasis/asides and convert to better punctuation
    // Pattern: word - word or phrase - continuing sentence
    cleaned = cleaned.replace(/\s+[-–]\s+/g, '. ');

    // Clean up double periods that might result
    cleaned = cleaned.replace(/\.\s*\.\s*/g, '. ');

    // Fix combined bold markers like ****text** -> **text**
    cleaned = cleaned.replace(/\*{4,}([^*]*)\*{2,}/g, '**$1**');

    // Fix bold markers with missing spaces like **text****other** -> **text** **other**
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*(\*{2,})/g, '**$1** ');

    // Fix cases like **Only **34%**** -> **Only 34%**
    cleaned = cleaned.replace(/\*\*([^*]*?)\s+\*\*(\d+%)\*{4,}/g, '**$1 $2**');

    // Fix cases where percentage signs get wrapped incorrectly: ****63%** -> **63%**
    cleaned = cleaned.replace(/\*{4,}(\d+%)\*{2}/g, '**$1**');

    // Fix missing spaces between words that got combined (basic heuristic)
    // Look for lowercase letter followed by uppercase letter
    cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Fix multiple spaces
    cleaned = cleaned.replace(/\s{2,}/g, ' ');

    // Fix trailing spaces at end of lines
    cleaned = cleaned.replace(/\s+$/gm, '');

    return cleaned;
  }

  static cleanBoldMarkers(content) {
    let cleaned = content;

    // Fix quadruple asterisks and more: ****text** -> **text**
    cleaned = cleaned.replace(/\*{4,}([^*]*?)\*{2}/g, '**$1**');

    // Fix cases like ****63%** of companies** -> **63% of companies**
    cleaned = cleaned.replace(
      /\*{4,}([^*]*?)\*{2}\s+([^*]*?)\*{2}/g,
      '**$1 $2**'
    );

    // Fix standalone quadruple asterisks: ****55%**** -> **55%**
    cleaned = cleaned.replace(/\*{4,}([^*]*?)\*{4,}/g, '**$1**');

    return cleaned;
  }

  static fixSpacing(content) {
    let cleaned = content;

    // Fix missing spaces before percentages in sentences
    cleaned = cleaned.replace(/([a-z])(\d+%)/gi, '$1 $2');

    // Fix missing spaces after bold text
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*([a-z])/gi, '**$1** $2');

    // Fix missing spaces between numbers and words
    cleaned = cleaned.replace(/(\d+)([a-z])/gi, '$1 $2');

    return cleaned;
  }

  static validateBoldMarkdown(content) {
    const issues = [];

    // Check for unmatched bold markers
    const boldMarkers = content.match(/\*\*/g) || [];
    if (boldMarkers.length % 2 !== 0) {
      issues.push('Unmatched bold markers found');
    }

    // Check for excessive asterisks
    const excessiveAsterisks = content.match(/\*{3,}/g) || [];
    if (excessiveAsterisks.length > 0) {
      issues.push(
        `Found ${excessiveAsterisks.length} instances of excessive asterisks`
      );
    }

    // Check for em dashes
    const emDashes = content.match(/—/g) || [];
    if (emDashes.length > 0) {
      issues.push(`Found ${emDashes.length} em dashes that should be replaced`);
    }

    return issues;
  }

  static cleanArticleContent(articleContent) {
    // Apply all cleanup functions in sequence
    let cleaned = articleContent;

    // Step 1: Fix bold markers
    cleaned = this.cleanBoldMarkers(cleaned);

    // Step 2: Fix general text issues
    cleaned = this.cleanText(cleaned);

    // Step 3: Fix spacing issues
    cleaned = this.fixSpacing(cleaned);

    return cleaned;
  }

  static getCleanupReport(originalContent, cleanedContent) {
    const originalIssues = this.validateBoldMarkdown(originalContent);
    const cleanedIssues = this.validateBoldMarkdown(cleanedContent);

    return {
      originalIssueCount: originalIssues.length,
      cleanedIssueCount: cleanedIssues.length,
      issuesFixed: originalIssues.length - cleanedIssues.length,
      remainingIssues: cleanedIssues,
      changes: originalContent !== cleanedContent,
    };
  }
}

module.exports = { TextCleanup };
