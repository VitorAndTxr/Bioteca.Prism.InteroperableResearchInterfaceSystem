#!/usr/bin/env node
const { getController } = require('./browser-controller');
const OutputFormatter = require('./utils/output-formatter');

async function main() {
  // Usage: node fill-form.js '{"fields": [{"ref": "ref1", "value": "text"}]}'
  const jsonArg = process.argv[2];

  if (!jsonArg) {
    OutputFormatter.error('Usage: node fill-form.js \'{"fields": [{"ref": "ref1", "value": "text"}]}\'');
  }

  try {
    const { fields } = JSON.parse(jsonArg);
    const controller = await getController();
    const result = await controller.fillForm(fields);
    OutputFormatter.success(result);
  } catch (error) {
    OutputFormatter.error(error.message);
  }
}

main();
