#!/usr/bin/env node

/**
 * Get screenshot for a Figma node using REST API
 * Equivalent to mcp__figma-desktop__get_screenshot
 *
 * Usage: node get-screenshot.js <file-key> <node-id> [figma-token] [output-file]
 */

const https = require('https');
const fs = require('fs');

const fileKey = process.argv[2];
const nodeId = process.argv[3];
const token = process.argv[4] || process.env.FIGMA_TOKEN;
const outputFile = process.argv[5] || `screenshot-${nodeId.replace(':', '-')}.png`;

if (!fileKey || !nodeId) {
  console.error('Usage: node get-screenshot.js <file-key> <node-id> [token] [output-file]');
  console.error('Example: node get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742 <token> login.png');
  process.exit(1);
}

if (!token) {
  console.error('❌ Error: FIGMA_TOKEN not provided');
  console.error('Set FIGMA_TOKEN environment variable or pass as third argument');
  process.exit(1);
}

// Step 1: Request image URL from Figma API
const url = `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=2`;

console.log(`📸 Requesting screenshot for node ${nodeId}...`);

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

      const imageUrl = response.images[nodeId];

      if (!imageUrl) {
        console.error(`❌ No image URL returned for node ${nodeId}`);
        console.error('Response:', response);
        process.exit(1);
      }

      console.log('✅ Image URL received, downloading...');

      // Step 2: Download the image
      https.get(imageUrl, (imageRes) => {
        const fileStream = fs.createWriteStream(outputFile);

        imageRes.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ Screenshot saved to: ${outputFile}`);

          // Get file size
          const stats = fs.statSync(outputFile);
          const fileSizeInKB = (stats.size / 1024).toFixed(2);
          console.log(`   File size: ${fileSizeInKB} KB`);
        });

      }).on('error', (error) => {
        fs.unlink(outputFile, () => {});
        console.error('❌ Error downloading image:', error.message);
        process.exit(1);
      });

    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('❌ HTTP Request Error:', error.message);
  process.exit(1);
});
