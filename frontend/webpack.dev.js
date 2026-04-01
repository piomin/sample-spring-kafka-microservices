const { merge } = require('webpack-merge');
const webpack = require('webpack');
const dotenv = require('dotenv');
const common = require('./webpack.common.js');

const env = dotenv.config({ path: '.env.development' }).parsed;

const envKeys = Object.keys(env).reduce((prev, key) => {
  prev[`process.env.${key}`] = JSON.stringify(env[key]);
  return prev;
}, {});

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    client: {
      overlay: false
    },
    hot: true,
    port: 8000,
    open: true,
    historyApiFallback: true,
    compress: true
  },

  optimization: {
    minimize: false,
    moduleIds: 'named',
    chunkIds: 'named'
  },
  plugins: [new webpack.DefinePlugin(envKeys)]
});
