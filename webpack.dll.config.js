const path = require('path')
const webpack = require('webpack')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin') // 打包时先清空 dist 目录 webpack4 之后这样引入

module.exports = {
    entry: {
        zepto: ['zepto-webpack'] // zepto 在 webpack 中使用用的是 zepto-webpack 这个包
    },
    output: {
        path: path.resolve(__dirname, "dll"),
        filename: "dll_[name].js", // name 取到的值就是 entry 的 key
        library: "dll_[name]"
    },
    plugins: [
        new CleanWebpackPlugin(),

        // 生成一份 manifest 文件
        new webpack.DllPlugin({
            name: 'dll_[name]', // 这里的 name 要与 output 的 library 一致
            path: path.resolve(__dirname, "dll", "[name].manifest.json")
        })
    ]
}