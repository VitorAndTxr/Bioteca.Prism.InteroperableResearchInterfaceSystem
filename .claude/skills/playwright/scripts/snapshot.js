#!/usr/bin/env node
const { getController } = require('./browser-controller');
const OutputFormatter = require('./utils/output-formatter');

async function main() {
  try {
    const controller = await getController();
    const tree = await controller.snapshot();
    OutputFormatter.snapshot(tree);
  } catch (error) {
    OutputFormatter.error(error.message);
  }
}

main();
