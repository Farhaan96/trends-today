#!/usr/bin/env node

const CDPClient = require('../client.js');

async function simpleTest() {
  const client = new CDPClient();
  
  try {
    console.log('✓ Connecting to Chrome...');
    await client.connect();
    
    console.log('✓ Opening Google...');
    await client.open('https://www.google.com');
    
    console.log('✓ Getting page title:', await client.getTitle());
    
    console.log('✓ Typing search query...');
    await client.type('input[name="q"]', 'site:reddit.com best budget earbuds 2025');
    
    console.log('✓ Submitting search...');
    await client.evaluate('document.querySelector("input[name=\\"q\\"]").form.submit()');
    
    console.log('✓ Waiting 3 seconds for results...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✓ Current URL:', await client.getCurrentUrl());
    console.log('✓ Page title:', await client.getTitle());
    
    console.log('✓ SUCCESS! Search completed - you should see results in Chrome browser');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

simpleTest().catch(console.error);