#!/usr/bin/env node
const { getController } = require('./browser-controller');
const OutputFormatter = require('./utils/output-formatter');

async function main() {
  const text = process.argv[2];
  const ref = process.argv[3]; // optional

  if (!text) {
    OutputFormatter.error('Usage: node type.js <text> [ref]');
  }

  try {
    const controller = await getController();
    const result = await controller.type(text, ref);
    OutputFormatter.success(result);
  } catch (error) {
    OutputFormatter.error(error.message);
  }
}

main();
