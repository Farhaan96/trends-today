#!/usr/bin/env node

const CDPClient = require('../client.js');

async function debugSERP() {
  const client = new CDPClient();
  
  try {
    console.log('Connecting to Chrome...');
    await client.connect();
    
    console.log('Opening Google...');
    await client.open('https://www.google.com');
    
    console.log('Waiting for page to load...');
    await client.waitForLoad();
    
    // console.log('Taking screenshot...');
    // await client.screenshot('../../screenshots/debug-google-page.png');
    
    console.log('Getting page title...');
    const title = await client.getTitle();
    console.log('Page title:', title);
    
    console.log('Checking what search elements exist...');
    const searchElements = await client.evaluate(`
      const elements = [];
      const selectors = ['input[name="q"]', 'input[title="Search"]', 'textarea[name="q"]', '#APjFqb'];
      
      selectors.forEach(selector => {
        const el = document.querySelector(selector);
        elements.push({
          selector: selector,
          found: !!el,
          visible: el ? el.offsetWidth > 0 && el.offsetHeight > 0 : false,
          id: el ? el.id : null,
          name: el ? el.name : null,
          type: el ? el.type : null
        });
      });
      
      return elements;
    `);
    
    console.log('Search elements found:', JSON.stringify(searchElements, null, 2));
    
    // Try to find any input elements
    const allInputs = await client.evaluate(`
      const inputs = [];
      document.querySelectorAll('input, textarea').forEach(el => {
        inputs.push({
          tag: el.tagName,
          type: el.type,
          name: el.name,
          id: el.id,
          placeholder: el.placeholder,
          visible: el.offsetWidth > 0 && el.offsetHeight > 0
        });
      });
      return inputs.slice(0, 10); // First 10 inputs
    `);
    
    console.log('All input elements:', JSON.stringify(allInputs, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

debugSERP().catch(console.error);