const CDP = require('chrome-remote-interface');

class CDPClient {
  constructor(options = {}) {
    this.client = null;
    this.rateLimitMs = options.rateLimitMs || 400; // 400ms between actions
    this.defaultTimeoutMs = options.defaultTimeoutMs || 30000; // 30s default timeout
    this.lastActionTime = 0;
  }

  async connect(options = {}) {
    try {
      this.client = await CDP(options);
      const { Network, Page, Runtime, DOM } = this.client;

      // Enable required domains
      await Network.enable();
      await Page.enable();
      await Runtime.enable();
      await DOM.enable();

      // Store domain references for easy access
      this.Network = Network;
      this.Page = Page;
      this.Runtime = Runtime;
      this.DOM = DOM;

      console.log('CDP client connected successfully');
      return this.client;
    } catch (error) {
      throw new Error(`Failed to connect to Chrome: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  // Rate limiter - ensures minimum delay between actions
  async _rateLimit() {
    const now = Date.now();
    const timeSinceLastAction = now - this.lastActionTime;

    if (timeSinceLastAction < this.rateLimitMs) {
      const delay = this.rateLimitMs - timeSinceLastAction;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastActionTime = Date.now();
  }

  // Helper to execute JavaScript and return result
  async evaluate(jsCode, timeoutMs = this.defaultTimeoutMs) {
    if (!this.client) throw new Error('Not connected to Chrome');

    await this._rateLimit();

    try {
      const result = await Promise.race([
        this.client.Runtime.evaluate({
          expression: jsCode,
          awaitPromise: true,
          returnByValue: true,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Evaluation timeout')), timeoutMs)
        ),
      ]);

      if (result.exceptionDetails) {
        throw new Error(
          `JavaScript error: ${result.exceptionDetails.exception.description}`
        );
      }

      return result.result.value;
    } catch (error) {
      throw new Error(`Failed to evaluate JavaScript: ${error.message}`);
    }
  }

  // Navigate to URL
  async open(url, timeoutMs = this.defaultTimeoutMs) {
    if (!this.client) throw new Error('Not connected to Chrome');

    await this._rateLimit();

    try {
      await Promise.race([
        this.client.Page.navigate({ url }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Navigation timeout')), timeoutMs)
        ),
      ]);

      // Wait for load event
      await this.client.Page.loadEventFired();

      console.log(`Navigated to: ${url}`);
    } catch (error) {
      throw new Error(`Failed to navigate to ${url}: ${error.message}`);
    }
  }

  // Click element by selector
  async click(selector, timeoutMs = this.defaultTimeoutMs) {
    await this._rateLimit();

    const jsCode = `
      new Promise((resolve, reject) => {
        const element = document.querySelector('${selector}');
        if (!element) {
          reject(new Error('Element not found: ${selector}'));
          return;
        }
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait a bit for scroll, then click
        setTimeout(() => {
          try {
            element.click();
            resolve(true);
          } catch (error) {
            reject(new Error('Click failed: ' + error.message));
          }
        }, 500);
      })
    `;

    return await this.evaluate(jsCode, timeoutMs);
  }

  // Type text into element
  async type(selector, text, options = {}) {
    const { clearFirst = true } = options;
    await this._rateLimit();

    const jsCode = `
      new Promise((resolve, reject) => {
        const element = document.querySelector('${selector}');
        if (!element) {
          reject(new Error('Element not found: ${selector}'));
          return;
        }
        
        // Focus the element
        element.focus();
        
        // Clear if requested
        ${clearFirst ? 'element.value = "";' : ''}
        
        // Type the text
        element.value = '${text.replace(/'/g, "\\'")}';
        
        // Trigger input events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        resolve(true);
      })
    `;

    return await this.evaluate(jsCode);
  }

  // Wait for element to appear
  async waitForSelector(selector, options = {}) {
    const { timeoutMs = this.defaultTimeoutMs } = options;

    const jsCode = `
      new Promise((resolve, reject) => {
        const startTime = Date.now();
        const timeout = ${timeoutMs};
        
        function checkForElement() {
          const element = document.querySelector('${selector}');
          if (element) {
            resolve(true);
            return;
          }
          
          if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for selector: ${selector}'));
            return;
          }
          
          setTimeout(checkForElement, 100);
        }
        
        checkForElement();
      })
    `;

    return await this.evaluate(jsCode, timeoutMs + 1000);
  }

  // Get HTML content of element
  async getHTML(selector) {
    await this._rateLimit();

    const jsCode = `
      const element = document.querySelector('${selector}');
      element ? element.outerHTML : null;
    `;

    return await this.evaluate(jsCode);
  }

  // Get text content of element
  async getText(selector) {
    await this._rateLimit();

    const jsCode = `
      const element = document.querySelector('${selector}');
      element ? element.textContent.trim() : null;
    `;

    return await this.evaluate(jsCode);
  }

  // Get attribute value
  async getAttribute(selector, attribute) {
    await this._rateLimit();

    const jsCode = `
      const element = document.querySelector('${selector}');
      element ? element.getAttribute('${attribute}') : null;
    `;

    return await this.evaluate(jsCode);
  }

  // Take screenshot
  async screenshot(path = null) {
    if (!this.client) throw new Error('Not connected to Chrome');

    await this._rateLimit();

    try {
      const { data } = await this.client.Page.captureScreenshot({
        format: 'png',
        quality: 90,
      });

      if (path) {
        const fs = require('fs');
        fs.writeFileSync(path, Buffer.from(data, 'base64'));
        console.log(`Screenshot saved to: ${path}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to capture screenshot: ${error.message}`);
    }
  }

  // Wait for page to load
  async waitForLoad(timeoutMs = this.defaultTimeoutMs) {
    const jsCode = `
      new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true));
        }
      })
    `;

    return await this.evaluate(jsCode, timeoutMs);
  }

  // Get current page URL
  async getCurrentUrl() {
    return await this.evaluate('window.location.href');
  }

  // Get page title
  async getTitle() {
    return await this.evaluate('document.title');
  }

  // === Enhanced DOM Methods Using CDP DOM Domain ===

  // Get document root node
  async getDocument() {
    if (!this.DOM) throw new Error('Not connected to Chrome');

    await this._rateLimit();

    try {
      const { root } = await this.DOM.getDocument();
      return root;
    } catch (error) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  // Query element using DOM.querySelector (proper CDP method)
  async domQuerySelector(selector, contextNodeId = null) {
    if (!this.DOM) throw new Error('Not connected to Chrome');

    await this._rateLimit();

    try {
      // Get document root if no context provided
      if (!contextNodeId) {
        const document = await this.getDocument();
        contextNodeId = document.nodeId;
      }

      const result = await this.DOM.querySelector({
        nodeId: contextNodeId,
        selector: selector,
      });

      return result.nodeId;
    } catch (error) {
      throw new Error(
        `Failed to query selector "${selector}": ${error.message}`
      );
    }
  }

  // Query all elements using DOM.querySelectorAll
  async domQuerySelectorAll(selector, contextNodeId = null) {
    if (!this.DOM) throw new Error('Not connected to Chrome');

    await this._rateLimit();

    try {
      // Get document root if no context provided
      if (!contextNodeId) {
        const document = await this.getDocument();
        contextNodeId = document.nodeId;
      }

      const result = await this.DOM.querySelectorAll({
        nodeId: contextNodeId,
        selector: selector,
      });

      return result.nodeIds;
    } catch (error) {
      throw new Error(
        `Failed to query all selectors "${selector}": ${error.message}`
      );
    }
  }

  // Get element's outer HTML using DOM.getOuterHTML
  async domGetOuterHTML(nodeId) {
    if (!this.DOM) throw new Error('Not connected to Chrome');

    await this._rateLimit();

    try {
      const result = await this.DOM.getOuterHTML({ nodeId });
      return result.outerHTML;
    } catch (error) {
      throw new Error(
        `Failed to get outer HTML for node ${nodeId}: ${error.message}`
      );
    }
  }

  // Get element attributes using DOM.getAttributes
  async domGetAttributes(nodeId) {
    if (!this.DOM) throw new Error('Not connected to Chrome');

    await this._rateLimit();

    try {
      const result = await this.DOM.getAttributes({ nodeId });

      // Convert array format [name1, value1, name2, value2] to object
      const attributes = {};
      for (let i = 0; i < result.attributes.length; i += 2) {
        const name = result.attributes[i];
        const value = result.attributes[i + 1];
        attributes[name] = value;
      }

      return attributes;
    } catch (error) {
      throw new Error(
        `Failed to get attributes for node ${nodeId}: ${error.message}`
      );
    }
  }

  // Extract text content from node using Runtime.callFunctionOn
  async domGetTextContent(nodeId) {
    if (!this.Runtime) throw new Error('Not connected to Chrome');

    await this._rateLimit();

    try {
      const result = await this.Runtime.callFunctionOn({
        objectId: nodeId,
        functionDeclaration: 'function() { return this.textContent; }',
        returnByValue: true,
      });

      return result.result.value;
    } catch (error) {
      // Fallback to evaluate method
      try {
        return await this.evaluate(`
          document.querySelector('[data-node-id="${nodeId}"]')?.textContent || ''
        `);
      } catch (fallbackError) {
        throw new Error(
          `Failed to get text content for node ${nodeId}: ${error.message}`
        );
      }
    }
  }

  // Enhanced element extraction method combining multiple approaches
  async extractElements(selectors, options = {}) {
    const {
      includeAttributes = true,
      includeText = true,
      maxElements = 50,
    } = options;

    await this._rateLimit();

    const results = [];

    // Try each selector
    for (const selector of selectors) {
      try {
        const nodeIds = await this.domQuerySelectorAll(selector);

        for (const nodeId of nodeIds.slice(0, maxElements)) {
          try {
            const element = { selector, nodeId };

            if (includeAttributes) {
              element.attributes = await this.domGetAttributes(nodeId);
            }

            if (includeText) {
              // Use fallback method for text content
              element.textContent = await this.evaluate(`
                (function() {
                  const elements = document.querySelectorAll('${selector}');
                  for (let el of elements) {
                    if (el) return el.textContent?.trim() || '';
                  }
                  return '';
                })();
              `);
            }

            results.push(element);
          } catch (elementError) {
            // Continue with next element if one fails
            continue;
          }
        }

        // If we found elements with this selector, return results
        if (results.length > 0) {
          break;
        }
      } catch (selectorError) {
        // Continue with next selector if this one fails
        continue;
      }
    }

    return results;
  }
}

module.exports = CDPClient;
