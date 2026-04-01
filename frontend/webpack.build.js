const webpack = require('webpack');
const { mergeWithRules } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require('./webpack.common.js');

const dotenv = require('dotenv');

const env = dotenv.config({ path: '.env.production' }).parsed;

const envKeys = Object.keys(env).reduce((prev, key) => {
  prev[`process.env.${key}`] = JSON.stringify(env[key]);
  return prev;
}, {});

// ✅ mergeWithRules kullanıyoruz: CSS kuralı common'dakini REPLACE eder, üstüne eklenmez
// Normal merge() ile aynı test pattern için iki kural oluşur (style-loader + MiniCssExtractPlugin aynı anda)
const merged = mergeWithRules({
  module: {
    rules: {
      test: 'match',
      use: 'replace'
    }
  }
})(common, {
  mode: 'production',

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash].css', // ✅ CSS de static/css/ altına
      chunkFilename: 'static/css/[name].[contenthash].chunk.css'
    }),
    new webpack.DefinePlugin(envKeys)
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        // ✅ style-loader'ın yerini MiniCssExtractPlugin.loader alır
        // style-loader CSS'i JS içine gömer (dev için iyi), MiniCssExtract ayrı dosya üretir (prod için iyi)
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }
    ]
  },

  optimization: {
    minimize: true,
    runtimeChunk: 'single', // ✅ Runtime kodu ayrı chunk'a alır, uzun vadeli cache için
    moduleIds: 'deterministic', // ✅ Değişmeyen modüller için aynı hash → daha iyi cache
    chunkIds: 'deterministic',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // ✅ Production'da console.log temizlenir
            drop_debugger: true // ✅ debugger ifadeleri de temizlenir
          },
          mangle: true,
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // ✅ node_modules ayrı vendor chunk'a alınır
        // Uygulama kodu değişse bile vendor bundle cache'de kalır
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        }
      }
    }
  }
});

module.exports = merged;
