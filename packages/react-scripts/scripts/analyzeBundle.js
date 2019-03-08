'use strict';

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const config = require('../config/webpack.config.prod');

config.plugins.push(
  new BundleAnalyzerPlugin({
    generateStatsFile: true,
    statsFilename: 'stats.json',
  })
);

const compiler = webpack(config);

compiler.run((error, stats) => {
  if (error) {
    throw new Error(error);
  }

  console.log(stats); // eslint-disable-line no-console
});
