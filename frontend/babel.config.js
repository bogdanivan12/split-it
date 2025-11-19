module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['dotenv-import', {
        moduleName: '@env',
        path: '.env',
      }],
    ],
  };
};
