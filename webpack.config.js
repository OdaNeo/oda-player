const path = require('path')
const resolve = dir => path.resolve(__dirname, dir)

const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const TerserJSPlugin = require('terser-webpack-plugin') // 压缩js代码

const PLUGINS = process.env.NODE_ENV === 'development' ? [new webpack.HotModuleReplacementPlugin()] : [new CleanWebpackPlugin()] // dev启用热更新

const OPTIMIZATION =
  process.env.NODE_ENV === 'production'
    ? [
        new TerserJSPlugin({
          terserOptions: {
            compress: {
              drop_console: true // 移除console
            },
            output: {
              comments: false // 移除js中的注释
            }
          }
        })
      ]
    : [] // prod开启js压缩

module.exports = {
  entry: './src/app.js',
  mode: process.env.NODE_ENV,
  output: {
    filename: 'OPlayer.js', // js 输出文件
    path: resolve('dist'),
    publicPath: process.env.NODE_ENV === 'development' ? '/' : '/'
  },
  optimization: {
    namedModules: true, // 替代 NamedModulesPlugin
    minimizer: OPTIMIZATION.concat([])
  },
  devtool: process.env.NODE_ENV === 'development' ? 'eval-cheap-module-source-map' : false,
  devServer: {
    contentBase: './dist',
    port: 7863,
    open: true,
    hot: true
  },
  plugins: PLUGINS.concat([
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve('src/app.html')
      // chunks: ['main']
    })
  ]),
  module: {
    rules: [
      {
        test: /\.html$/,
        include: [resolve('src')],
        use: ['html-loader']
      },
      {
        test: /\.css$/,
        include: resolve('src'),
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]' // 模块化css
              }
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.svg$/,
        include: resolve('src/styles'),
        use: [
          {
            loader: 'svg-inline-loader',
            options: {}
          }
        ]
      }
    ]
  }
}
