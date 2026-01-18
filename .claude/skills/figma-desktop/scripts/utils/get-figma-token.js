#!/usr/bin/env node

/**
 * Figma Token Utility
 *
 * Retrieves Figma API token from multiple sources in order of priority:
 * 1. Explicit argument passed to function
 * 2. FIGMA_TOKEN environment variable
 * 3. FIGMA_KEY environment variable
 * 4. Claude user settings (~/.claude/settings.json -> env.FIGMA_KEY)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Get Figma token from available sources
 * @param {string} [explicitToken] - Token passed directly (e.g., from CLI argument)
 * @returns {string|null} The Figma token or null if not found
 */
function getFigmaToken(explicitToken) {
  // 1. Explicit token (CLI argument)
  if (explicitToken) {
    return explicitToken;
  }

  // 2. FIGMA_TOKEN environment variable
  if (process.env.FIGMA_TOKEN) {
    return process.env.FIGMA_TOKEN;
  }

  // 3. FIGMA_KEY environment variable
  if (process.env.FIGMA_KEY) {
    return process.env.FIGMA_KEY;
  }

  // 4. Claude user settings
  const claudeSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');

  try {
    if (fs.existsSync(claudeSettingsPath)) {
      const settings = JSON.parse(fs.readFileSync(claudeSettingsPath, 'utf8'));

      if (settings.env?.FIGMA_KEY) {
        return settings.env.FIGMA_KEY;
      }

      if (settings.env?.FIGMA_TOKEN) {
        return settings.env.FIGMA_TOKEN;
      }
    }
  } catch (error) {
    // Silent fail - will return null and let caller handle
  }

  return null;
}

/**
 * Get Figma token or exit with error message
 * @param {string} [explicitToken] - Token passed directly (e.g., from CLI argument)
 * @returns {string} The Figma token
 */
function requireFigmaToken(explicitToken) {
  const token = getFigmaToken(explicitToken);

  if (!token) {
    console.error('❌ Error: Figma token not found');
    console.error('');
    console.error('Configure in one of these ways:');
    console.error('  1. Pass as CLI argument');
    console.error('  2. Set FIGMA_TOKEN environment variable');
    console.error('  3. Set FIGMA_KEY environment variable');
    console.error('  4. Add to Claude settings (~/.claude/settings.json):');
    console.error('     { "env": { "FIGMA_KEY": "your-token" } }');
    console.error('');
    console.error('Get your token at: https://www.figma.com/settings → Personal Access Tokens');
    process.exit(1);
  }

  return token;
}

module.exports = {
  getFigmaToken,
  requireFigmaToken
};
