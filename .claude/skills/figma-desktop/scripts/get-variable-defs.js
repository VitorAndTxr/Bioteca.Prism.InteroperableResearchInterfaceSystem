#!/usr/bin/env node

/**
 * Get variable definitions (design tokens) from Figma file using REST API
 *
 * Usage: node get-variable-defs.js <file-key> [figma-token]
 */

const https = require('https');
const fs = require('fs');
const { requireFigmaToken } = require('./utils/get-figma-token');

const fileKey = process.argv[2];

if (!fileKey) {
  console.error('Usage: node get-variable-defs.js <file-key> [token]');
  console.error('Example: node get-variable-defs.js xFC8eCJcSwB9EyicTmDJ7w <token>');
  process.exit(1);
}

const token = requireFigmaToken(process.argv[3]);

console.log(`🎨 Fetching design tokens from file ${fileKey}...`);

// Step 1: Get file styles
const stylesUrl = `https://api.figma.com/v1/files/${fileKey}`;

const options = {
  headers: {
    'X-Figma-Token': token
  }
};

https.get(stylesUrl, options, (res) => {
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

      console.log('✅ File data retrieved successfully\n');

      // Extract styles
      const styles = response.styles || {};
      const colors = {};
      const textStyles = {};

      // Extract color styles
      Object.entries(styles).forEach(([key, style]) => {
        if (style.styleType === 'FILL') {
          colors[style.name] = {
            key,
            description: style.description || '',
            type: 'FILL'
          };
        } else if (style.styleType === 'TEXT') {
          textStyles[style.name] = {
            key,
            description: style.description || '',
            type: 'TEXT'
          };
        }
      });

      // Extract variables (if available)
      const localVariables = response.document?.children?.[0]?.localVariables || [];
      const variables = {};

      localVariables.forEach(variable => {
        variables[variable.name] = {
          id: variable.id,
          type: variable.resolvedType,
          valuesByMode: variable.valuesByMode
        };
      });

      // Output summary
      console.log('═'.repeat(60));
      console.log('  DESIGN TOKENS SUMMARY');
      console.log('═'.repeat(60));
      console.log('');
      console.log(`🎨 Color Styles: ${Object.keys(colors).length}`);
      console.log(`📝 Text Styles: ${Object.keys(textStyles).length}`);
      console.log(`📐 Variables: ${Object.keys(variables).length}`);
      console.log('');

      // List color styles
      if (Object.keys(colors).length > 0) {
        console.log('Color Styles:');
        Object.entries(colors).forEach(([name, data]) => {
          console.log(`   • ${name}`);
        });
        console.log('');
      }

      // List text styles
      if (Object.keys(textStyles).length > 0) {
        console.log('Text Styles:');
        Object.entries(textStyles).forEach(([name, data]) => {
          console.log(`   • ${name}`);
        });
        console.log('');
      }

      // Save full output
      const output = {
        fileKey,
        fileName: response.name,
        lastModified: response.lastModified,
        version: response.version,
        colors,
        textStyles,
        variables,
        totalColorStyles: Object.keys(colors).length,
        totalTextStyles: Object.keys(textStyles).length,
        totalVariables: Object.keys(variables).length
      };

      const outputPath = `temp-design-tokens-${fileKey}.json`;
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

      console.log('═'.repeat(60));
      console.log(`📄 Full design tokens saved to: ${outputPath}`);
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
