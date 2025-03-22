const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : 'bundle.js', // 生产环境使用 hash 优化缓存
      publicPath: '/',
      clean: isProduction, // 生产模式下清理旧文件
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            cacheDirectory: true, // 启用 Babel 缓存，加快重复构建
          },
        },
        {
          test: /\.css$/,
          use: ['vue-style-loader', 'css-loader'],
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'fonts/[name].[hash:7].[ext]',
          },
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 6482,
      host: '0.0.0.0',
      hot: true,
      historyApiFallback: true,
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
      },
      extensions: ['.js', '.vue', '.json'],
    },
    optimization: {
      // 仅在生产模式下启用优化
      minimize: isProduction,
      splitChunks: isProduction
        ? {
            chunks: 'all', // 代码分割，减少单文件体积
            maxInitialRequests: 3, // 限制并行请求数
            cacheGroups: {
              vendors: {
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
              },
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
            },
          }
        : false,
    },
    performance: {
      maxEntrypointSize: 512000, // 限制入口文件大小（512KB）
      maxAssetSize: 512000, // 限制单个资源大小（512KB）
    },
  };
};