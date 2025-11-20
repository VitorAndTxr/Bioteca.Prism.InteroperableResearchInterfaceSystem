#!/usr/bin/env node
const { getController } = require('./browser-controller');
const OutputFormatter = require('./utils/output-formatter');

async function main() {
  const ms = parseInt(process.argv[2]);

  if (!ms || isNaN(ms)) {
    OutputFormatter.error('Usage: node wait.js <milliseconds>');
  }

  try {
    const controller = await getController();
    const result = await controller.wait(ms);
    OutputFormatter.success(result);
  } catch (error) {
    OutputFormatter.error(error.message);
  }
}

main();
