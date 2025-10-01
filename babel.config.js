module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { router: true }]],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts', 
          importsWhitelist: ['constants.js', 'colors.js'],
          logTimings: true,
        },
      ],
      'react-native-reanimated/plugin', 
    ],
  };
};