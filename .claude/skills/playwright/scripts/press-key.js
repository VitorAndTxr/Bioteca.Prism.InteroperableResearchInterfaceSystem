#!/usr/bin/env node
const { getController } = require('./browser-controller');
const OutputFormatter = require('./utils/output-formatter');

async function main() {
  const key = process.argv[2];

  if (!key) {
    OutputFormatter.error('Usage: node press-key.js <key>');
  }

  try {
    const controller = await getController();
    const result = await controller.pressKey(key);
    OutputFormatter.success(result);
  } catch (error) {
    OutputFormatter.error(error.message);
  }
}

main();
