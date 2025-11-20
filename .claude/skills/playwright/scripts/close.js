#!/usr/bin/env node
const { getController } = require('./browser-controller');
const OutputFormatter = require('./utils/output-formatter');

async function main() {
  try {
    const controller = await getController();
    const result = await controller.close();
    OutputFormatter.success(result);
    process.exit(0);
  } catch (error) {
    OutputFormatter.error(error.message);
  }
}

main();
