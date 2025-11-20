#!/usr/bin/env node
const { getController } = require('./browser-controller');
const OutputFormatter = require('./utils/output-formatter');

async function main() {
  const url = process.argv[2];

  if (!url) {
    OutputFormatter.error('Usage: node navigate.js <url>');
  }

  try {
    const controller = await getController();
    const result = await controller.navigate(url);
    OutputFormatter.success(result);
  } catch (error) {
    OutputFormatter.error(error.message);
  }
}

main();
