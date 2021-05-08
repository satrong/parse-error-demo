const webpack = require('webpack')
const UploadSourceMapPlugin = require('./uploadSourceMapPlugin')

module.exports = {
  publicPath: '/',
  configureWebpack(config) {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new webpack.SourceMapDevToolPlugin({
          filename: 'sourcemap/[file].map', // 修改生成 sourcemap 文件的路径（对应 dist/sourcemap）
          append: false // 不在文件末尾添加 sourcemapUrl
        }),
        new UploadSourceMapPlugin()
      )
    }
  }
}