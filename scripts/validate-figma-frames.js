#!/usr/bin/env node

/**
 * Figma Frame Validation Script
 *
 * This script helps validate that all mapped Figma frames still exist
 * by generating clickable URLs and checking for common issues.
 *
 * Usage:
 *   node scripts/validate-figma-frames.js
 *
 * Or with npm:
 *   npm run validate:figma
 */

const fs = require('fs');
const path = require('path');

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load frame mapping
const mappingPath = path.join(__dirname, '../docs/figma/frame-node-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

log('\n═══════════════════════════════════════════════════════', 'cyan');
log('           FIGMA FRAME VALIDATION', 'bright');
log('═══════════════════════════════════════════════════════\n', 'cyan');

log(`Figma File: ${mapping.fileName}`, 'bright');
log(`File Key: ${mapping.fileKey}`);
log(`Total Frames: ${mapping.totalFrames}`);
log(`Last Updated: ${mapping.lastUpdated}\n`);

// Categorize frames by status
const framesByStatus = {
  verified: [],
  updated: [],
  pending: [],
};

mapping.frames.forEach((frame) => {
  framesByStatus[frame.status].push(frame);
});

// Display statistics
log('STATUS SUMMARY', 'bright');
log('───────────────────────────────────────────────────────', 'cyan');
log(`✅ Verified:  ${framesByStatus.verified.length.toString().padStart(2)} frames (${((framesByStatus.verified.length / mapping.totalFrames) * 100).toFixed(1)}%)`, 'green');
log(`⚠️  Updated:   ${framesByStatus.updated.length.toString().padStart(2)} frames (${((framesByStatus.updated.length / mapping.totalFrames) * 100).toFixed(1)}%)`, 'yellow');
log(`⏳ Pending:   ${framesByStatus.pending.length.toString().padStart(2)} frames (${((framesByStatus.pending.length / mapping.totalFrames) * 100).toFixed(1)}%)`, 'yellow');
log(`────────────────────────────────────────────────────────`, 'cyan');
log(`📊 Total:     ${mapping.totalFrames} frames\n`, 'bright');

// Check for issues
const issues = [];

// Issue 1: Check for duplicate node IDs
const nodeIdCount = {};
mapping.frames.forEach((frame) => {
  const nodeId = frame.nodeId;
  if (!nodeIdCount[nodeId]) {
    nodeIdCount[nodeId] = [];
  }
  nodeIdCount[nodeId].push(frame);
});

const duplicates = Object.entries(nodeIdCount).filter(([_, frames]) => frames.length > 1);
if (duplicates.length > 0) {
  issues.push({
    type: 'Duplicate Node IDs',
    severity: 'high',
    items: duplicates.map(([nodeId, frames]) => ({
      nodeId,
      frames: frames.map((f) => `${f.id} - ${f.name}`).join(', '),
    })),
  });
}

// Issue 2: Check for missing dimensions
const missingDimensions = mapping.frames.filter((frame) => !frame.dimensions || frame.dimensions === '');
if (missingDimensions.length > 0) {
  issues.push({
    type: 'Missing Dimensions',
    severity: 'low',
    items: missingDimensions.map((f) => ({
      id: f.id,
      name: f.name,
      nodeId: f.nodeId,
    })),
  });
}

// Display issues
if (issues.length > 0) {
  log('DETECTED ISSUES', 'bright');
  log('───────────────────────────────────────────────────────', 'cyan');

  issues.forEach((issue, index) => {
    const severityColor = issue.severity === 'high' ? 'red' : 'yellow';
    log(`\n${index + 1}. ${issue.type} [${issue.severity.toUpperCase()}]`, severityColor);

    issue.items.forEach((item) => {
      if (issue.type === 'Duplicate Node IDs') {
        log(`   Node ID: ${item.nodeId}`, severityColor);
        log(`   Frames: ${item.frames}`, 'reset');
      } else if (issue.type === 'Missing Dimensions') {
        log(`   ${item.id} - ${item.name} (${item.nodeId})`, severityColor);
      }
    });
  });
  log('');
} else {
  log('✅ No issues detected!\n', 'green');
}

// Display frames needing verification
if (framesByStatus.pending.length > 0) {
  log('FRAMES REQUIRING VERIFICATION', 'bright');
  log('───────────────────────────────────────────────────────', 'cyan');
  log(`${framesByStatus.pending.length} frames need manual verification:\n`);

  // Group by module
  const byModule = {};
  framesByStatus.pending.forEach((frame) => {
    if (!byModule[frame.module]) {
      byModule[frame.module] = [];
    }
    byModule[frame.module].push(frame);
  });

  Object.entries(byModule).forEach(([module, frames]) => {
    log(`📁 ${module}`, 'yellow');
    frames.forEach((frame) => {
      log(`   ${frame.id.padStart(3)} - ${frame.name.padEnd(40)} ${frame.nodeId}`, 'reset');
      log(`       ${frame.figmaUrl}`, 'cyan');
    });
    log('');
  });
}

// Instructions
log('NEXT STEPS', 'bright');
log('───────────────────────────────────────────────────────', 'cyan');
log('1. Open Figma Desktop with I.R.I.S.-Prototype file');
log('2. Click URLs above to verify each pending frame');
log('3. Check if frame loads and node ID is correct');
log('4. Update frame-node-mapping.json if changes found');
log('5. Re-run this script to verify changes\n');

// Export issues for programmatic use
if (issues.length > 0) {
  const issuesPath = path.join(__dirname, '../docs/figma/validation-issues.json');
  fs.writeFileSync(issuesPath, JSON.stringify(issues, null, 2));
  log(`📝 Issues exported to: docs/figma/validation-issues.json`, 'cyan');
}

log('═══════════════════════════════════════════════════════', 'cyan');
log(`           VALIDATION COMPLETE`, 'bright');
log('═══════════════════════════════════════════════════════\n', 'cyan');

// Exit code based on issues
process.exit(issues.filter((i) => i.severity === 'high').length > 0 ? 1 : 0);
