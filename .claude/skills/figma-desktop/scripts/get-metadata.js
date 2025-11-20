#!/usr/bin/env node

/**
 * Get metadata for a Figma node using REST API
 *
 * Usage: node get-metadata.js <file-key> <node-id> [figma-token]
 */

const https = require('https');
const fs = require('fs');

const fileKey = process.argv[2];
const nodeId = process.argv[3];
const token = process.argv[4] || process.env.FIGMA_TOKEN;

if (!fileKey || !nodeId) {
  console.error('Usage: node get-metadata.js <file-key> <node-id> [token]');
  console.error('Example: node get-metadata.js xFC8eCJcSwB9EyicTmDJ7w 2501:2715 <token>');
  process.exit(1);
}

if (!token) {
  console.error('❌ Error: FIGMA_TOKEN not provided');
  console.error('Set FIGMA_TOKEN environment variable or pass as third argument');
  process.exit(1);
}

const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`;

console.log(`🔍 Fetching metadata for node ${nodeId}...`);

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
      const nodeData = response.nodes[formattedNodeId];

      if (!nodeData) {
        console.error(`❌ Node ${nodeId} not found`);
        process.exit(1);
      }

      console.log('✅ Metadata retrieved successfully\n');

      // Convert to simplified XML-like structure
      function nodeToXML(node, depth = 0) {
        const indent = '  '.repeat(depth);
        let xml = `${indent}<${node.type} id="${node.id}" name="${node.name}"`;

        if (node.absoluteBoundingBox) {
          const box = node.absoluteBoundingBox;
          xml += ` x="${Math.round(box.x)}" y="${Math.round(box.y)}" width="${Math.round(box.width)}" height="${Math.round(box.height)}"`;
        }

        if (node.children && node.children.length > 0) {
          xml += '>\n';
          node.children.forEach(child => {
            xml += nodeToXML(child, depth + 1);
          });
          xml += `${indent}</${node.type}>\n`;
        } else {
          xml += ' />\n';
        }

        return xml;
      }

      const xmlOutput = nodeToXML(nodeData.document);
      console.log('XML Structure:');
      console.log('═'.repeat(60));
      console.log(xmlOutput);
      console.log('═'.repeat(60));

      // Also output full JSON for detailed inspection
      const outputPath = `temp-metadata-${nodeId.replace(':', '-')}.json`;
      fs.writeFileSync(outputPath, JSON.stringify(nodeData, null, 2));
      console.log(`\n📄 Full metadata saved to: ${outputPath}`);

      // Summary
      function countNodes(node) {
        let count = 1;
        if (node.children) {
          node.children.forEach(child => {
            count += countNodes(child);
          });
        }
        return count;
      }

      const totalNodes = countNodes(nodeData.document);
      const frameCount = nodeData.document.children ?
        nodeData.document.children.filter(c => c.type === 'FRAME').length : 0;

      console.log('\n📊 Summary:');
      console.log(`   Node Type: ${nodeData.document.type}`);
      console.log(`   Node Name: ${nodeData.document.name}`);
      console.log(`   Total Child Nodes: ${totalNodes}`);
      console.log(`   Direct Frame Children: ${frameCount}`);

    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('❌ HTTP Request Error:', error.message);
  process.exit(1);
});
