const path = require('path')
const resolve = dir => path.resolve(__dirname, dir)

const webpack = require('webpack')

const TerserJSPlugin = require('terser-webpack-plugin') // 压缩js代码

module.exports = {
  entry: './src/index.js',
  mode: process.env.NODE_ENV,
  output: {
    filename: 'OdaPlayer.js', // js 输出文件
    path: resolve('dist'),
    publicPath: process.env.NODE_ENV === 'development' ? '/' : '/'
  },
  optimization: {
    namedModules: true, // 替代 NamedModulesPlugin
    minimizer:
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
  },
  devtool: process.env.NODE_ENV === 'development' ? 'eval-cheap-module-source-map' : false,
  devServer: {
    contentBase: './demo',
    port: 7863,
    open: true,
    hot: true
  },
  plugins: process.env.NODE_ENV === 'development' ? [new webpack.HotModuleReplacementPlugin()] : [],
  module: {
    rules: [
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
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: process.env.NODE_ENV === 'development' ? [] : [require('cssnano')] // dev 关闭cssnano
              }
            }
          }
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
