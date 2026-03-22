module.exports = function (api) {
  api.cache.using(() => require('crypto').createHash('md5').update(JSON.stringify(process.env)).digest('hex'));
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            'crypto': 'react-native-quick-crypto',
            'stream': 'readable-stream',
            'buffer': 'react-native-quick-crypto',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
    ],
  };
};
