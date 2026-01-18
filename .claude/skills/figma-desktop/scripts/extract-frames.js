#!/usr/bin/env node

/**
 * Extract all frames from Figma page using REST API
 * Usage: node extract-frames.js <file-key> <node-id> [figma-token]
 */

const https = require('https');
const { requireFigmaToken } = require('./utils/get-figma-token');

const fileKey = process.argv[2] || 'xFC8eCJcSwB9EyicTmDJ7w';
const nodeId = process.argv[3] || '2501:2715';
const token = requireFigmaToken(process.argv[4]);

const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`;

console.log(`🔍 Querying Figma API...`);
console.log(`   File: ${fileKey}`);
console.log(`   Node: ${nodeId}\n`);

const options = {
  headers: {
    'X-Figma-Token': token
  }
};

https.get(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (response.err || response.error) {
        console.error('❌ API Error:', response.err || response.error || response.message);
        process.exit(1);
      }

      const formattedNodeId = nodeId.replace('-', ':');
      const pageData = response.nodes[formattedNodeId];

      if (!pageData || !pageData.document) {
        console.error('❌ No data found for node:', nodeId);
        process.exit(1);
      }

      const frames = pageData.document.children.filter(child => child.type === 'FRAME');

      console.log(`✅ Found ${frames.length} frames on page "${pageData.document.name}"\n`);
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('  FRAMES DISCOVERED');
      console.log('═══════════════════════════════════════════════════════════════\n');

      frames.forEach((frame, index) => {
        const num = String(index + 1).padStart(2, '0');
        console.log(`${num}. ${frame.name}`);
        console.log(`    Node ID: ${frame.id}`);
        console.log(`    Type: ${frame.type}`);
        if (frame.absoluteBoundingBox) {
          const box = frame.absoluteBoundingBox;
          console.log(`    Dimensions: ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
        console.log('');
      });

      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`  SUMMARY: ${frames.length} total frames`);
      console.log('═══════════════════════════════════════════════════════════════\n');

      // Output JSON for programmatic use
      const output = {
        fileKey,
        fileName: response.name,
        nodeId: formattedNodeId,
        pageName: pageData.document.name,
        totalFrames: frames.length,
        frames: frames.map(frame => ({
          name: frame.name,
          id: frame.id,
          type: frame.type,
          width: frame.absoluteBoundingBox ? Math.round(frame.absoluteBoundingBox.width) : null,
          height: frame.absoluteBoundingBox ? Math.round(frame.absoluteBoundingBox.height) : null
        }))
      };

      // Save to file
      const fs = require('fs');
      const outputPath = 'temp-frames-list.json';
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
      console.log(`📄 Full output saved to: ${outputPath}`);

    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.error('Raw response:', data.substring(0, 500));
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('❌ HTTP Request Error:', error.message);
  process.exit(1);
});
