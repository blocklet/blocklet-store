const plugins = [
  [
    'babel-plugin-import',
    {
      libraryName: '@material-ui/core',
      libraryDirectory: '',
      camel2DashComponentName: false,
    },
    'core',
  ],
  [
    'babel-plugin-import',
    {
      libraryName: '@material-ui/icons',
      libraryDirectory: '',
      camel2DashComponentName: false,
    },
    'icons',
  ],
  // '@emotion/babel-plugin',
];

const presets = [
  [
    '@babel/preset-react',
    {
      runtime: 'automatic',
      // importSource: '@emotion/react',
    },
  ],
];
if (process.env.JEST) {
  presets.unshift(['@babel/preset-env', { targets: { node: 'current' } }]);
}

module.exports = { plugins, presets };
