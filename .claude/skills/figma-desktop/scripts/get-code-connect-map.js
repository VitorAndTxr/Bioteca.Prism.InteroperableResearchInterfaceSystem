#!/usr/bin/env node

/**
 * Get Code Connect mapping between Figma components and codebase using REST API
 *
 * Usage: node get-code-connect-map.js <file-key> [figma-token]
 */

const https = require('https');
const fs = require('fs');
const { requireFigmaToken } = require('./utils/get-figma-token');

const fileKey = process.argv[2];

if (!fileKey) {
    console.error('Usage: node get-code-connect-map.js <file-key> [token]');
    console.error('Example: node get-code-connect-map.js xFC8eCJcSwB9EyicTmDJ7w <token>');
    process.exit(1);
}

const token = requireFigmaToken(process.argv[3]);

console.log(`🔗 Fetching Code Connect mapping for file ${fileKey}...`);

// Step 1: Get file components
const componentsUrl = `https://api.figma.com/v1/files/${fileKey}/components`;

const options = {
    headers: {
        'X-Figma-Token': token
    }
};

https.get(componentsUrl, options, (res) => {
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

            console.log('✅ Components data retrieved successfully\n');

            const components = response.meta?.components || [];

            console.log('═'.repeat(60));
            console.log('  CODE CONNECT COMPONENT MAPPING');
            console.log('═'.repeat(60));
            console.log('');

            if (components.length === 0) {
                console.log('ℹ️  No components found in this file.');
                console.log('');
            } else {
                console.log(`📦 Total Components: ${components.length}`);
                console.log('');

                // Group components by component set (if applicable)
                const componentSets = {};
                const standaloneComponents = [];

                components.forEach(component => {
                    if (component.containing_frame?.containingStateGroup) {
                        const setName = component.containing_frame.containingStateGroup.name;
                        if (!componentSets[setName]) {
                            componentSets[setName] = [];
                        }
                        componentSets[setName].push(component);
                    } else {
                        standaloneComponents.push(component);
                    }
                });

                // Display component sets
                if (Object.keys(componentSets).length > 0) {
                    console.log('🎨 Component Sets:');
                    console.log('');
                    Object.entries(componentSets).forEach(([setName, comps]) => {
                        console.log(`   ${setName} (${comps.length} variants)`);
                        comps.forEach(comp => {
                            console.log(`      • ${comp.name}`);
                            console.log(`        ID: ${comp.node_id}`);
                            console.log(`        Key: ${comp.key}`);
                        });
                        console.log('');
                    });
                }

                // Display standalone components
                if (standaloneComponents.length > 0) {
                    console.log('🔧 Standalone Components:');
                    console.log('');
                    standaloneComponents.forEach(comp => {
                        console.log(`   ${comp.name}`);
                        console.log(`      ID: ${comp.node_id}`);
                        console.log(`      Key: ${comp.key}`);
                        if (comp.description) {
                            console.log(`      Description: ${comp.description}`);
                        }
                        console.log('');
                    });
                }
            }

            // Create mapping structure
            const mapping = components.map(comp => ({
                figmaComponentId: comp.node_id,
                figmaComponentKey: comp.key,
                figmaComponentName: comp.name,
                description: comp.description || '',
                // These would be populated by Code Connect setup
                codeFilePath: null,
                codeComponentName: null,
                codeImportStatement: null
            }));

            // Save output
            const output = {
                fileKey,
                fileName: response.meta?.name || 'Unknown',
                totalComponents: components.length,
                mapping,
                note: 'Code file paths and component names require Code Connect setup in Figma. This script provides the Figma component metadata. To complete the mapping, set up Code Connect in your Figma file or use the Plugin API.'
            };

            const outputPath = `temp-code-connect-${fileKey}.json`;
            fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

            console.log('═'.repeat(60));
            console.log(`📄 Code Connect mapping saved to: ${outputPath}`);
            console.log('');

            console.log('💡 Note: This script extracts Figma component metadata.');
            console.log('   To map components to actual code files, you need to:');
            console.log('   1. Set up Code Connect in your Figma file, OR');
            console.log('   2. Manually create a mapping file, OR');
            console.log('   3. Use the Figma Plugin API for full Code Connect access');
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
