const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Unique cache version — increment when needing a full cache bust
config.cacheVersion = 'iris-mobile-v4';

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Resolve packages from monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Block legacy root-level App.tsx/index.ts (prototype files left at monorepo root)
// Metro would otherwise pick them up via watchFolders and shadow apps/mobile/
config.resolver.blockList = [
  new RegExp(path.join(monorepoRoot, 'App\\.tsx').replace(/\\/g, '\\\\')),
  new RegExp(path.join(monorepoRoot, 'index\\.ts').replace(/\\/g, '\\\\')),
];

module.exports = config;
