#!/usr/bin/env node

/**
 * Get annotations and dev mode handoff notes from Figma node using REST API
 *
 * Usage: node get-annotations.js <file-key> <node-id> [figma-token]
 */

const https = require('https');
const fs = require('fs');

const fileKey = process.argv[2];
const nodeId = process.argv[3];
const token = process.argv[4] || process.env.FIGMA_TOKEN;

if (!fileKey || !nodeId) {
  console.error('Usage: node get-annotations.js <file-key> <node-id> [token]');
  console.error('Example: node get-annotations.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742 <token>');
  process.exit(1);
}

if (!token) {
  console.error('❌ Error: FIGMA_TOKEN not provided');
  console.error('Set FIGMA_TOKEN environment variable or pass as third argument');
  process.exit(1);
}

const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`;

console.log(`📝 Fetching annotations for node ${nodeId}...`);

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

      console.log('✅ Node data retrieved successfully\n');

      // Extract annotations from node
      const annotations = extractAnnotations(nodeData.document);

      console.log('═'.repeat(60));
      console.log('  ANNOTATIONS & HANDOFF NOTES');
      console.log('═'.repeat(60));
      console.log('');

      if (annotations.length === 0) {
        console.log('ℹ️  No annotations found for this node.');
        console.log('');
        console.log('Note: Annotations may require Dev Mode or Plugin API access.');
        console.log('This script extracts available metadata from REST API.');
      } else {
        annotations.forEach((annotation, index) => {
          console.log(`Annotation ${index + 1}:`);
          console.log(`   Type: ${annotation.type}`);
          console.log(`   Content: ${annotation.content}`);
          if (annotation.nodeId) {
            console.log(`   Node ID: ${annotation.nodeId}`);
          }
          console.log('');
        });
      }

      // Extract other useful handoff information
      const handoffInfo = extractHandoffInfo(nodeData.document);

      if (Object.keys(handoffInfo).length > 0) {
        console.log('─'.repeat(60));
        console.log('  HANDOFF INFORMATION');
        console.log('─'.repeat(60));
        console.log('');

        if (handoffInfo.name) {
          console.log(`📌 Node Name: ${handoffInfo.name}`);
        }
        if (handoffInfo.type) {
          console.log(`🔖 Node Type: ${handoffInfo.type}`);
        }
        if (handoffInfo.description) {
          console.log(`📄 Description: ${handoffInfo.description}`);
        }
        if (handoffInfo.componentProperties) {
          console.log(`⚙️  Component Properties: ${handoffInfo.componentProperties.length}`);
          handoffInfo.componentProperties.forEach(prop => {
            console.log(`   • ${prop.name}: ${prop.type}`);
          });
        }
        if (handoffInfo.exportSettings && handoffInfo.exportSettings.length > 0) {
          console.log(`📤 Export Settings: ${handoffInfo.exportSettings.length} configured`);
        }
        console.log('');
      }

      // Save full output
      const output = {
        fileKey,
        nodeId,
        nodeName: nodeData.document.name,
        nodeType: nodeData.document.type,
        annotations,
        handoffInfo,
        rawNode: nodeData.document
      };

      const outputPath = `temp-annotations-${nodeId.replace(':', '-')}.json`;
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

      console.log('═'.repeat(60));
      console.log(`📄 Full annotations data saved to: ${outputPath}`);
      console.log('');

      console.log('💡 Tip: For full Dev Mode annotations, use the Figma MCP server');
      console.log('   with get_design_context tool when Figma Desktop is running.');
      console.log('');

    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('❌ HTTP Request Error:', error.message);
  process.exit(1);
});

/**
 * Extract annotations from node data
 * Note: REST API has limited annotation access compared to Plugin API
 */
function extractAnnotations(node) {
  const annotations = [];

  // Check for description field (common annotation location)
  if (node.description) {
    annotations.push({
      type: 'DESCRIPTION',
      content: node.description,
      nodeId: node.id
    });
  }

  // Check for reactions (comments/annotations)
  if (node.reactions && node.reactions.length > 0) {
    node.reactions.forEach(reaction => {
      annotations.push({
        type: 'REACTION',
        content: reaction.emoji || reaction.text || 'Reaction',
        nodeId: node.id
      });
    });
  }

  // Recursively check children
  if (node.children) {
    node.children.forEach(child => {
      const childAnnotations = extractAnnotations(child);
      annotations.push(...childAnnotations);
    });
  }

  return annotations;
}

/**
 * Extract handoff-relevant information from node
 */
function extractHandoffInfo(node) {
  const info = {};

  info.name = node.name;
  info.type = node.type;

  if (node.description) {
    info.description = node.description;
  }

  // Component properties
  if (node.componentPropertyDefinitions) {
    info.componentProperties = Object.entries(node.componentPropertyDefinitions).map(([key, prop]) => ({
      name: key,
      type: prop.type,
      defaultValue: prop.defaultValue
    }));
  }

  // Export settings
  if (node.exportSettings) {
    info.exportSettings = node.exportSettings;
  }

  // Constraints (for layout info)
  if (node.constraints) {
    info.constraints = node.constraints;
  }

  // Layout properties (auto-layout)
  if (node.layoutMode) {
    info.layout = {
      mode: node.layoutMode,
      primaryAxisSizingMode: node.primaryAxisSizingMode,
      counterAxisSizingMode: node.counterAxisSizingMode,
      paddingLeft: node.paddingLeft,
      paddingRight: node.paddingRight,
      paddingTop: node.paddingTop,
      paddingBottom: node.paddingBottom,
      itemSpacing: node.itemSpacing
    };
  }

  return info;
}
