module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['defaults'],
        },
        useBuiltIns: 'usage',
      },
    ],
  ],
};
