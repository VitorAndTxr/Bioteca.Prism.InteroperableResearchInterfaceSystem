#!/usr/bin/env node

/**
 * Compare current Figma frames with documented frames to identify new additions
 */

const fs = require('fs');

// Read current frames from Figma
const currentFramesPath = 'temp-frames-list.json';
const currentData = JSON.parse(fs.readFileSync(currentFramesPath, 'utf8'));
const currentFrames = currentData.frames;

// Read documented frames
const documentedFramesPath = 'docs/figma/frame-node-mapping.json';
const documentedData = JSON.parse(fs.readFileSync(documentedFramesPath, 'utf8'));
const documentedFrames = documentedData.frames;

// Create maps for comparison
const documentedIds = new Set(documentedFrames.map(f => f.nodeId));
const documentedNames = new Set(documentedFrames.map(f => f.name));

// Find new frames
const newFrames = currentFrames.filter(frame => !documentedIds.has(frame.id));
const updatedFrames = currentFrames.filter(frame =>
  documentedIds.has(frame.id) &&
  !documentedFrames.find(df => df.nodeId === frame.id && df.name === frame.name)
);

console.log('═══════════════════════════════════════════════════════════════');
console.log('  FIGMA FRAMES COMPARISON REPORT');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`📊 Current Total: ${currentFrames.length} frames`);
console.log(`📄 Documented: ${documentedFrames.length} frames`);
console.log(`🆕 New Frames: ${newFrames.length}`);
console.log(`🔄 Updated Frames: ${updatedFrames.length}`);
console.log('');

if (newFrames.length > 0) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NEW FRAMES DISCOVERED');
  console.log('═══════════════════════════════════════════════════════════════\n');

  newFrames.forEach((frame, index) => {
    const num = String(index + 1).padStart(2, '0');
    console.log(`${num}. ${frame.name}`);
    console.log(`    Node ID: ${frame.id}`);
    console.log(`    Dimensions: ${frame.width}x${frame.height}`);
    console.log(`    Figma URL: https://www.figma.com/design/${currentData.fileKey}/I.R.I.S.-Prototype?node-id=${frame.id.replace(':', '-')}`);
    console.log('');
  });
}

if (updatedFrames.length > 0) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  UPDATED FRAMES (Name Changes)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  updatedFrames.forEach((frame, index) => {
    const oldFrame = documentedFrames.find(df => df.nodeId === frame.id);
    console.log(`${index + 1}. ${oldFrame.name} → ${frame.name}`);
    console.log(`   Node ID: ${frame.id}`);
    console.log('');
  });
}

// Categorize new frames by module
const moduleCategories = {
  'Research Management': [],
  'User Management': [],
  'SNOMED': [],
  'NPI Management': [],
  'Device Management': [],
  'Modals/Dialogs': [],
  'Other': []
};

newFrames.forEach(frame => {
  const name = frame.name.toLowerCase();

  if (name.includes('pesquisa') || name.includes('research')) {
    moduleCategories['Research Management'].push(frame);
  } else if (name.includes('voluntário') || name.includes('volunteer')) {
    moduleCategories['User Management'].push(frame);
  } else if (name.includes('snomed') || name.includes('condição') || name.includes('evento clínico') ||
             name.includes('medicação') || name.includes('alergia') || name.includes('corpo') ||
             name.includes('modificador')) {
    moduleCategories['SNOMED'].push(frame);
  } else if (name.includes('conexão') || name.includes('connection') || name.includes('aplicação')) {
    moduleCategories['NPI Management'].push(frame);
  } else if (name.includes('dispositivo') || name.includes('sensor') || name.includes('device')) {
    moduleCategories['Device Management'].push(frame);
  } else if (frame.width < 700 || frame.height < 400) {
    moduleCategories['Modals/Dialogs'].push(frame);
  } else {
    moduleCategories['Other'].push(frame);
  }
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('  NEW FRAMES BY MODULE');
console.log('═══════════════════════════════════════════════════════════════\n');

Object.entries(moduleCategories).forEach(([module, frames]) => {
  if (frames.length > 0) {
    console.log(`📁 ${module} (${frames.length} frames):`);
    frames.forEach(frame => {
      console.log(`   - ${frame.name} (${frame.id})`);
    });
    console.log('');
  }
});

// Generate summary for documentation
const summary = {
  comparisonDate: new Date().toISOString().split('T')[0],
  currentTotal: currentFrames.length,
  documentedTotal: documentedFrames.length,
  newFramesCount: newFrames.length,
  updatedFramesCount: updatedFrames.length,
  newFrames: newFrames.map(frame => ({
    id: documentedFrames.length + newFrames.indexOf(frame) + 1,
    name: frame.name,
    nodeId: frame.id,
    type: frame.width < 700 || frame.height < 400 ? 'Modal' : 'Screen',
    dimensions: `${frame.width}x${frame.height}`,
    figmaUrl: `https://www.figma.com/design/${currentData.fileKey}/I.R.I.S.-Prototype?node-id=${frame.id.replace(':', '-')}`,
    module: Object.entries(moduleCategories).find(([_, frames]) =>
      frames.some(f => f.id === frame.id)
    )?.[0] || 'Other'
  })),
  moduleBreakdown: Object.entries(moduleCategories).reduce((acc, [module, frames]) => {
    if (frames.length > 0) {
      acc[module] = frames.length;
    }
    return acc;
  }, {})
};

fs.writeFileSync('temp-comparison-report.json', JSON.stringify(summary, null, 2));

console.log('═══════════════════════════════════════════════════════════════');
console.log(`  SUMMARY`);
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`Total Change: +${newFrames.length} new frames`);
console.log(`Progress: ${documentedFrames.length} → ${currentFrames.length} frames`);
console.log(`Increase: ${((newFrames.length / documentedFrames.length) * 100).toFixed(1)}%`);
console.log('');
console.log('📄 Detailed report saved to: temp-comparison-report.json');
console.log('');
