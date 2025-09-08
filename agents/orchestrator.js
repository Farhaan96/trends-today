#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class AgentOrchestrator {
  constructor() {
    this.agentsDir = path.join(__dirname);
    this.reportDir = path.join(__dirname, '..', 'reports');
    
    // Define agent execution pipeline
    this.agentPipeline = {
      // Emergency fixes (run immediately)
      emergency: [
        { name: 'link-healer', description: 'Fix broken links and 404 errors', priority: 'CRITICAL' },
        { name: 'image-hunter', description: 'Replace placeholder images', priority: 'CRITICAL' },
        { name: 'content-refresher', description: 'Update stale content', priority: 'HIGH' }
      ],
      
      // Quality enhancement (run after fixes)
      enhancement: [
        { name: 'trust-builder', description: 'Add credibility signals', priority: 'HIGH' },
        { name: 'quality-check', description: 'Validate content quality', priority: 'MEDIUM' }
      ],
      
      // Content generation (run for new opportunities)
      generation: [
        { name: 'news-scanner', description: 'Find trending topics', priority: 'MEDIUM' },
        { name: 'seo-finder', description: 'Discover SEO opportunities', priority: 'MEDIUM' },
        { name: 'product-tracker', description: 'Track product updates', priority: 'MEDIUM' },
        { name: 'content-creator', description: 'Generate new content', priority: 'LOW' }
      ]
    };
    
    this.executionResults = [];
    this.errors = [];
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.reportDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  async runAgent(agentName) {
    return new Promise((resolve, reject) => {
      console.log(`🤖 Running ${agentName}...`);
      const startTime = Date.now();
      
      const agentPath = path.join(this.agentsDir, `${agentName}.js`);
      const agentProcess = spawn('node', [agentPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.join(__dirname, '..')
      });

      let stdout = '';
      let stderr = '';

      agentProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        // Show real-time output
        process.stdout.write(`[${agentName}] ${output}`);
      });

      agentProcess.stderr.on('data', (data) => {
        const errorOutput = data.toString();
        stderr += errorOutput;
        console.error(`[${agentName} ERROR] ${errorOutput}`);
      });

      agentProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        const result = {
          agent: agentName,
          exitCode: code,
          duration: duration,
          stdout: stdout,
          stderr: stderr,
          timestamp: new Date().toISOString(),
          success: code === 0
        };

        if (code === 0) {
          console.log(`✅ ${agentName} completed successfully (${duration}ms)`);
          resolve(result);
        } else {
          console.log(`❌ ${agentName} failed with code ${code} (${duration}ms)`);
          reject(result);
        }
      });

      agentProcess.on('error', (error) => {
        console.error(`Failed to start ${agentName}:`, error.message);
        reject({
          agent: agentName,
          error: error.message,
          timestamp: new Date().toISOString(),
          success: false
        });
      });
    });
  }

  async runPipeline(pipelineName) {
    console.log(`\n🚀 Running ${pipelineName.toUpperCase()} pipeline...`);
    const pipeline = this.agentPipeline[pipelineName];
    
    if (!pipeline) {
      throw new Error(`Unknown pipeline: ${pipelineName}`);
    }

    const results = [];
    
    for (const agentConfig of pipeline) {
      try {
        const result = await this.runAgent(agentConfig.name);
        results.push(result);
        this.executionResults.push(result);
        
        // Small delay between agents
        await this.delay(1000);
        
      } catch (error) {
        console.error(`Pipeline interrupted by ${agentConfig.name} failure`);
        this.errors.push(error);
        
        // Continue with next agent unless it's critical
        if (agentConfig.priority === 'CRITICAL') {
          console.log('⚠️ Critical agent failed - continuing with caution');
        }
        
        results.push(error);
      }
    }
    
    return results;
  }

  async runFullOrchestration() {
    console.log('\n🎯 MASTER ORCHESTRATOR - Full Site Automation');
    console.log('Running complete agent ecosystem...\n');
    
    const orchestrationStart = Date.now();
    
    try {
      // Phase 1: Emergency fixes
      console.log('\n' + '='.repeat(60));
      console.log('PHASE 1: EMERGENCY FIXES');
      console.log('='.repeat(60));
      await this.runPipeline('emergency');
      
      // Phase 2: Quality enhancement  
      console.log('\n' + '='.repeat(60));
      console.log('PHASE 2: QUALITY ENHANCEMENT');
      console.log('='.repeat(60));
      await this.runPipeline('enhancement');
      
      // Phase 3: Content generation
      console.log('\n' + '='.repeat(60));
      console.log('PHASE 3: CONTENT GENERATION');
      console.log('='.repeat(60));
      await this.runPipeline('generation');
      
      const totalDuration = Date.now() - orchestrationStart;
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 ORCHESTRATION COMPLETE');
      console.log('='.repeat(60));
      console.log(`Total execution time: ${(totalDuration / 1000).toFixed(2)}s`);
      
      await this.generateOrchestrationReport(totalDuration);
      
    } catch (error) {
      console.error('Orchestration failed:', error.message);
      await this.generateOrchestrationReport(Date.now() - orchestrationStart, error);
    }
  }

  async runMaintenanceCycle() {
    console.log('\n🔄 MAINTENANCE CYCLE - Daily Operations');
    console.log('Running essential maintenance agents...\n');
    
    const maintenanceAgents = [
      'link-healer',
      'content-refresher', 
      'quality-check'
    ];
    
    for (const agentName of maintenanceAgents) {
      try {
        await this.runAgent(agentName);
        await this.delay(2000); // 2 second delay between maintenance agents
      } catch (error) {
        console.log(`⚠️ Maintenance agent ${agentName} had issues - continuing`);
      }
    }
    
    console.log('\n✅ Maintenance cycle completed');
  }

  async runDiscoveryCycle() {
    console.log('\n🔍 DISCOVERY CYCLE - Finding New Opportunities');
    console.log('Running content discovery agents...\n');
    
    const discoveryAgents = [
      'news-scanner',
      'seo-finder',
      'product-tracker'
    ];
    
    for (const agentName of discoveryAgents) {
      try {
        await this.runAgent(agentName);
        await this.delay(3000); // 3 second delay for API rate limiting
      } catch (error) {
        console.log(`⚠️ Discovery agent ${agentName} had issues - continuing`);
      }
    }
    
    console.log('\n✅ Discovery cycle completed');
  }

  async runContentCreationCycle() {
    console.log('\n✨ CONTENT CREATION CYCLE - Generating Articles');
    console.log('Running content creation pipeline...\n');
    
    try {
      // First discover opportunities
      await this.runAgent('news-scanner');
      await this.delay(2000);
      
      // Then create content
      await this.runAgent('content-creator');
      await this.delay(2000);
      
      // Finally validate quality
      await this.runAgent('quality-check');
      
    } catch (error) {
      console.log('⚠️ Content creation cycle had issues');
    }
    
    console.log('\n✅ Content creation cycle completed');
  }

  async runBatchContent() {
    console.log('\n📦 BATCH CONTENT - 5 Premium Articles');
    console.log('Generating 5 high-quality articles with full quality gates...\n');
    
    const batchStart = Date.now();
    const maxBatchTime = 90 * 60 * 1000; // 90 minutes in milliseconds
    
    try {
      // Step 1: Discover opportunities
      console.log('🔍 Step 1: Topic Discovery');
      await this.runAgent('news-scanner');
      await this.delay(3000);
      
      // Step 2: Generate 5 articles
      console.log('✍️ Step 2: Content Creation (5 articles)');
      await this.runAgent('content-creator');
      await this.delay(5000);
      
      // Step 3: Quality validation
      console.log('🔍 Step 3: Quality Validation');
      await this.runAgent('quality-check');
      await this.delay(2000);
      
      // Step 4: Enhancement phase
      console.log('✨ Step 4: Content Enhancement');
      await this.runAgent('image-hunter');
      await this.delay(3000);
      await this.runAgent('trust-builder');
      
      const batchDuration = Date.now() - batchStart;
      
      if (batchDuration > maxBatchTime) {
        console.log('⚠️ Batch exceeded 90-minute limit');
      }
      
      console.log(`\n✅ Batch completed in ${(batchDuration / 1000 / 60).toFixed(1)} minutes`);
      
    } catch (error) {
      console.log('⚠️ Batch content generation had issues');
      throw error;
    }
  }

  async runMorningBatch() {
    console.log('\n🌅 MORNING BATCH - Breaking News & Trending Topics');
    console.log('Focus: 2 news + 2 reviews + 1 guide (5 total)\n');
    
    // Set environment variable for content focus
    process.env.BATCH_FOCUS = 'morning';
    process.env.CONTENT_MIX = 'news:2,reviews:2,guides:1';
    
    await this.runBatchContent();
  }

  async runMiddayBatch() {
    console.log('\n☀️ MIDDAY BATCH - Deep Dives & Comparisons');
    console.log('Focus: 3 reviews + 1 comparison + 1 buying guide (5 total)\n');
    
    // Set environment variable for content focus  
    process.env.BATCH_FOCUS = 'midday';
    process.env.CONTENT_MIX = 'reviews:3,comparisons:1,guides:1';
    
    await this.runBatchContent();
  }

  async runEveningBatch() {
    console.log('\n🌆 EVENING BATCH - Analysis & Evergreen Content');
    console.log('Focus: 2 analysis + 2 niche reviews + 1 how-to (5 total)\n');
    
    // Set environment variable for content focus
    process.env.BATCH_FOCUS = 'evening'; 
    process.env.CONTENT_MIX = 'analysis:2,reviews:2,how-to:1';
    
    await this.runBatchContent();
  }

  async runEnhancementCycle() {
    console.log('\n✨ ENHANCEMENT CYCLE - Polish & Trust Signals');
    console.log('Adding images, trust signals, and final quality checks...\n');
    
    try {
      // Image enhancement
      await this.runAgent('image-hunter');
      await this.delay(3000);
      
      // Trust signal enhancement
      await this.runAgent('trust-builder');
      await this.delay(2000);
      
      // Final quality validation
      await this.runAgent('quality-check');
      
      console.log('\n✅ Enhancement cycle completed');
      
    } catch (error) {
      console.log('⚠️ Enhancement cycle had issues');
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateOrchestrationReport(totalDuration, error = null) {
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: totalDuration,
      success: !error && this.errors.length === 0,
      error: error?.message || null,
      executionResults: this.executionResults,
      errors: this.errors,
      summary: {
        totalAgents: this.executionResults.length,
        successfulAgents: this.executionResults.filter(r => r.success).length,
        failedAgents: this.executionResults.filter(r => !r.success).length,
        averageDuration: this.executionResults.length > 0 
          ? (this.executionResults.reduce((sum, r) => sum + (r.duration || 0), 0) / this.executionResults.length)
          : 0
      }
    };

    const reportFile = path.join(this.reportDir, 'orchestration-report.json');
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📋 ORCHESTRATION REPORT');
    console.log('='.repeat(50));
    console.log(`⏱️  Total duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`✅ Successful agents: ${report.summary.successfulAgents}`);
    console.log(`❌ Failed agents: ${report.summary.failedAgents}`);
    console.log(`📊 Average agent duration: ${(report.summary.averageDuration / 1000).toFixed(2)}s`);
    console.log(`📄 Report saved: ${reportFile}`);
    
    if (this.executionResults.length > 0) {
      console.log('\n🤖 Agent Results:');
      this.executionResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        const duration = result.duration ? `(${(result.duration / 1000).toFixed(2)}s)` : '';
        console.log(`  ${status} ${result.agent} ${duration}`);
      });
    }
    
    return report;
  }

  async run() {
    const command = process.argv[2] || 'full';
    
    await this.ensureDirectories();
    
    switch (command) {
      case 'full':
        await this.runFullOrchestration();
        break;
        
      case 'emergency':
        await this.runPipeline('emergency');
        break;
        
      case 'maintenance':
        await this.runMaintenanceCycle();
        break;
        
      case 'discovery':
        await this.runDiscoveryCycle();
        break;
        
      case 'content':
        await this.runContentCreationCycle();
        break;
        
      case 'batch':
        await this.runBatchContent();
        break;
        
      case 'morning':
        await this.runMorningBatch();
        break;
        
      case 'midday':
        await this.runMiddayBatch();
        break;
        
      case 'evening':
        await this.runEveningBatch();
        break;
        
      case 'enhance':
        await this.runEnhancementCycle();
        break;
        
      default:
        console.log(`Usage: node orchestrator.js [command]
        
Commands:
  full          - Run complete orchestration (default)
  emergency     - Run emergency fixes only
  maintenance   - Run daily maintenance cycle
  discovery     - Run content discovery cycle
  content       - Run content creation cycle
  batch         - Generate 5 premium articles with quality gates
  morning       - Morning batch: 2 news + 2 reviews + 1 guide
  midday        - Midday batch: 3 reviews + 1 comparison + 1 guide  
  evening       - Evening batch: 2 analysis + 2 reviews + 1 how-to
  enhance       - Enhancement cycle: images + trust signals + QA`);
        process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const orchestrator = new AgentOrchestrator();
  orchestrator.run().catch(console.error);
}

module.exports = { AgentOrchestrator };