#!/usr/bin/env node

/**
 * Extract content from FigJam boards using REST API
 * Equivalent to mcp__figma-desktop__get_figjam
 *
 * Usage: node get-figjam.js <file-key> <node-id> [figma-token]
 */

const https = require('https');
const fs = require('fs');

const fileKey = process.argv[2];
const nodeId = process.argv[3];
const token = process.argv[4] || process.env.FIGMA_TOKEN;

if (!fileKey || !nodeId) {
    console.error('Usage: node get-figjam.js <file-key> <node-id> [token]');
    console.error('Example: node get-figjam.js xFC8eCJcSwB9EyicTmDJ7w 123:456 <token>');
    process.exit(1);
}

if (!token) {
    console.error('❌ Error: FIGMA_TOKEN not provided');
    console.error('Set FIGMA_TOKEN environment variable or pass as third argument');
    process.exit(1);
}

const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`;

console.log(`🎨 Fetching FigJam content for node ${nodeId}...`);

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

            console.log('✅ FigJam data retrieved successfully\n');

            // Extract FigJam content
            const figjamContent = extractFigJamContent(nodeData.document);

            console.log('═'.repeat(60));
            console.log('  FIGJAM BOARD CONTENT');
            console.log('═'.repeat(60));
            console.log('');

            console.log(`📋 Board: ${nodeData.document.name}`);
            console.log(`🔖 Type: ${nodeData.document.type}`);
            console.log('');

            // Display sticky notes
            if (figjamContent.stickyNotes.length > 0) {
                console.log(`📝 Sticky Notes (${figjamContent.stickyNotes.length}):`);
                console.log('');
                figjamContent.stickyNotes.forEach((sticky, index) => {
                    console.log(`   ${index + 1}. ${sticky.text || '(empty)'}`);
                    if (sticky.authorName) {
                        console.log(`      Author: ${sticky.authorName}`);
                    }
                    console.log(`      Position: (${Math.round(sticky.x)}, ${Math.round(sticky.y)})`);
                    console.log('');
                });
            } else {
                console.log('ℹ️  No sticky notes found.');
                console.log('');
            }

            // Display text nodes
            if (figjamContent.textNodes.length > 0) {
                console.log(`📄 Text Nodes (${figjamContent.textNodes.length}):`);
                console.log('');
                figjamContent.textNodes.forEach((text, index) => {
                    console.log(`   ${index + 1}. ${text.text || '(empty)'}`);
                    console.log(`      Position: (${Math.round(text.x)}, ${Math.round(text.y)})`);
                    console.log('');
                });
            }

            // Display shapes
            if (figjamContent.shapes.length > 0) {
                console.log(`🔷 Shapes & Connectors (${figjamContent.shapes.length}):`);
                console.log('');
                const shapeTypes = {};
                figjamContent.shapes.forEach(shape => {
                    shapeTypes[shape.type] = (shapeTypes[shape.type] || 0) + 1;
                });
                Object.entries(shapeTypes).forEach(([type, count]) => {
                    console.log(`   • ${type}: ${count}`);
                });
                console.log('');
            }

            // Display comments
            if (figjamContent.comments.length > 0) {
                console.log(`💬 Comments (${figjamContent.comments.length}):`);
                console.log('');
                figjamContent.comments.forEach((comment, index) => {
                    console.log(`   ${index + 1}. ${comment.text || '(empty)'}`);
                    console.log('');
                });
            }

            // Summary
            console.log('─'.repeat(60));
            console.log('  SUMMARY');
            console.log('─'.repeat(60));
            console.log(`   Total Sticky Notes: ${figjamContent.stickyNotes.length}`);
            console.log(`   Total Text Nodes: ${figjamContent.textNodes.length}`);
            console.log(`   Total Shapes: ${figjamContent.shapes.length}`);
            console.log(`   Total Comments: ${figjamContent.comments.length}`);
            console.log(`   Total Nodes: ${figjamContent.totalNodes}`);
            console.log('');

            // Save output
            const output = {
                fileKey,
                nodeId,
                boardName: nodeData.document.name,
                boardType: nodeData.document.type,
                content: figjamContent,
                rawNode: nodeData.document
            };

            const outputPath = `temp-figjam-${nodeId.replace(':', '-')}.json`;
            fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

            console.log('═'.repeat(60));
            console.log(`📄 Full FigJam content saved to: ${outputPath}`);
            console.log('');

            console.log('💡 Note: This script extracts basic FigJam content via REST API.');
            console.log('   For advanced widgets and interactions, use the Plugin API.');
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
 * Extract FigJam-specific content from node tree
 */
function extractFigJamContent(node, content = null) {
    if (!content) {
        content = {
            stickyNotes: [],
            textNodes: [],
            shapes: [],
            comments: [],
            totalNodes: 0
        };
    }

    content.totalNodes++;

    // Extract sticky notes
    if (node.type === 'STICKY') {
        const text = extractTextFromNode(node);
        content.stickyNotes.push({
            id: node.id,
            text: text,
            authorName: node.authorName,
            x: node.absoluteBoundingBox?.x || 0,
            y: node.absoluteBoundingBox?.y || 0,
            width: node.absoluteBoundingBox?.width || 0,
            height: node.absoluteBoundingBox?.height || 0
        });
    }

    // Extract text nodes
    if (node.type === 'TEXT') {
        content.textNodes.push({
            id: node.id,
            text: node.characters || '',
            x: node.absoluteBoundingBox?.x || 0,
            y: node.absoluteBoundingBox?.y || 0
        });
    }

    // Extract shapes and connectors
    if (['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'LINE', 'VECTOR', 'CONNECTOR'].includes(node.type)) {
        content.shapes.push({
            id: node.id,
            type: node.type,
            name: node.name,
            x: node.absoluteBoundingBox?.x || 0,
            y: node.absoluteBoundingBox?.y || 0
        });
    }

    // Extract comments (if available in node data)
    if (node.comments) {
        node.comments.forEach(comment => {
            content.comments.push({
                text: comment.message || comment.text || '',
                author: comment.user?.handle || 'Unknown'
            });
        });
    }

    // Recursively process children
    if (node.children) {
        node.children.forEach(child => {
            extractFigJamContent(child, content);
        });
    }

    return content;
}

/**
 * Extract text content from a node
 */
function extractTextFromNode(node) {
    if (node.characters) {
        return node.characters;
    }

    // For sticky notes, text might be in children
    if (node.children) {
        const textChildren = node.children.filter(child => child.type === 'TEXT');
        if (textChildren.length > 0) {
            return textChildren.map(child => child.characters || '').join(' ');
        }
    }

    return '';
}
