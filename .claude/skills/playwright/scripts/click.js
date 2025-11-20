#!/usr/bin/env node
const { getController } = require('./browser-controller');
const OutputFormatter = require('./utils/output-formatter');

async function main() {
  const ref = process.argv[2];

  if (!ref) {
    OutputFormatter.error('Usage: node click.js <ref>');
  }

  try {
    const controller = await getController();
    const result = await controller.click(ref);
    OutputFormatter.success(result);
  } catch (error) {
    OutputFormatter.error(error.message);
  }
}

main();
