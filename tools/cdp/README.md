# Chrome DevTools Protocol (CDP) Client

This directory contains tools for controlling Chrome programmatically using the Chrome DevTools Protocol.

## Prerequisites

1. **Chrome/Chromium**: Ensure you have Google Chrome or Chromium installed
2. **Node.js**: Version 18+ required
3. **Dependencies**: `chrome-remote-interface` (automatically installed)

## Setup

### 1. Launch Chrome with Remote Debugging

Chrome must be started with remote debugging enabled. Use the appropriate command for your operating system:

#### Windows

**Option 1: Minimal flags (Recommended)**

```bash
# Using PowerShell (cleanest approach)
Start-Process -FilePath "chrome.exe" -ArgumentList "--remote-debugging-port=9222"

# Or using CMD
chrome.exe --remote-debugging-port=9222
```

**Option 2: Separate profile (if you want to keep your main Chrome separate)**

```bash
# Create a separate debug profile
chrome.exe --remote-debugging-port=9222 --user-data-dir=C:\temp\chrome-debug

# Or with PowerShell
Start-Process -FilePath "chrome.exe" -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=C:\temp\chrome-debug"
```

**Option 3: Full path if Chrome is not in PATH**

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

**⚠️ Important**: Using too many flags can trigger Chrome's "unsupported command line" warning and change the behavior. The minimal approach works best.

#### macOS

```bash
# Standard Chrome installation
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug --no-first-run --no-default-browser-check

# Background process
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug --no-first-run --no-default-browser-check &
```

#### Linux

```bash
# Ubuntu/Debian
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug --no-first-run --no-default-browser-check

# CentOS/RHEL
google-chrome-stable --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug --no-first-run --no-default-browser-check

# Chromium
chromium-browser --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug --no-first-run --no-default-browser-check

# Background process
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug --no-first-run --no-default-browser-check &
```

### 2. Verify Chrome is Running

After launching Chrome with remote debugging, verify it's working:

1. Chrome should open a new browser window/instance
2. Navigate to: `http://localhost:9222/json/version` in any browser
3. You should see JSON output with Chrome version information

### 3. Important Flags Explained

- `--remote-debugging-port=9222`: Enables remote debugging on port 9222
- `--user-data-dir=<path>`: Uses a separate profile directory (prevents conflicts)
- `--no-first-run`: Skips first-run setup dialogs
- `--no-default-browser-check`: Prevents default browser prompts

## Usage

### Basic Client Usage

```javascript
const CDPClient = require('./client.js');

async function example() {
  const client = new CDPClient();

  try {
    // Connect to Chrome
    await client.connect();

    // Navigate to a page
    await client.open('https://example.com');

    // Wait for an element
    await client.waitForSelector('h1');

    // Get page title
    const title = await client.getTitle();
    console.log('Title:', title);

    // Take a screenshot
    await client.screenshot('screenshot.png');
  } finally {
    await client.disconnect();
  }
}
```

### Available Methods

- `connect(options)` - Connect to Chrome
- `disconnect()` - Close connection
- `open(url, timeoutMs)` - Navigate to URL
- `evaluate(jsCode, timeoutMs)` - Execute JavaScript
- `click(selector, timeoutMs)` - Click element
- `type(selector, text, options)` - Type into input field
- `waitForSelector(selector, options)` - Wait for element
- `getHTML(selector)` - Get element HTML
- `getText(selector)` - Get element text
- `getAttribute(selector, attribute)` - Get attribute value
- `screenshot(path)` - Capture screenshot
- `waitForLoad(timeoutMs)` - Wait for page load
- `getCurrentUrl()` - Get current URL
- `getTitle()` - Get page title

### Rate Limiting

The client includes built-in rate limiting (400ms between actions by default) to prevent overwhelming websites and maintain stability.

```javascript
// Customize rate limiting
const client = new CDPClient({
  rateLimitMs: 500, // 500ms between actions
  defaultTimeoutMs: 20000, // 20s default timeout
});
```

## Examples

See the `examples/` directory for complete usage examples:

- `collect-serp-v2.js` - Enhanced Google SERP data collection with 2024-compatible selectors
- `collect-serp.js` - Basic Google SERP data collection
- `working-serp.js` - Working Reddit search example
- `simple-test.js` - Basic functionality test
- `debug-serp.js` - Debugging and troubleshooting helper

### Running SERP Collector v2

```bash
# Test with any search query
node examples/collect-serp-v2.js "your search query here"

# Example: Reddit search
node examples/collect-serp-v2.js "site:reddit.com best budget earbuds 2025"
```

## Troubleshooting

### Chrome Won't Start

- Ensure Chrome is properly installed
- Try a different user data directory path
- Check if port 9222 is already in use: `netstat -an | grep 9222`

### Connection Refused

- Verify Chrome is running with the correct flags
- Check if `http://localhost:9222/json/version` returns JSON
- Ensure no firewall is blocking port 9222

### JavaScript Errors

- Use `client.evaluate()` to test JavaScript in the browser console
- Check for timing issues - add waits before interacting with elements
- Verify selectors are correct using browser dev tools

### Performance Issues

- Increase rate limiting delay for slower websites (v2 uses 600ms for better stealth)
- Add explicit waits for dynamic content
- Use `waitForSelector()` before interacting with elements

### Google SERP Collection Issues

- **Consent Dialogs**: The v2 collector handles consent dialogs automatically
- **No Results**: Try direct URL navigation instead of typing searches
- **Anti-bot Detection**: Use slower rate limiting (600ms+) and minimal Chrome flags
- **Missing Snippets**: Some Google layouts don't include snippet data consistently
- **Stealth Mode**: Minimal flags (`--remote-debugging-port=9222` only) work best to avoid detection

### Best Practices for Web Scraping

- Use appropriate delays between requests (600ms+ for search engines)
- Handle consent dialogs and cookie notices automatically
- Test with multiple search queries to ensure selector robustness
- Navigate directly to search URLs rather than typing when possible
- Always clean up connections in finally blocks

## Security Notes

- The remote debugging feature should only be used in development/testing environments
- Never expose port 9222 to external networks
- Use a separate Chrome profile (`--user-data-dir`) to avoid interfering with your regular browsing
- Close the debugging Chrome instance when finished to free resources
