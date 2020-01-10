'use strict'

const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const resolve = dir => path.join(__dirname, '.', dir)

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    externals: {
        // npm原则，依赖不打包 针对不同环境 使用不同的依赖
        "turf": 'turf',
        "mapbox-gl":{
            commonjs:"mapbox-gl",
            commonjs2:'mapbox-gl',
            amd:"mapbox-gl",
            root:"mapboxgl"
        },
        "@mapbox/mapbox-gl-draw":{
            commonjs:"@mapbox/mapbox-gl-draw",
            commonjs2:"@mapbox/mapbox-gl-draw",
            amd:"@mapbox/mapbox-gl-draw",
            root:"MapboxDraw"
        }
    },
    output: {
        path: resolve('dist'), // 输出目录
        filename: 'index.js', // 输出文件
        libraryTarget: 'umd', // 采用通用模块定义
        library: 'MapMeasureTool', // 库名称
        libraryExport: 'default', // 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范
        globalObject: 'this' // 兼容node和浏览器运行，避免window is not undefined情况
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src')],
                exclude:/node_modules/
            }
        ]
    },
    plugins: isProd
        ? [
            new UglifyJsPlugin({
                parallel: true,
                uglifyOptions: {
                    compress: {
                        warnings: false
                    },
                    mangle: true
                },
                sourceMap: true
            })
        ]
        : [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        ]
}
