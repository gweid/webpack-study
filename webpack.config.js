const path = require('path')
const { DefinePlugin } = require('webpack') // 设置全局变量
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 抽离 css, 将 css 从 js 中抽离出来，减少 js 体积，有利于减少页面加载时间
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin') // 压缩 css
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin")
const webpack = require('webpack')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin') // pwa
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin') // 动态使用 cdn
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
// const AutodllWebpackPlugin = require('autodll-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin') // 压缩 js
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // 打包时先清空 dist 目录 webpack4 之后这样引入
// 对打包进行计时
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin")
// const smp = new SpeedMeasurePlugin()
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer') // 分析打包大小
const CopyWebpackPlugin = require('copy-webpack-plugin') // 复制目录

// css 公共配置
function commentCss(mode, importLoaders = 1) {
  const isDev = mode === 'development'
  const isProd = mode === 'production'
  
  const option = [
    isDev && 'style-loader', // 开发环境使用 style-loader 插入
    // 生产环境抽离 css
    isProd && {
      loader: MiniCssExtractPlugin.loader, // 抽离 css
      options: {
        // 抽离 css 一定要在这里配置 publicPath，不然 CSS 里面的图片路径是以 CSS 目录为根目录的
        publicPath: '../',
        hot: true,
      }
    },
    {
      loader: 'css-loader',
      options: { importLoaders }
    },
    'postcss-loader' // postcss 的配置在 postcss.config.js 文件
  ].filter(Boolean) // 通过 ['style-loader', false].filter(Boolean) 可以过滤掉 false/undefined 之类的选项

  return option
}

const webpackConfig = (env, options) => {
  const MODE = options.mode // 获取 webpack4 的 mode 值

  return {
    // entry: ['./src/js/index.js', './public/index.html'], // 加 index.html 主要是 html 修改不会热替换
    entry: ['./src/js/index.js'],

    output: {
      // filename: 'js/bundle.[contenthash:8].js', // 出口文件名 使用 hash 值
      filename:
        MODE === 'development'
          ? 'js/[name]_bundle.[hash:8].js'
          : 'js/[name]_bundle.[contenthash:8].js', // contenthash: 文件 hash，根据文件来生成 hash
      path: path.resolve(__dirname, 'dist'), // 输出的全局路径，这个必须是绝对路径
      publicPath: MODE === 'development' ? '' : '', // 所有资源引入公共路径前缀
      chunkFilename: 'js/[name]_chunk.[contenthash:8].js', // 控制非入口 chunk 文件的输出文件名（例如异步代码单独打包出来的文件，配合 /* webpackChunkName: 'sub' */ 这个魔法注释）
      // library: '[name]', // 整个库向外暴露的名字
      // libraryTargrt: 'window', // 变量名添加到什么属性上
    },

    devServer: {
      overlay: true, // 配合 eslint 实时在浏览器弹出语法错误
      publicPath: '', // 所有资源引入公共路径前缀
      // host: '0.0.0.0',
      // 要运行的目录 只是在内存中编译打包，不指向真正的目录
      // contentBase: path.resolve(__dirname, 'dist'),
      watchOptions: {
        // 忽略 node_modules
        ignored: /node_modules/,
      },
      compress: true, // 启动 gzip 压缩
      // progress: true, // 显示进度条
      port: 3000,
      open: true,
      hot: true, // 打开 HMR 模块热替换
      clientLogLevel: 'none', // 不显示启动服务器日志信息
      quiet: true, // 除了一些基本启动信息，其他的内容不要显示

      // 服务器代理 ---> 解决开发环境中的跨域问题
      proxy: {
        '/api': {
          // 一旦 devServer 接收到 /api/xx 形式的请求，就会把请求转发到 http://localhost:8888
          target: 'http://localhost:8888',
          // 发送请求时，路径重写：将 /api/xxx ---> /xxx
          // pathRewrite: {
          //   '^/api': '',
          // },
          changeOrigin: true
        },
      },
    },

    // source-map 源码映射
    /**
     * [inline | hidden | eval-][nosource-][cheap-[module-]]source-map
     * inline-source-map 内联在bundle.js   速度快
     * hidden-source-map 外部 .map 只有错误代码原因，不能映射到源码的错误位置
     * eval-source-map   内联
     * cheap-source-map  错误代码信息和源代码位置，精确到行，更快
     */
    // devtool: 'source-map', // 没有 eval 后，构建的产物不是 eval('') 的形式
    // devtool: MODE === 'development' ? 'cheap-module-eval-source-map' : 'none',
    devtool: MODE === 'development' ? 'source-map' : 'none',

    // 主要用于 cdn 引入的包, 忽略打包（这种方式需要在 index.html 中的 script 中引入 cdn 地址）
    // externals: {
    //     // 要忽略的库名---npm 包名
    //     jquery: "jQuery"
    // },

    // 解释模块的规则
    resolve: {
      // 配置文件别名
      // 优点： 减少打包时查找文件的时间
      alias: {
        '@css': path.resolve(__dirname, 'src/css'),
      },
    },

    module: {
      rules: [
        // {
        //   oneOf: [
            // {
            //   // 使用这个要将 url-loader 的引入规范改为 CommonJS
            //   test: /\.(html|htm)$/,
            //   loader: 'html-withimg-loader', // 主要将 html 中使用 img 标签引入的图片使用动态路径 <img src="./aa.jpg">
            // },
            {
              test: /\.css$/,
              use: [...commentCss(MODE)],
            },
            {
              test: /\.scss$/,
              use: [...commentCss(MODE, 2), 'sass-loader'],
            },
            {
              test: /\.(jpg|png|gif)$/,
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    esModule: false, // 将 url-loader 使用 es6 的引入改为 CommonJS
                    limit: 8 * 1024, // 小于 8k 将转换为 base64, 不要将过大的图片转换为 base64，因为会增加 bundle 体积
                    name: '[name]_[hash:8].[ext]', // 输出的图片名，拼接 hash
                    outputPath: 'images', // 输出到 dist 下哪个目录
                  },
                },
              ],
            },
            {
              test: /\.jsx?/,
              exclude: /node_modules/, // 排除 node_modules
              // include: path.resolve(__dirname, 'src'), // 只检查 src 下的
              // enforce: 'pre',  // pre: 优先执行 | post: 延后执行   多用于一个 js 需要多个 loader 编译
              use: [
                /**
                 * 使用 thread-loader 多进程编译
                 * 进程启动也要时间，大约 600ms，进程通讯也要开销，所以一般给 babel 使用，或者打包时间短的不建议使用
                 */
                // 'thread-loader',
                {
                  loader: 'babel-loader',
                  options: {
                    // 开启 babel 缓存，第二次打包时，会读取之前的缓存，优化打包速度
                    cacheDirectory: true,
                  }
                },
                // 'eslint-loader'
              ],
            },
            {
              test: /\.tsx?/,
              exclude: /node_modules/, // 排除 node_modules
              use: ['babel-loader', 'ts-loader']
              // use: ['babel-loader', 'ts-loader', 'eslint-loader']
            }
        //   ],
        // },
      ],
    },

    plugins: [
      // 打包构建前先清空 dist
      new CleanWebpackPlugin(),

      // 用来配合 webpack-dev-server 进行热更新
      // 这里可以不写，因为 webpack-dev-server 3.x 版本判断是否 hot: true，如果是会自动加 HotModuleReplacementPlugin 插件
      // 具体查看：https://github.com/webpack/webpack-dev-server/blob/8bbef6adf6ae5f6a3109ecd4a6246223d2f77cb2/lib/utils/addEntries.js#L153
      // new webpack.HotModuleReplacementPlugin(),

      new HtmlWebpackPlugin({
        title: 'gweid webpack',
        filename: 'index.html',
        template: './public/index.html', // 以什么为模板
        // 压缩 HTML 的配置(开发环境不需要压缩)
        minify: MODE === 'production' ? {
          removeComments: true, // 是否去掉注释
          collapseWhitespace: true, // 折叠成一行
        } : false,
      }),

      // 设置全局常量
      new DefinePlugin({
        BASE_URL: '"./"'
      }),

      // 复制目录：将 public 目录下的文件复制到输出目录
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            globOptions: {
              ignore: [
                '**/index.html', // 已经由 HtmlWebpackPlugin 处理，所以这里忽略它
                '**/.DS_Store' // mac 系统忽略这个
              ]
            }
          }
        ]
      }),

      // 抽离 css  将 css 从 js 中抽离出来，减少 js 体积，有利于减少页面加载时间
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css', // 分离到到 main.css  使用 contenthash 值
      }),
      // 压缩 css
      // new OptimizeCssAssetsWebpackPlugin(),

      // pwa
      new WorkboxWebpackPlugin.GenerateSW({
        /**
         * 1、帮助 serviceWorker 快速启动
         * 2、删除旧的 serviceWorker
         *
         * 生成一个 serviceWorker 配置文件
         * 需要在入口文件注册 serviceWorker
         */
        clientsClaim: true,
        skipWaiting: true,
      }),

      // 动态使用 cdn
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'jquery',
            entry:
              'https://cdn.bootcdn.net/ajax/libs/jquery/1.12.4/jquery.min.js',
            global: 'jQuery',
          },
        ],
      }),

      // // 通过 DllReferencePlugin 插件告知要使用的 DLL 库
      // new webpack.DllReferencePlugin({
      //   manifest: path.resolve(__dirname, 'dll', 'zepto.manifest.json'),
      // }),
      // // 通过 AddAssetHtmlWebpackPlugin 将 dll 库引入到 html 模板中
      // new AddAssetHtmlWebpackPlugin({
      //   filepath: path.resolve(__dirname, 'dll', 'dll_zepto.js'),
      // }),

      // 使用 HardSourceWebpackPlugin 替代 dll
      new HardSourceWebpackPlugin(),

      // 分析包大小
      process.env.NODE_ENV === 'analyzer' && new BundleAnalyzerPlugin()

    ].filter(Boolean),

    optimization: {
      // 代码分割
      splitChunks: {
        chunks: 'all',
        minSize: 30 * 1024, // 只有大于 30kb 的 chunks 才进行分割
        minChunks: 1, // 这个 chunks 至少被引用一次才分割

        // cacheGroups: 用于对拆分的包就行分组，比如一个lodash在拆分之后，并不会立即打包
        // 而是会等到有没有其他符合规则的包一起来打包
        // cacheGroups: {
        //   vendors: {
        //     // 匹配规则：如果是从 node_modules 中引入的
        //     test: /[\\/]node_modules[\\/]/,
        //     filename: 'js/[name]_[hash:4].js'
        //   },
        //   // 如果想要将我们自己写的文件单独打包，那么可以再配置(要注意于前面设置的包大小限制 minSize 配合)
        //   // xxx: {
        //   //   test: /xxx/,
        //   //   filename: 'js/[name]_[hash:4].js'
        //   // }
        // }
      },

      // 将运行时的代码进行抽离
      runtimeChunk: {
        name: entrypoint => `runtime_${entrypoint.name}`
      },

      // 开启或者关闭 minimizer，生产环境默认开启
      // minimize: true,

      // 配置生产环境的压缩方案
      minimizer: [
        // 压缩 css
        new CssMinimizerWebpackPlugin(),

        // 压缩 js，webpack4 以后，生产环境直接使用默认的即可
        // new TerserWebpackPlugin({
        //   cache: true, // 开启缓存
        //   parallel: true, // 开启多进程打包
        //   extractComments: false, // 是否将注释抽取到一个单独文件(生产环境不需要) 默认是 true
        //   // sourceMap: true, // 启动 source-map, 如果生产生产环境要 source-map，打开，不然内联的 source-map 可能会被压缩掉

        //   // 去除 console.log 
        //   // terserOptions: {
        //   //   compress: {
        //   //     drop_console: true,
        //   //   },
        //   // },
        // }),
      ],
    },
  }
}

// module.exports = smp.wrap(webpackConfig)
module.exports = webpackConfig
