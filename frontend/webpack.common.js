const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/[name].[contenthash].js',
    chunkFilename: 'static/js/[name].[contenthash].chunk.js',
    assetModuleFilename: 'static/assets/[name].[contenthash][ext]', // ✅ Asset çıktı yolu merkezi
    clean: true,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'], // ✅ .mjs eklendi (bazı ESM paketler için)
    alias: {
      '@': path.resolve(__dirname, 'src/')
    }
  },
  module: {
    rules: [
      {
        // ✅ ts-loader yerine swc-loader: Rust tabanlı, 10-20x daha hızlı transpile
        // Alternatif: babel-loader + @babel/preset-typescript (daha yaygın ekosistem)
        // NOT: Tip kontrolü webpack'ten bağımsız olarak `tsc --noEmit` ile yapılır
        test: /\.tsx?$/,
        use: 'swc-loader',
        exclude: /node_modules/
      },
      // ✅ .mjs kuralı kaldırıldı — Webpack 5 bunu varsayılan olarak doğru işler
      {
        // CSS kuralı sadece dev'de kullanılır, build override eder
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource' // ✅ Font'lar ayrıldı, semantik olarak daha doğru
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: 'body'
    })
  ]
};
