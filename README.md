# Webpack 基础知识汇总



## webpack 认知

### 本质：

本质上，webpack 是一个现代 JavaScript 应用程序的静态模块打包器(module bundler)。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle。

<img src="./imgs/img40.png" style="zoom: 67%;" />



### 安装：

```js
npm i webpack webpack-cli
```

使用 webpack 目前需要安装 webpack、webpack-cli：

- 执行 webpack 命令会执行 node_modules 下的 \.bin 目录下的 webpack
- webpack 的执行依赖于 webpack-cli，而 webpack-cli 中代码执行时，才是真正利用 webpack 进行编译和打包的过程



### npx 命令：

在以往，如果需要使用 eslint 命令，首先需要安装 eslint，然后去到对应目录执行：

```js
./node_modules/.bin/eslint --init
./node_modules/.bin/eslint yourfile.js
```

或者使用 package.json 的 script 脚本。



但是使用了 npx，只需要：

```js
npx eslint --init
npx eslint yourfile.js
```

npx 的作用： 

- 默认去 node_modules/.bin 路径和环境变量 `$PATH` 里面，检查命令是否存在。

- 另一个更实用的好处是：npx 执行模块时会优先安装依赖，但是在安装执行后便删除此依赖，这就避免了全局安装模块带来的问题



### webpack.config.js

执行 webpack 命令，会先看看有没有 webpack.config.js 文件，如果有，会合并这里的配置

可以通过命令改变，不使用 webpack.config.js

```js
"scripts": {
    "build": "webpack --config wp.config.js"
}
// 这样就会默认去合并 wp.config.js 里的配置
```



### 基本打包原则

- 在 webpack 执行的时候，会根据命令或者配置文件找到入口文件
- 从入口文件开始，查找出每一个依赖，生成一个依赖图
- 然后遍历递归依赖图，根据文件不同，使用不同 loader 处理文件，打包一个个模块
- 最后将结果输出（中间打包的过程可以通过 plugin 控制整个生命周期）



### loader 和 plugin 差别

**loader：** loader 是在对模块进行转换的时候起作用

**plugin：** plugin 可以贯穿整个 webpack 的生命周期，执行更加广泛的任务，比如打包优化、资源管理等



### webpack 的模块化

> 代码放在 test/module 中，打包后的结果是基于 webpack5.24.4，不同版本的打包结果可能不一样，但是思路基本是一致的

在 webpack 中，可以使用各种各样的模块化，包括 CommonJS、ES Module 等



#### CommonJS 模块化

首先是 format.js 中

```js
const dateFormat = (date) => {
  return "2020-12-12";
}

const priceFormat = (price) => {
  return "100.00";
}

module.exports = {
  dateFormat,
  priceFormat
}

```

然后 common.js 

```js
const { dateFormat, priceFormat } = require('./js/format');

console.log(dateFormat("abc"));
console.log(priceFormat("abc"));
```

打包后产物：

```js
// 最外层就是一个自执行函数
(function () {
  // 定义了一个对象去存储模块
  // 模块的路径是对象的 key，模块的代码封装在一个函数里作为是对象的 value
  var __webpack_modules__ = {
    './src/js/format.js': function (module) {
      const dateFormat = (date) => {
        return '2020-12-12';
      };

      const priceFormat = (price) => {
        return '100.00';
      };

      module.exports = {
        dateFormat,
        priceFormat,
      };
    },
  };

  // 这个对象, 作为加载模块的缓存
  var __webpack_module_cache__ = {};

  // 当加载一个模块时，都会通过这个函数来加载
  // moduleId 就是需要加载的模块路径
  function __webpack_require__(moduleId) {
    // 1、判断缓存是否加载过
    if (__webpack_module_cache__[moduleId]) {
      return __webpack_module_cache__[moduleId].exports;
    }

    // 2、给 module 变量和 __webpack_module_cache__[moduleId] 赋值了同一个对象
    // 这样做的好处：两者同时指向同一个对象，那么，当这个被指向的对象改变，那么这两者的也会同时改变
    var module = __webpack_module_cache__[moduleId] = { exports: {} };

    // 3、加载模块
    // 将 module={ exports: {} } 这个对象传给 __webpack_modules__[moduleId] 这个函数，让这个函数往 module 添加东西
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    // 4、导出 module.export { dateFormat: function, priceForamt: function }
    return module.exports;
  }

  // 通过自执行函数实现代码逻辑
  !(function () {
    // 将 require 加载转换为实现的 __webpack_require__ 加载，通过 __webpack_require__ 去加载模块
    const { dateFormat, priceFormat } = __webpack_require__('./src/js/format.js');

    console.log(dateFormat('abc'));
    console.log(priceFormat('abc'));
  })();
})();
```



#### ES Module 模块化

math.js：

```js
export const sum = (num1, num2) => {
  return num1 + num2;
}

export const mul = (num1, num2) => {
  return num1 * num2;
}
```

esmodule.js：

```js
import { sum, mul } from "./js/math";

console.log(mul(20, 30));
console.log(sum(20, 30));
```

打包后产物：

```js
// 外部是一个自执行函数
;(function () {
  'use strict'
  // 定义一个对象，用于存储模块
  // 模块路径作为对象 key 值
  var __webpack_modules__ = {
    './src/js/math.js': function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
      // 调用 __webpack_require__.r，记录 __esModule 为 true
      __webpack_require__.r(__webpack_exports__)

      // 调用 __webpack_require__.d，将 exports 没有的代理到 { sum: Function, mul: Function }
      __webpack_require__.d(__webpack_exports__, {
        sum: function () {
          return sum
        },
        mul: function () {
          return mul
        }
      })

      const sum = (num1, num2) => {
        return num1 + num2
      }

      const mul = (num1, num2) => {
        return num1 * num2
      }
    }
  }

  // 这个对象用于缓存加载过的模块
  var __webpack_module_cache__ = {}

  // 当加载一个模块时，都会通过这个函数来加载
  // moduleId 就是需要加载的模块路径
  function __webpack_require__(moduleId) {
    // 1、判断是否已经加载过这个模块
    if (__webpack_module_cache__[moduleId]) {
      return __webpack_module_cache__[moduleId].exports
    }
    
    // 2、给 module 变量和 __webpack_module_cache__[moduleId] 赋值了同一个对象
    // 这样做的好处：两者同时指向同一个对象，那么，当这个被指向的对象改变，那么这两者的也会同时改变
    var module = __webpack_module_cache__[moduleId] = { exports: {} }

    // 3、执行 __webpack_modules__ 相应模块的函数，参数是 module、module.exports、__webpack_require__
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__)

    // 4、导出 module.exports 这个对象
    return module.exports
  }

  // 为 __webpack_require__ 这个函数对象添加一个属性 d --> function
  !(function () {
    // exports：就是 module 中的 exports；definition：模块中的导出
    __webpack_require__.d = function (exports, definition) {
      for (var key in definition) {
        // 如果一个 key 在 definition 中，而不在 exports 中
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          // 为 module 的 exports 代理到 definition，访问 module.exports 的 key 会被代理到 definition
          // 也就是说 exports 本身并没有 { sum: Function, mul: Function }，访问 sum 的时候实际上读取的是 definition 的
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] })
        }
      }
    }
  })()

  // 为 __webpack_require__ 这个函数对象添加一个属性 o --> function
  !(function () {
    // 这个 o 函数的作用：判断某个对象是否包含某个 key
    __webpack_require__.o = function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop)
    }
  })()

  // 为 __webpack_require__ 这个函数对象加一个属性 r --> function
  !(function () {
    __webpack_require__.r = function (exports) {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
      }
      // 为 module 的 exports 对象设置一个 __esModule，值为 true
      // 目的就是标记当前这个模块是不是 es module，以便后面如果需要，能够用到这个信息
      Object.defineProperty(exports, '__esModule', { value: true })
    }
  })()

  var __webpack_exports__ = {}

  // 自执行函数实现代码逻辑
  !(function () {
    __webpack_require__.r(__webpack_exports__)
    var _js_math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__('./src/js/math.js')

    console.log((0, _js_math__WEBPACK_IMPORTED_MODULE_0__.mul)(20, 30))
    console.log((0, _js_math__WEBPACK_IMPORTED_MODULE_0__.sum)(20, 30))
  })()
})()
```



#### CommonJS 和 ES Module 相互导入

这个其实就是上面两个的结合，最主要还是 webpack 的打包产物，内部通过一个对象存储所有的模块，然后通过 `__webpack_require__` 去加载模块，实现了抹平

```js
// 外面一个自执行函数
;(function () {
  // 定义一个对象，用于存储模块
  // 模块路径作为对象 key 值
  var __webpack_modules__ = {
    './src/js/format.js': function (module) {
      const dateFormat = (date) => {
        return '2020-12-12'
      }

      const priceFormat = (price) => {
        return '100.00'
      }

      module.exports = {
        dateFormat,
        priceFormat
      }
    },
    './src/js/math.js': function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
      'use strict'
      // 调用 __webpack_require__.r，记录 __esModule 为 true
      __webpack_require__.r(__webpack_exports__)

      // // 调用 __webpack_require__.d，将 __webpack_exports__ 没有的代理到 { sum: Function, mul: Function }
      __webpack_require__.d(__webpack_exports__, {
        sum: function () {
          return sum
        },
        mul: function () {
          return mul
        }
      })

      const sum = (num1, num2) => {
        return num1 + num2
      }

      const mul = (num1, num2) => {
        return num1 * num2
      }
    }
  }

  // 这个对象用于存储加载过的模块
  var __webpack_module_cache__ = {}

  // 当加载一个模块时，都会通过这个函数来加载
  // moduleId 就是需要加载的模块路径
  function __webpack_require__(moduleId) {
    // 1、判断是否加载过这个模块
    if (__webpack_module_cache__[moduleId]) {
      return __webpack_module_cache__[moduleId].exports
    }

    // 2、给 module 变量和 __webpack_module_cache__[moduleId] 赋值了同一个对象
    // 这样做的好处：两者同时指向同一个对象，那么，当这个被指向的对象改变，那么这两者的也会同时改变
    var module = __webpack_module_cache__[moduleId] = { exports: {} }

    // 3、执行 __webpack_modules__ 相应模块的函数
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__)

    // 4、导出 module.exports 这个对象
    return module.exports
  }

  !(function () {
    __webpack_require__.n = function (module) {
      var getter =
        module && module.__esModule
          ? function () {
              return module['default']
            }
          : function () {
              return module
            }
      __webpack_require__.d(getter, { a: getter })
      return getter
    }
  })()

  // 给 __webpack_require__ 函数对象加一个 d --> function
  !(function () {
    __webpack_require__.d = function (exports, definition) {
      for (var key in definition) {
        // 如果一个 key 在 definition 中，而不在 exports 中
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          // 为 module 的 exports 代理到 definition，访问 module.exports 的 key 会被代理到 definition，访问
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] })
        }
      }
    }
  })()

  // 给 __webpack_require__ 函数对象加一个 o --> function
  !(function () {
    // 这个函数的作用是判断对象是否包含某个 key
    __webpack_require__.o = function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop)
    }
  })()

  // // 给 __webpack_require__ 函数对象加一个 r --> function
  !(function () {
    __webpack_require__.r = function (exports) {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
      }
      // 给 exports 设置 __esModule，值为 true
      Object.defineProperty(exports, '__esModule', { value: true })
    }
  })()

  var __webpack_exports__ = {}

  // 自执行函数实现代码逻辑
  !(function () {
    'use strict'
    __webpack_require__.r(__webpack_exports__)
    var _js_format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__('./src/js/format.js')
    var _js_format__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_js_format__WEBPACK_IMPORTED_MODULE_0__)

    const { sum, mul } = __webpack_require__('./src/js/math.js')

    console.log(sum(20, 30))
    console.log(mul(20, 30))

    console.log((0, _js_format__WEBPACK_IMPORTED_MODULE_0__.dateFormat)('aaa'))
    console.log((0, _js_format__WEBPACK_IMPORTED_MODULE_0__.priceFormat)('bbb'))

    console.log(abc)
  })()
})()
```



## 基础功能



### 出入口



#### 入口

```js
module.exports = {
    entry: "./src/js/index.js", // 入口名
}
```



#### 上下文

context：代表着基础目录，必须为绝对路径，用于从配置中解析入口点

```js
const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'src'), // 将根目录设置为项目下的 'src' 文件夹
  entry: './index.js', // 此时入口文件是 'src/index.js'
};
```



使用场景：比如，webpack 配置并不是写在根目录下，而是这样：

```
programs/
  ├── config                          
  │   ├── wbepack.config.js  
  ├── src
  │   ├── index.js
```

那么就需要加上 context，而不是在入口文件直接 `entry: "../src/index.js"`

```js
const path = require('path')

module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: "./src/index.js",
}
```

- path.resolve：将多个路径片段解析为一个绝对路径



#### 出口

- filename：出口文件名

- path：出口文件全局路径，这个必须是绝对路径

- publicPath：定义所有由 webpack 处理的文件（JS、CSS、图片、字体等）在浏览器中被引用时的基础路径，影响最终index.html 中引用资源的路径前缀

  - 默认值是一个空字符串，所以打包后引入 js 文件时，路径是 bundle.js

     ![](./imgs/img20.png)

  - 在开发中，也将其设置为 / ，路径是 /bundle.js，那么浏览器会根据所在的域名+路径去请求对应的资源

     ![](./imgs/img21.png)

  - 如果希望在本地直接打开 html 文件来运行，会将其设置为 ./，路径是 ./bundle.js，可以根据相对路径去查找资源

     ![](./imgs/img22.png)
     
  - 当资源需要从 CDN 加载时，可以将 publicPath 设置为 CDN 的 URL

  > 常见的资源 404 错误，通常是 publicPath 配置不正确导致浏览器无法找到资源
  >
  > 
  >
  > 比如：类似 vue 的脚手架，默认就是 `publicPath: '/'`，那么直打开 index.html，是没有类似 `http://localhost:3000/` 这样的一个服务，而是协议头类似 `file://` 这样的，那么按照 域名+路径 的方式就加载不到。所以可以改为 ./ 的形式

- chunkFilename：

  - 控制非入口 chunk 文件的输出文件名（例如**异步代码**单独打包出来的文件，配合 /* webpackChunkName: 'sub' */ 这个魔法注释）
    - 当使用动态导入（如 import() 语法）进行代码分割时，生成的分割代码块会使用 chunkFilename 定义的命名规则
    - 这些代码块不是由 entry 入口直接产生的，而是在运行时动态加载的
  - 控制分割代码的文件名格式，有助于实现长期缓存策略，特别是使用 [contenthash] 时



配置示例：

```js
moodule.exports: {
    // 出口
    output: {
        filename: "js/bundle.js", // 出口文件名
        path: path.resolve(__dirname, "dist"), // 输出的全局路径，这个必须是绝对路径
        publicPath: MODE === 'development' ? '' : '',
        chunkFilename: 'js/[name]_chunk.[contenthash:8].js'
    }
}
```



### mode

在 webpack 中，有三种模式 mode，是 webpack 为了简化配置

三种模式分别是：

**mode=development： 相当于做了以下的配置**

 ![](./imgs/img4.png)

**mode=production： 相当于做了以下的配置**

 ![](./imgs/img5.png)

**mode=none： 相当于做了以下的配置**

 ![](./imgs/img6.png)

设置： 

```js
"scripts": {
    "dev": "webpack-dev-server --mode development --progress",
    "build": "webpack --mode production --progress",
}
```

或者在 webpack.config.js 中：

```js
module.exports = {
    mode: 'development'
}
```



### 处理样式 style

一般使用 css/scss/less 这些 loader



安装：

```js
npm i style-loader css-loader sass-loader node-sass -D
```

使用：

```js
{
    test: /\.css$/,
    use: [
        "style-loader", // 将 css 插入 head 标签
        "css-loader", // 将 css 以模块引入
    ]
}

{
    test: /\.scss$/,
    use: [
        "style-loader",
        "css-loader",
        "sass-loader"
    ]
}
```



### 处理图片



####url-loader & file-loader



一般在项目中使用 url-loader，因为 url-loader 可以将图片文件，转成 base64 的 URI，直接打包到 bundle.js 中

- 小的图片转换 base64 之后可以和页面一起被请求，减少不必要的请求过程
- 如果大的图片也进行转换，那么会导致 bundle.js 过大，反而会影响页面的请求速度

所以，对于是否转换需要一个阈值，一般只会将一些 icon 小图标转换为 base64



url-loader 使用的一些 placeholder（空间占位符）：

- [ext]： 原文件扩展名
- [name]：原文件名
- [hash]：文件的内容，使用 MD4 的散列函数处理，生成的一个 128 位的 hash 值（32个十六进制）
- [hash:\<length\>]：截取 hash 的长度，默认 32 个字符太长了

安装：

```js
npm i url-loader -D
```

使用：

```
{
    test: /\.(jpg|png|gif)$/,
    use: [{
        loader: "url-loader",
        options: {
            limit: 8 * 1024, // 小于 8k 将转换为 base64，不应该将过大的图片转换为 base64，这样会增加 bundle 体积
            name: "[name]_[hash:8].[ext]", // 输出的图片名，拼接 hash
            outputPath: "images" // 输出到 dist 下哪个目录
        }
    }]
}
```



#### html-withimg-loader

`html-withimg-loader` 是一个 Webpack 加载器(loader)，专门用于处理 HTML 文件中的图片引用问题。它的主要功能是解析 HTML 文件中的 `<img>` 标签，并将这些图片资源纳入 Webpack 的打包体系



场景：当图片是在 public/index.html 直接通过 img 便签引入，这时需要使用 html-withimg-loader 处理 



安装

```shell
npm i html-withimg-loader -D
```



使用

```
{
    // 使用这个要将 url-loader 的引入规范改为 CommonJS
    test: /\.(html|htm)$/,
    loader: "html-withimg-loader" // 主要将 html 中使用 img 标签引入的图片使用动态路径 <img src="./aa.jpg">
}
```



### 编译 HTML



#### html-webpack-pligin 插件

在 webpack 中，是需要一个 html 模板的，这个 html 模板可以通过 html-webpack-pligin 自动生成默认模板；当然，也可以新建一个 index.html 模板，一般新建一个，因为可以通过 ejs 语法动态插值。通过 html-webpack-pligin 根据自定义模板生成的 html 会自动引入 bundle.js。除此以外，还可以做一些优化 html 的工作，比如压缩一行等。

通过 html-webpack-pligin 源码，可以看出是根据 .ejs 文件去生成的 html 模板

![](./imgs/img3.png)

安装：

```js
npm i html-webpack-plugin -D
```

使用：

- template：以什么为模板，不传，使用默认
- inject：打包后的资源插入的位置
  - true：默认值
  - false：不注入
  - body：注入 body 中
  - head：注入 head 中
- cache：设置为 true，只有当文件改变时，才会生成新的文件（默认值也是true） 

```
const HtmlWebpackPlugin = require("html-webpack-plugin")

plugins: [
    new HtmlWebpackPlugin({
        template: "./src/index.html", // 以什么为模板
    }),
]
```



除了这样，还可以通过一些参数去动态插值到 html 模板

> 注意，使用了 html-withimg-loader 后 <%= %> 这些语句不生效，需要：
>
> - 注释掉 html-withimg-loader
> - 后在入口 entry: ['./src/js/index.js', './src/index.html'] 删除 './src/index.html'

index.html：

```js
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title><%= htmlWebpackPlugin.options.title %></title>
</head>

<body>
    <div id="app"></div>
</body>

</html>
```

webpack.config.js

```js
new HtmlWebpackPlugin({
    title: 'gweid webpack',
    filename: 'index.html',
    template: './src/index.html', // 以什么为模板
}),
new DefinePlugin({
    BASE_URL: '"./"'
})
```

- <%= htmlWebpackPlugin.options.title %> 这个由 HtmlWebpackPlugin 中的 title 获得
- <%= BASE_URL %> 这个由 DefinePlugin 定义的全局常量获得



#### DefinePlugin 插件

- 定义全局常量，创建在编译时可用的全局变量，这些变量在打包时会被直接替换为对应的值
- 环境变量注入，常用于注入环境变量，如 process.env.NODE_ENV

基本使用

```js
const { DefinePlugin } = require('webpack')

module.exports = {

  plugins: [
    new DefinePlugin({
      BASE_URL: '"./"',
      'process.env.NODE_ENV': JSON.stringify('production') // 或 development 等
    })
  ]
};
```



#### copy-webpack-plugin 插件

如果使用了 `<link rel="icon" href="<%= BASE_URL %>favicon.ico">`，需要将 favicon.ico 复制到 dist，此时需要 copy-webpack-plugin 插件。copy-webpack-plugin 对于那些不需要通过 webpack 处理的静态资源非常有用。



安装：

```js
npm i copy-webpack-plugin@6.3.2 -D
```

> 注意，可能新版本 copy-webpack-plugin 有问题，所以安装 6.3.2 版本



使用：在 patterns 中设置复制规则

- **from：**设置从哪一个源中开始复制
- **to：**复制到的位置，可以省略，会默认复制到打包的目录下
- **globOptions：**设置一些额外的选项，比如可以编写需要忽略的文件

复制时会保留原始的目录结构，例如：public/images/logo.png 会被复制到 dist/images/logo.png

```js
const CopyWebpackPlugin = require('copy-webpack-plugin')

new CopyWebpackPlugin({
    patterns: [
        {
            from: 'public',
            globOptions: {
              	// 需要忽略的文件
                ignore: [
                    '**/index.html', // 已经由 HtmlWebpackPlugin 处理，所以这里忽略它
                    '**/.DS_Store' // mac 系统忽略这个
                ]
            }
        }
    ]
}),
```



### 开发环境自动编译

常见的在开发环境进行自动编译方式：

- 使用 webpack 的 watch 模式
- 使用 webpack-dev-server



#### webpack 的 watch 模式

1. 在 webpack.config.js 中添加 `watch: true`

   ```js
   module.exports = {
       watch: true
   }
   ```

2. 在 package.json 中添加 --watch

   ```js
   "scripts": {
       "watch": "webpack --watch"
   }
   ```



缺点：

- 只要有一个依赖文件发生变化，那么就会重新编译所有源代码
- 编译成功后，都需要生成新的 bundle.js 文件，那么就需要进行频繁的文件写入操作
- 不会自动刷新浏览器



#### webpack-dev-server

webpack-dev-server 在编译之后不会写入到任何输出文件。而是将 bundle 文件保留在内存中。实现这一点借助了一个库 [memory-fs](https://github.com/webpack/memory-fs) 这个库是由 webpack 本身维护的，后来不再使用，改为使用 [memfs](https://github.com/streamich/memfs) 

 ![](./imgs/img18.png)

安装：

```js
npm i webpack-dev-server -D
```

使用：

在 package.json 中：

```js
"scripts": {
    "serve": "webpack-dev-server"
}
```

> 执行 npm run serve ，这样已经可以开启一个本地服务。



**devServer 配置一览**

```js
devServer: {
  overlay: true,        // 配合 eslint 实时在浏览器弹出语法错误
  publicPath: '',       // 所有资源引入公共路径前缀
  watchOptions: {
    ignored: /node_modules/,  // 忽略 node_modules
  },
  compress: true,       // 启动 gzip 压缩
  port: 3000,           // 端口号
  open: true,           // 自动打开浏览器
  hot: true,            // 打开 HMR 模块热替换
  clientLogLevel: 'none', // 不显示启动服务器日志信息
  quiet: true,          // 除了一些基本启动信息，其他内容不显示

  // 服务器代理 ---> 解决开发环境中的跨域问题
  proxy: {
    '/api': {
      target: 'http://localhost:8888',
      changeOrigin: true
    },
  },
}
```



**devServer 的 hotOnly**

当代码编译失败时，是否刷新整个页面

- 默认情况下当代码编译失败修复后，我们会重新刷新整个页面
- 如果不希望重新刷新整个页面，而是仅仅更新错误的模块，可以设置 hotOnly 为 true，这样可以保留一些信息

```js
module.exports = {
  devServer: {
    hotOnly: true
  }
}
```



**devServer 的 host**

host 主要用来设置主机地址，默认值是 localhost，如果希望其他地方也可以访问，可以设置为 0.0.0.0

localhost 和 0.0.0.0 的区别

- localhost 本质上是一个域名，通常情况下会被解析成 127.0.0.1
- 0.0.0.0 监听IPV4上所有的地址，再根据端口找到不同的应用程序；比如监听 0.0.0.0 时，在同一个网段下的主机中，通过ip地址是可以访问的



**devServer 的 port、open、compress**

- port：设置监听的端口，默认情况下是 8080

- open：是否自动打开浏览器，true 即自动打开

- compress：为静态文件开启 gzip，true 开启

   ![](./imgs/img23.png)



**devServer 的 proxy**

主要作用是解决开发环境下的跨域问题

例如有一个后端服务，在 http://localhost:8888：

```js
const express = require('express');

const app = express();

const resList = [
  {
    id: '001',
    name: 'jack',
    age: 18
  },
  {
    id: '002',
    name: 'mark',
    age: 20
  }
]

app.get('/api/list', (req, res) => {
  return res.json(resList);
})

app.listen('8888', () => {
  console.log('开启服务: http://localhost:8888');
})
```

本地的代码跑在 http://localhost:3000

```js
import axios from 'axios'

axios
  .get('http://localhost:8888/api/list')
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  })
```

这样直接在 3000 端口访问 8888 端口的接口，就会报跨域的错误

此时可以配置 devServer 的 proxy 代理:

```js
devServer: {
    proxy: {
        '/api': {
          target: 'http://localhost:8888'
        },
      },
}
```

并且改写本地代码：

```js
axios
  .get('/api/list')
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  })
```

那么就可以实现接口代理



proxy 的 pathRewrite 作用：默认情况下，写成 `axios.get('/api/list')`，那么代理过去就是访问 `http://localhost:8888/api/list`，现在接口默认是写在 `http://localhost:8888/api/list`,没问题，如果接口是：

```js
const express = require('express');

const app = express();

const resList = []

app.get('/list', (req, res) => {
  return res.json(resList);
})
```

直接是 app.get('/list')，那么就可以使用 pathRewrite 

```js
devServer: {
    proxy: {
        '/api': {
          target: 'http://localhost:8888'
        },
        // 将 api 替换成 空
        pathRewrite: {
          '^/api': '',
        }
      },
}
```



proxy 的 secure：默认情况下，是**不支持代理到 https ** 的服务器上的，如果需要代理到 https，将 secure 的值设置为 false

```js
devServer: {
    proxy: {
        '/api': {
          target: 'http://localhost:8888'
        },
        // 将 api 替换成 空
        pathRewrite: {
          '^/api': '',
        },
        secure: false
      },
}
```



**proxy 的 changeOrigin**：比如真实请求，是需要通过 http://localhost:8888 来请求的，但是这里因为使用了代理，所以浏览器里面看到的是通过 http://localhost:3000 发送的请求，这会可能有问题：当服务器开启了请求来源的校验的时候，发现端口是 3000，不符合 8888，那么就会禁止请求。此时就需要将 changeOrigin 的值设置为 true,那么会将代理请求中的 headers 中的 host 属性修改为 proxy 的 target 一致

怎么确定有修改到：webpack-dev-server 开启本地服务是使用的 http-proxy-middleware 这个包，这个包里面使用了 http-proxy，查看这个包源码可以确定

![](./imgs/img24.png)



**devServer 的 historyApiFallback：**

主要用来处理 SPA 页面在路由跳转之后，进行页面刷新时，返回 404 的错误的问题

```js
module.exports = {
    devServer: {
        historyApiFallback: true
    }
}
```

webpack-dev-server 的 historyApiFallback 是基于[connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback) 这个库实现的



**devServer 的 contentBase**

用于提供静态资源，只有在你想要提供静态文件时才需要，**可以不是本地打包出来的静态资源**

比如：文件夹中有 /public/mock.json 

```js
const path = require('path');
 
module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'public')
  }
};
```

访问 http://localhost:8080/mock.json 即可

还可搭配 contentBasePublicPath 使用，比如上面这个例子把 public 文件夹抹平了，实际生产环境，为了区分，需要加上文件前缀用于区分，最终访问的地址 http://localhost:8080/data/mock.json；可以搭配 contentBasePublicPath 来实现

```js
const path = require('path');
 
module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    contentBasePublicPath: '/data'
  }
}
```



**devServer 的 publicPath**

- 默认值就是 /，也就是说直接访问端口即可访问其中的资源 `http://localhost:8080`
- 如果将其设置为 /www，那么在访问的时候就需要带上 `http://localhost:8080/www`
- 那么，bundle.js 通过 `http://localhost:8080/bundle.js` 也是无法访问的，**需要将 output.publicPath 也设置为 /www；并且官方也是建议 devServer 的 publicPath 和 output 的 publicPath 一致**

```js
module.exports: {
    output: {
        publicPath: '/www'
    },
    devServer: {
        publicPath: '/www'
    }
}
```

> 一般也不怎么去配置 devServer 的 publicPath，直接访问 `http://localhost:8080` 即可



#### 模块热替换 HMR

模块热替换是指在应用程序运行过程中，替换、添加、删除模块，而**无需重新刷新整个页面**

- 不重新加载整个页面，这样可以保留某些应用程序的状态不丢失
- 修改了css、js源代码，会立即在浏览器更新



使用 HMR： webpack-dev-server 已经支持 HMR，需要配置开启一下即可

> 在不开启 HMR 的情况下，当我们修改了源代码之后，整个页面会自动刷新，使用的是 live reloading



在 webpack.config.js 中，使用 webpack-dev-server 配合 HotModuleReplacementPlugin 开启 HMR：

```js
module.exports: {
    devServer: {
      hot: true // 打开 HMR 模块热替换
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
   }
}
```

> webpack-dev-server 3.x 可以不用手动配置 HotModuleReplacementPlugin，因为内部判断是否 hot: true，如果是会自动加 HotModuleReplacementPlugin 插件
>
> 具体查看：https://github.com/webpack/webpack-dev-server/blob/8bbef6adf6ae5f6a3109ecd4a6246223d2f77cb2/lib/utils/addEntries.js#L153



然后需要指定哪些模块发生变化时，需要使用热更新。在入口文件处

```js
import './hmr_test';

if (module.hot) {
  module.hot.accept('./hmr_test.js', () => {});
}
```



但是这有个问题，项目开发中，每个引入文件都需要这样子配置太过于麻烦。可以使用 `hot-module-replacement-loader` 这个 loader 自动注入 HMR 代码：

```js
module.exports = {

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'hot-module-replacement-loader']
      }
    ]
  }
};
```



其实一些第三方框架比如 vue、react 都提供了方案去实现

- vue：使用 vue-loader，支持 vue 组件的 HMR
- react：使用 react-refresh



**HMR 基本原理：**

建议参考：

- [一文了解 Webpack 热更新 (HMR) 原理](https://juejin.cn/post/7300118821531942927?searchId=20250606152312EF50823D2CA7896D5B0C)
- [webpack5之HMR原理探究](https://juejin.cn/post/7413774752833421349?searchId=2025060615371898C89382C7BE50505E89#heading-5)
- [Webpack HMR（热更新）的实现原理吧](https://juejin.cn/post/7345727329410187276?searchId=2025060615371898C89382C7BE50505E89)

![](./imgs/img41.png)

右侧`Server`端使用`webpack-dev-server`去启动本地服务，内部实现主要使用了`webpack`、`express`、`websocket`

- 使用`express`启动本地服务，当浏览器访问资源时对此做响应。

- 服务端和客户端使用`websocket`实现长连接

- `webpack`监听源文件的变化，即当开发者保存文件时触发`webpack`的重新编译

  - 每次编译都会生成`hash值`、`已改动模块的json文件`、`已改动模块代码的js文件`
  - 编译完成后通过`socket`向客户端推送当前编译的`hash戳`

- 客户端的`websocket`监听到有文件改动推送过来的`hash戳`，会和上一次对比

  - 会先判断是浏览器刷新还是模块热更新，如果是浏览器刷新，那么直接刷新，不会有后续

  - 如果是热更新，会判断 hash 是否一致，一致则走缓存

  - 不一致则通过`ajax`和`jsonp`向服务端获取最新资源，会得到两个文件 .json（manifest文件）和 .js 文件（update chunk）

- 浏览器拿到两个新的文件后，通过 HMR runtime 机制，加载这两个文件，并且针对修改的模块进行更新；分三步：

  - 找出过期模块 `outdatedModules` 和过期依赖 `outdatedDependencies` ；
  - 从缓存中删除过期模块、依赖和所有子元素的引用；
  - 将新模块代码添加到 modules 中，当下次调用 `__webpack_require__` (webpack 重写的 `require` 方法)方法的时候，就是获取到了新的模块代码了。

- 现在新代码已经替换旧代码，但是业务代码并不知道这些变化，因此需要通过 `accept`事件通知应用层使用新的模块进行“局部刷新”：

  ```js
  if (module.hot) {
    module.hot.accept('./library.js', function() {
      // 使用更新过的 library 模块执行某些操作...
    })
  }
  ```



### 清空出口目录 clean-webpack-plugin

```js
const {
    CleanWebpackPlugin
} = require("clean-webpack-plugin") // webpack4 之后需要这样引入


plugins: [
    new CleanWebpackPlugin()
]
```



### 抽离 css

-   注意：抽离 css 需要配置一下 miniCssExtractPlugin 的 publicPath， 不然 CSS 里面的图片路径是以 CSS 目录为根目录的

```js
const miniCssExtractPlugin = require("mini-css-extract-plugin") // 抽离 css, 将 css 从 js 中抽离出来，减少 js 体积，有利于减少页面加载时间

{
    test: /\.css$/,
    use: [
        // "style-loader", // 将 css 插入 head 标签
        {
            loader: miniCssExtractPlugin.loader, // 抽离 css
            options: {
                // 抽离 css 一定要在这里配置 publicPath，不然 CSS 里面的图片路径是以 CSS 目录为根目录的
                publicPath: "../"
            }
        },
        "css-loader", // 将 css 以模块引入
    ]
}, {
    test: /\.scss$/,
    use: [
        // "style-loader",
        {
            loader: miniCssExtractPlugin.loader, // 抽离 css
            options: {
                // 抽离 css 一定要在这里配置 publicPath，不然 CSS 里面的图片路径是以 CSS 目录为根目录的
                publicPath: "../"
            }
        },
        "css-loader",
        "sass-loader"
    ]
}

plugins: [
    // 抽离 css  将 css 从 js 中抽离出来，减少 js 体积，有利于减少页面加载时间
    new MiniCssExtractPlugin({
        filename: "css/main.css" // 分离到到 main.css
    }),
]
```



### css 浏览器兼容

使用 postcss-loader + autoprefixer

**认识 postcss：**

首先，postcss 本身是独立的，它可以在很多地方使用，并不局限于 webpack 中；但是它本身提供很少的功能，更多的功能依赖于插件，比如加浏览器前缀就是需要 autoprefixer 这个插件

而在 webpack 中使用 postcss，那么需要的就是 postcss-loader



- 在 postcss.config.js 中配置 autoprefixer；**但更多的是使用 postcss-preset-env**，因为 postcss-preset-env 除了本身内置了 autoprefixer 的功能，还可以帮助我们将一些现代的 css 特性，转成大多数浏览器认识的 css，并且会根据目标浏览器或者运行时环境添加所需的 polyfill； 很多框架的 cli 也是使用的 postcss-preset-env
- 在 package.json 中配置 browserslist，或者使用 .browserslistrc

  - Browserslist：是一个在不同的前端工具之间，共享目标浏览器和 Node.js 版本的配置，比如下面的都会依赖于 Browserslist
    - autoprefixer
    - babel
    - postcss-preset-env
    - ......
  - Browserslist 常用规则：
    - defaults：Browserslist的默认浏览器（> 0.5%, last 2 versions, Firefox ESR, not dead）
    - \> 5%：浏览器市场占有份额大于 5%
    - dead：24个月内没有官方支持或更新的浏览器，一般配置 not dead
    - last 2 versions：每个浏览器的最后2个版本，这个版本指的的大版本
  - Browserslist 怎么知道这些规则：
    - 在 node_modules/browserslist/index.js 下引入了 caniuse-lite 去判断

  - 查看浏览器市场占有率：https://www.caniuse.com/usage-table



**使用 autoprefixer：**

在 webpack 中配置 postcss-loader

```
npm i postcss-loader autoprefixer -D

// postcss.config.js 中
module.exports = {
    // autoprefixer 没用需要设置 browserslist
    plugins: [
        require('autoprefixer') // 浏览器的兼容性，有时候我们必须加入 -webkit, -ms, -o, -moz 这些前缀
    ]
}

// package.json 或者单独的 .browserslistrc 文件
"browserslist": [
    "last 1 version", // 即支持各类浏览器最近的一个版本
    "> 0.2%",  // 支持市场份额大于 0.2% 的浏览器
    "not dead" // 除了死亡的浏览器
]

// webpack.config.js
{
    test: /\.css$/,
    use: [
        // "style-loader", // 将 css 插入 head 标签
        {
            loader: miniCssExtractPlugin.loader, // 抽离 css
            options: {
                // 抽离 css 一定要在这里配置 publicPath，不然 CSS 里面的图片路径是以 CSS 目录为根目录的
                publicPath: "../"
            }
        },
        "css-loader", // 将 css 以模块引入
        "postcss-loader",  // postcss-loader 配合 postcss.config.js 的 autoprefixer 加入 -webkit, -ms, -o, -moz 这些前缀
    ]
}, {
    test: /\.scss$/,
    use: [
        // "style-loader",
        {
            loader: miniCssExtractPlugin.loader, // 抽离 css
            options: {
                // 抽离 css 一定要在这里配置 publicPath，不然 CSS 里面的图片路径是以 CSS 目录为根目录的
                publicPath: "../"
            }
        },
        "css-loader",
        "postcss-loader",
        "sass-loader"
    ]
}
```

或者不单独使用 postcss.config.js 文件，直接在 webpack.config.js 中配置：

```js
{
    test: /\.css$/,
    use: [
        "style-loader", // 将 css 插入 head 标签
        "css-loader", // 将 css 以模块引入
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        require('autoprefixer')
                    ]
                }
            }
        }
    ]
}
```



**使用 postcss-preset-env：**
安装：

```js
npm i postcss-preset-env -D
```

使用：

```js
{
    test: /\.css$/,
    use: [
        "style-loader", // 将 css 插入 head 标签
        "css-loader", // 将 css 以模块引入
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        require('postcss-preset-env')
                    ]
                }
            }
        }
    ]
}
```



**使用 @import "./test.css" 问题：**

当在 index.css 中通过 @import "./test.css" 引入 css，那么这个引入的 css 是不会被 postcss-loader 去处理的，因为 @import "./test.css" 属于 css 语法，不属于 js，直接被 css-loader 处理，那么需要配置一下 css-loader

- importLoaders 的值取决于 css-loader 之前还有几个 loader，如这里，之前只有一个 postcss-loader，那么值为 1

```js
// 在 webpack.config.js 中
{
    test: /\.css$/,
    use: [
        "style-loader", // 将 css 插入 head 标签
        {
            loader: "css-loader",
            options: {
                importLoaders: 1
            }
        }, // 将 css 以模块引入
        'postcss-loader'
    ]
}


// 在 postcss.config.js 中
module.exports = {
    // 还需要设置 browserslist
    plugins: [
        require('postcss-preset-env')
    ]
}
```



### 压缩 css 

**使用 css-minimizer-webpack-plugin （官方使用）**

```
npm i css-minimizer-webpack-plugin -D
```

```js
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin")

module.exports = {
    optimization： {
        // minimize: true, // 开启或者关闭 minimizer，生产环境默认开启
        minimizer: [
            new CssMinimizerWebpackPlugin() // 使用默认配置已经足够
        ]
    }
}
```

**使用 optimize-css-assets-webpack-plugin**

```js
npm i optimize-css-assets-webpack-plugin -D
```

```
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
plugins: [
    new OptimizeCssAssetsWebpackPlugin() // 直接使用默认配置已经足够
]
```



### babel 做 js 兼容性处理

#### 什么是babel

babel 是一个工具链，用于将 ES6+ 的代码转换为向下兼容的 JS 代码，包括：语法转换（jsx、ts 等）、源代码转换、Polyfill 等。

并且 babel 和 postcss 一样，是一个独立的工具，并不是说必须依赖于 webpack 才能使用，只是 babel 在 webpack 中使用提供了 babel-loader



#### babel 基本原理

> 备注：代码在 test/babel 中

babel 其实就是一个转译器，将我们的源代码转换为另外一种源代码（目标代码）

其基本编译流程

- 解析阶段（parse）
- 转换阶段（transformation）
- 生成阶段（code generation）

![](./imgs/img15.jpg)

- 源代码经过词法分析，转换为 tokens 数组

  - 词法分析就是对代码逐个单词进行分析，例如 `const name = 'jack'`，那么会分析 `const`、`name`、`=`、`\'jack\'`

  - 生成的 token 数组就是分析的每一个词的组合

    ```js
    // tokens 数组
    [
      {
          "type": "Keyword",
          "value": "const"
      },
      {
          "type": "Identifier",
          "value": "name"
      },
      {
          "type": "Punctuator",
          "value": "="
      },
      {
          "type": "String",
          "value": "\'jack\'"
      },
    ]
    ```

- 将 tokens 进行语法分析（也叫 parse），转换成 ast 树

- 对 ast 语法树进行遍历（traversal）、访问（visitor），当遇到某一个节点符合需要使用某个 plugin 进行转换的条件，那么使用这个 plugin 转换节点；最后生成一个新的 ast

- 根据新的 ast 生成转换后的代码



#### babel-loder 的使用

- babel 不能直接对 es6 语法进行转换，需要依赖于 babel 的 插件，一般使用 @babel/preset-env

- @babel/preset-env 只能转换一些基本语法，类似 promise 之类不转换（@babel/preset-env 是 根据 browserslist 的浏览器兼容来进行转换的）

  *还可以给 @babel/preset-env 设置一些属性*

  - targets：设置目标浏览器，一般不直接在这里设置，而是使用 browserslist 去设置

- 使用 core-js 对更高级语法的转换

```
npm i babel-loader @babel/core @babel/preset-env core-js -D

{
    test: /\.js/,
    exclude: /node_modules/, // 排除 node_modules
    loader: 'babel-loader',
    options: {
        // 预设：指示 babel 做怎么样的兼容性处理
        // 这只能做一些基本的，类似 promise es7 之类的语法还需要额外处理
        presets: [
            [
              '@babel/preset-env',
              {
                // useBuiltIns: 'usage'   按需加载
                useBuiltIns: 'usage',
                // corejs: 3   指定 corejs 版本
                corejs: {
                  version: 3,
                },
                // targets 具体兼容到哪个浏览器
                // 或者可以通过 browserslist 来配置浏览器兼容
                // 如果 targets 和 browserslist 都配置了，targets 会覆盖 browserslist
                // 实际使用更推荐通过 browserslist 来配置，因为 browserslist 不仅仅是可以 babel 可以使用，postcss 也可以使用
                targets: {
                  chrome: '58',
                  firefox: '40',
                  ie: '9',
                  edge: '17',
                  safari: '10',
                },
            },
        ],
    ],
  },
}
```



#### babel 的配置文件

babel 的配置信息可以单独配置在一个文件里面

单独配置的好处：可抽离，如果多个项目都用到或者 js 和 ts 都需要用到，那么只需要复制一份，然后在 webpack 中直接写一个 babel-loader 即可

babel 提供了两种单独配置的方式

- babel.config.json（或者.js，.cjs，.mjs）文件
- .babelrc.json（或者.babelrc，.js，.cjs，.mjs）文件

目前很多的项目都采用了多包管理的方式，`.babelrc.json` 对于配置 Monorepos 项目是比较麻烦的，所以更推荐的是 `babel.config.js` 的方式

使用：

```js
// 在 babel.config.js 中
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // useBuiltIns: 'usage'   按需加载
        useBuiltIns: 'usage',
        // corejs: 3   指定 corejs 版本
        corejs: {
          version: 3,
        },
      },
    ],
  ],
  plugins: []
};
```

在 webpack.config.js 中只需要把 babel-loader 写上即可，不再需要在这里写一堆配置

```js
{
    loader: 'babel-loader'
},
```



#### 认识 polyfill

主要的意思就是垫片、补丁

当使用了一些语法特性（例如：Promise, Generator, Symbol、Array.prototype.includes等），浏览器并不会识别，这个时候就需要 polyfill 来进行打补丁

使用：

- 在 babel 7.40 之前，通常使用 @babel/polyfill的包
- babel7.4.0 之后，已经不推荐使用 @babel/polyfill；而是单独引入core-js 和 regenerator-runtime 来完成 polyfill 的使用

在 babel.config.js 中配置 polyfill：

- useBuiltIns：设置以什么样的方式来使用 polyfill 
  - false：打包后的文件不使用 polyfill 来进行适配
  - usage：会根据源代码中出现的语言特性，按需加载所需要的 polyfill，这样可以确保最终包里的 polyfill 数量的最小化；可以配合 corejs 版本使用。直接使用 usage 可能会有问题，比如一些第三方库本身有自己的 polyfill ，那么就可能就有冲突，**所以需要配置 babel-loader 忽略 node_modules; `exclude: /node_modules/,`**
  - entry：如果我们依赖的某一个库本身使用了某些 polyfill 的特性，但是因为我们使用的是 usage，所以之后用户浏览器可能会报错。如果担心出现这种情况，可以使用 entry。此时就需要在**入口文件手动**添加 `import 'core-js/stable'; import 'regenerator-runtime/runtime'。但是这样做会根据 browserslist 目标导入所有的 polyfill，对应的包也会变大
- corejs：设置corejs 的版本，目前使用比较多的是 3.x 版本；也可以设置是否对提议阶段的特性进行支持，将 proposals 属性设为 true 即可

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: {
          version: 3,
        }
      }
    ]
  ]
};
```



#### plugin-transform-runtime

在使用 useBuiltIns + corejs 配置 polyfill 的时候，默认情况是添加的所有特性都是全局的；如果我们正在编写一个工具库，这个工具库需要使用 polyfill； 别人在使用我们工具时，工具库通过 polyfill 添加的特性，可能会污染它们的代码；所以，当编写工具时，babel 更推荐使用一个插件： @babel/plugin-transform-runtime 来完成polyfill 的功能



主要解决以下两个问题：

- **复用辅助代码，减少打包体积**
  - Babel 在转换语法（如 `class`、`async/await`）时会生成一些**辅助函数（helper functions）**，例如 `_classCallCheck`、`_asyncToGenerator`
  - 默认情况下，这些辅助函数会**直接插入到每个文件中**，导致重复代码
  - **`transform-runtime` 会将这些辅助函数从 `@babel/runtime` 中引用**，避免重复定义

- **避免全局污染（Polyfill 按需引入时）**：
  - 当使用 `@babel/preset-env` + `useBuiltIns: "usage"` 按需引入 Polyfill 时，Babel 会直接在全局作用域（如 `window.Promise`）或原型链（如 `Array.prototype.includes`）上添加方法
  - **`transform-runtime` 会以非污染方式引入 Polyfill**，通过模块化引用（如 `_Promise` 代替全局 `Promise`），适合开发库（Library）时避免影响宿主环境



安装：

```js
npm install @babel/plugin-transform-runtime -D
```



还有就是对应安装对应版本的 corejs3

| false    | npm i @babel/runtime -S         |
| -------- | ------------------------------- |
| corejs 2 | npm i @babel/runtime-corejs2 -S |
| corejs 3 | npm i @babel/runtime-corejs3 -S |



使用：

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env'
    ],
  ],
    plugins: [
        [
            '@babel/plugin-transform-runtime', {
                'corejs': 3
            }
        ]
    ]
};
```

> 这个只是开发第三方库的时候需要注意的，平常使用 useBuiltIns + corejs 即可



#### babel 对 JSX 的转换

使用插件 `@babel/preset-react`，安装：

```js
npm install @babel/preset-react -D
```



使用：

```js
module.exports = {
  presets: [
    [
      '@babel/preset-react'
    ]
  ]
};
```



#### babel 对 ts 的准换

在 webpack 中使用 ts，有两种方案：

- 第一种，使用 ts-loader

  安装：

  ```js
  npm i typescript ts-loader -D
  ```

  使用：

  1. tsc --init：初始化一份 tsconfig.json 配置（如果命令失败，全局安装一下 typescript `npm i typescript -g`）

  2. ```js
     {
       test: /\.tsx?/,
       exclude: /node_modules/,
       use: ['babel-loader', 'ts-loader']
     }
     ```

     使用 babel-loader 是为了将 Promise 之类的语法转换为 es5 的语法

     使用了 babel-loader 之后可以看到 Promise 语法在 bundle.js 中被定义：

     `modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");`

- 第二种，使用 @babel/preset-typescript

  安装：

  ```js
  npm install @babel/preset-typescript -D
  ```

  使用：

  1. 在 babel.config.js 中：

     ```js
     module.exports = {
       presets: [
         ['@babel/preset-typescript']
       ]
     }
     ```

  2. 在 webpack.congih.js 中

     ```js
     {
       test: /\.tsx?/,
       exclude: /node_modules/,
       use: 'babel-loader'
     }
     ```



两种编译 ts 的方法对比：

- ts-loader + babel-loader：编译时间稍微多点，编译有错误提示

- @babel/preset-typescript：编译时间快，但是编译没有错误提示。例如 ts 文件

  ```js
  const fun = (str: string) => {
      console.log(str)
  }
  
  fun(123)
  ```

   函数 fun 的参数要求是 string 类型，此时编译器已经报错，但是执行 `npm run build` 依然能够正常编译成功

  解决： 通过 npm 的 tsc 脚本进行监控错误

  ```js
  "scripts": {
     // 再开一个 npm 脚本自动检查类型
    "type-check": "tsc --watch",
  },
  ```



#### babel 的 Stage-X

主要就是分阶段加入不同的语言特性

- Stage 0：任何尚未提交作为正式提案的讨论、想法变更或者补充都被认为是第 0 阶段的（就是还没有正式提案，仅仅作为设想）
- Stage 1：提案已经被正式化，并期望解决此问题，还需要观察与其他提案的相互影响
- Stage 2：Stage 2 的提案应提供规范初稿、草稿。此时，语言的实现者开始观察 runtime 的具体实现是否合理
- Stage 3：Stage 3 提案是建议的候选提案。在这个高级阶段，规范的编辑人员和评审人员必须在最终规范上签字。**Stage 3 的提案不会有太大的改变，在对外发布之前只是修正一些问题**
- Stage 4：finished（完成），进入 Stage 4 的提案将包含在 ECMAScript 的下一个修订版中

在 babel 老版本中，常看见使用：

```js
{
    loader: 'babel-loader',
        options: {
            presets: [
                [
                    'Stage-3',
                ],
            ],
        },
}
```

> 在 babel 7 开始，已经不建议使用 Stage-X 了，而是使用 preset-env



#### babel 的 preset 与 plugin

- Babel Plugin 一般尽可能拆成小的力度，开发者可以按需引进。比如对 ES6 转 ES5 的功能，Babel 官方拆成了 20+ 个 Plugin。  

- 这样的好处显而易见，既提高了性能，也提高了扩展性。比如开发者想要体验 ES6 的箭头函数特性，那他只需要引入 `transform-es2015-arrow-functions` 插件就可以，而不是加载 ES6 全家桶。

- 但很多时候，逐个插件引入的效率比较低下。比如在项目开发中，开发者想要将所有 ES6 的代码转成 ES5，插件逐个引入的方式令人抓狂，不单费力，而且容易出错。

- 这个时候，可以采用 Babel Preset。可以简单的把 Babel Preset 视为 Babel Plugin 的集合。比如 `babel-preset-es2015` 就包含了所有跟 ES6 转换有关的插件。



### js 压缩

在 webpack4，**只要将 mode 改为 production 将自动压缩 js 代码** 。主要是 webpack4 以上如果是生产环境，默认使用的是 terser 去对代码进行压缩

> 早期，很多使用 uglify-js 来对代码进行压缩，但是目前已经不再维护，并且不支持ES6+的语法，Terser 是从 uglify-es fork 过来的，并且保留它原来的大部分API以及适配 uglify-es 和 uglify-js@3 等

terser 是一个独立的工具，直接命令行也是可以使用，但是现在前端工程化的时代，一般搭配 webpack 之类的打包工具使用

如果想要在 webpack 中自定义 terser，那么可以使用 terser-webpack-plugin 插件

安装：

```js
npm i terser-webpack-plugin -D
```

使用：

- extractComments：是否将注释抽取到一个单独文件(生产环境不需要) 默认是 true

  默认为 true，会生成一份注释文件

   ![](./imgs/img31.png)

  一般不需要，设置为 false

- parallel：使用多进程并发运行提高构建的速度，默认值是true

- cache：开启缓存

- sourceMap：启动 source-map, 启动 source-map, 如果生产生产环境要 source-map，必须设置为 true，不然内联的 source-map 可能会被压缩掉

- terserOptions：更多细致化的配置，例如去除 console.log 等，可以查看 https://webpack.docschina.org/plugins/terser-webpack-plugin/#terseroptions

```js
module.exports = {
    optimization： {
        // minimize: true, // 开启或者关闭 minimizer，生产环境默认开启
        minimizer: [
            new TerserWebpackPlugin({
                cache: true, // 开启缓存
                parallel: true, // 开启多进程打包
                extractComments: false,
                // sourceMap: true,

                // 去除 console.log 
                // terserOptions: {
                //   compress: {
                //     drop_console: true,
                //   },
                // },
            }),
        ]
    }
}
```



### html 压缩

使用 html-webpack-plugin，安装：

```js
npm i html-webpack-plugin -D
```

使用：

> 使用 minify 默认会使用一个插件 html-minifier-terser

```
plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html', // 以什么为模板
      // 压缩 HTML 的配置(开发环境不需要压缩)
      minify: MODE === 'production' ? {
        removeComments: true, // 是否去掉注释
        collapseWhitespace: true, // 折叠成一行
      } : false,
    })
]
```



### ESLint

ESLink：是一个静态代码分析工具，可以帮助我们在项目中建立统一的团队代码规范，保持正确、统一的代码风格，提高代码的可读性、可维护性



安装：

```js
npm i eslint -D
```

初始化一份配置：

```js
npx eslint --init
```



编译代码时，对代码进行 eslint 检测

安装：

```js
npm i eslint-loader -D
```

使用：

```js
use: ['babel-loader', 'eslint-loader']
```

> 要在 babel-loader 转译代码之前使用

配合 webpack-dev-serve 进行浏览器实时提示

```js
devServer: {
  overlay: true, // 配合 eslint 实时在浏览器弹出语法错误
}
```



通过 vscode 插件辅助 eslint

- 安装 ESLint 插件

   ![](./imgs/img15.png)

  那么就可以在写代码期间编译器就会有代码风格错误提示

- 安装 Prettier 插件

   ![](./imgs/img16.png)

  并且配置

  ![](./imgs/img17.png)

  再在项目 .eslintrc.js 同级目录 下新建 .prettierrc 里面配置需要使用的 prettier 规则，就可以在保存的时候自动修正代码规范



### 编译 Vue 文件

需要安装两个模块：

- `npm i vue-template-compiler -D `
- `npm i vue-loader -D`

在 webpack.config.js 中配置：

```js
const VueLoaderPlugin = require('vue-loader/lib/plugin')

{
    test: /\.vue$/,
    use: ['vue-loader']
}

plugins: [
    new VueLoaderPlugin()
]
```



### resolve 模块解析

resolve 用于设置模块如何被解析，比如我们自己写的模块或者从 node_modules 中引入的模块等。

使用了 [enhanced-resolve](https://github.com/webpack/enhanced-resolve) 来解析模块路径，通过这个库，webpack 能解析三种绝对路径

- 绝对路径（/xxx/yy）不需要再做进一步解析

- 相对路径（../../xxx）根据给定的相对路径，会拼接此上下文路径，来生成模块的绝对路径

- 模块路径：在 resolve.modules 指定的所有目录检索模块，默认值是 [node_modules]，可以添加自己的模块

  ```js
  module.exports = {
    //...
    resolve: {
      modules: ['node_modules', path.resolve(__dirname, 'my_modules')],
    },
  };
  ```

  表示在 node_modules 中找不到就到自己定义的 my_modules 中查找



**例子1：**有文件夹 Home，下面有 home.js 文件，我们在引用的时候经常 `import Home from './Home/home'`，不需要写 .js 也可以，主要是 resolve 解析路径时，如果是文件，并且带有后缀名，那么直接打包，没有后缀名，那么会去匹配 resolve.extensions 里面的后缀名（resolve.extensions 默认是 ['.wasm', '.mjs', '.js', '.json']）,匹配上就打包，匹配不上报错

**例子2：**有文件夹 Home，下面有 index.js 文件，引用时 `import Home from 'Home'`，而不需要具体到 index.js，是因为 resolve 解析路径时，发现是文件夹，那么根据 resolve.mainFiles 配置选项中指定的文件顺序查找（resolve.mainFiles 默认值是 ['index']）,然后再根据 resolve.extensions 去匹配后缀名



resolve 常用的属性：

- mainFiles：如果引用是文件夹时，需要指定这个文件夹下的哪个文件，默认是 ['index']

  ```js
  module.exports = {
    //...
    resolve: {
      mainFiles: ['index', 'myIndex']
    }
  }
  ```

- extensions：解析到文件时自动添加扩展名，默认是 ['.wasm', '.mjs', '.js', '.json']

  ```js
  module.exports = {
    //...
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.json', '.vue', 'jsx']
    }
  }
  ```

- alias：配置别名

  ```js
  resolve: {
    alias: {
      '@css': path.resolve(__dirname, 'src/css'),
    }
  }
  ```



## webpack 性能优化



主要分为 开发环境 和 生产环境 进行优化



### 开发环境性能优化



开发环境一般关注的是开发效率，比较常见的手段是开启 HMR 和 sourcemap



#### 优化构建速度

##### HMR hot module replacement 热模块替换

作用：只对有变动的模块进行重新打包更新

```
// !!!!!!!!!! 注意：使用 MiniCssExtractPlugin 抽离的 css 对热替换没用， 一般开发环境不抽离 css，使用热替换；生产环境抽离 css !!!!!!!!!!
* 1、css 因为有 style-loader, 所以可以 HMR
* 2、js 默认不能使用 HRM
* 3、html 也没办法做 HMR。 但开启了 HMR 会导致修改 html 不会更新   解决: 将入口修改  entry: ['./src/js/index.js', './src/index.html']


// 1、在 devServer 将 hot 开启

const webpack = require("webpack")

devServer: {
  // 要运行的目录 只是在内存中编译打包，不指向真正的目录
  contentBase: path.resolve(__dirname, 'dist'),
  compress: true, // 启动 gzip 压缩
  progress: true, // 显示进度条
  port: 3000, // 端口
  open: true, // 自动打开浏览器
  hot: true, // 打开 HMR 模块热替换
},
```



#### 优化代码调试 source-map: 源代码到构建代码的映射

经过 webpack 编译后：

- 真实跑在浏览器上的代码，和我们编写的代码其实是有差异的；

- 比如 ES6 的代码可能被转换成 ES5；

- 比如对应的代码行号、列号在经过编译后肯定会不一致；

- 比如代码进行丑化压缩时，会将编码名称等修改；

- 比如我们使用了 TypeScript 等方式编写的代码，最终转换成 JavaScript

而 source-map 可以通过映射关系在构建后的代码中找到错误代码在源代码所在位置

**source-map 组成：**

- version：版本，当前版本为3；最开始的 source-map （版本1）的体积是源代码的 10 倍，版本 2 减少了 50%，版本 3 又减少 50%，所以当前版本 3 的体积相当于源代码的 2.5 倍
- sources：没经过转换的文件（没转换之前是各个模块，转换之后可能就一个 bundle.js 文件，所以需要标记源文件）
- name：没经过转换之前的变量和属性名（转换后的变量名可能是之前的缩写）
- mappings：用来和源文件映射的信息（比如位置信息等），一串base64 VLQ（veriable length quantity可变长度值）编码
- file：打包后的文件
- sourcesContent：转换前的源代码
- psourceRoot：所有的sources相对的根目录

**使用 source-map：**

1. 在 webpack 打包的时候，根据 devtool 生成 source-map

2. 在打包后的产物 bundle.js 最后添加一行注释 `//# sourceMappingURL=bundle.js.map`
3. 浏览器会根据这行注释，查找响应的 source-map

**webpack 中 devtool 配置：**

不同的配置生成的 source-map 也会有差异，而且会影响打包性能。而 devtool 的值可以通过组合多达 26 种情况

1. 不会生成 source-map 的情况：

   - false：不使用 source-map，也就是没有任何和 source-map 相关的内容

   - none：production 模式下的默认值，不生成 source-map

   - eval：development 模式下的默认值，不生成 source-map；但是它会在 eval 执行的代码中，添加 `//# sourceURL=`，它会被浏览器在执行时解析，并且在调试面板中生成对应的一些文件目录，方便调试代码（webpack 使用 eval 函数是因为 eval 函数可以添加  `//# sourceURL=` 这个注释，帮助找到错误位置）

     ![](./imgs/img7.png)

     eval 错误警告：

     ![](./imgs/img8.png)

2. source-map：生成一份完整的 source-map 文件

    ![](./imgs/img9.png)

   错误也会准确被定位：

   ![](./imgs/img10.png)

3. eval-source-map：会生成 sourcemap，但是 source-map 是以 DataUrl 形式添加到 **eval 函数**的后面

   ![](./imgs/img11.png)

   > 只要有 eval 这个关键字，并且带 source-map，而没有 nosources，那么 source-map 都是以 DataUrl 形式添加到 eval 函数的后面

   有 source-map 生成都是可以准确定位错误的

4. inline-source-map：会生成 sourcemap，但是source-map 是以 DataUrl 添加到 **bundle 文件**的末尾（与 eval 的区别： eval 是添加到 eval 函数后面，inline 是添加到 bundle 文件末尾）

   ![](./imgs/img12.png)

5. cheap-source-map：会生成 sourcemap，而且是外部 source-map文件，但 cheap 会更加高效一些（cheap低开销），因为它没有生成列映射（即报错信息是整个一行都标红），在开发中，通常只需要行信息通常就可以定位到错误了

    ![](./imgs/img13.png)

   可以看到，错误定位到了某一行，而没有定位到 abc 上

   > 注意： 直接 cheap-source-map 会有缺点，当使用了 loader 对代码进行了转换，那么报错代码的行数这些信息会不准确

6. cheap-module-source-map：如果使用了 loader 对代码转换，那么使用这个错误信息会更准确

7. hidden-source-map：会生成 sourcemap，**但是不会对 source-map 文件进行引用，如果需要使用，可以手动引入**

8. nosources-source-map：会生成 sourcemap，但是生成的 sourcemap 只有错误信息的提示，不会生成源代码文件

   ![](./imgs/img14.png)

综合上面：

webpack 对于 source-map 提供了 26 个值，是可以进行多组合的

组合规则：

- inline-|hidden-|eval：三个值三选一

- nosources：可选值

- cheap可选值，并且可以跟随 module 的值

  ```js
  [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
  ```

最佳实践：

- 开发阶段：推荐使用 source-map 或者 cheap-module-source-map（最好是 cheap-module-source-map，效率更高），这分别是 vue 和 react 使用的值，可以获取调试信息，方便快速开发
- 测试阶段：推荐使用 source-map 或者 cheap-module-source-map（最好是 cheap-module-source-map，效率更高）；测试阶段希望在浏览器下看到正确的错误提示
- 发布阶段：false、缺省值（不写）；发布阶段不需要，因为毕竟 source-map 有体积大小问题，对请求响应有影响。而且，如果生产环境有 source-map，那么就意味着可以通过错误还原源代码，导致代码不安全。



### 生产环境性能优化



#### 优化打包速度

主要点：**缓存 + 多进程 + 减少匹配**



##### oneOf

-   就是有很多 loader，每个文件都会被所有的 loader 过一遍，其实这里面只有处理相关文件的 loader 会被命中(注意： 如果多个 loader 处理一个文件，需要把多出来的 loader 提到 oneOf 外面)

```
rules: [
    {}, // 另外一个处理 js 的 loader
    {oneOf: [
        {}, 处理 css 的 loader
        {}, 处理 js 的 loader
    ]}
]
```



##### 缓存

-   babel 缓存就是在生产环境中，当只改变一个 js，其他没变，那么打包时不可能又把所有的 js 编译一次，这时候应该使用 babel 缓存

```
// 使用 babel 缓存只需要在 babel 的 options 中加入 cacheDirectory: true

{
    test: /\.js/,
    exclude: /node_modules/, // 排除 node_modules
    loader: 'babel-loader',
    options: {
        // 开启 babel 缓存，第二次打包时，会读取之前的缓存，优化打包速度
        cacheDirectory: true
    },
}
```



##### 多进程打包



官方推荐使用 `thread-loader`，将耗时的 loader（如 `babel-loader`、`ts-loader`）放在子线程中并行执行

- **优点**：官方维护，兼容性好。可针对特定 loader 启用多进程

- **缺点：**进程启动有开销，小项目可能反而不快



安装

```shell
npm i thread-loader -D
```



使用：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "thread-loader",
            options: {
              workers: 2, // 子进程数量（建议根据 CPU 核心数设置）
            },
          },
          "babel-loader", // 耗时的 loader
        ],
      },
    ],
  },
};
```

> 使用 thread-loader 多进程编译，进程启动也要时间，大约要 600ms，进程通讯也要开销，所以一般给 babel 使用，或者打包时间短的不建议使用



HappyPack 在 Webpack 5 已不推荐使用（作者推荐改用 `thread-loader`）



##### 动态链接库 dll

主要就是对某一些第三方库进行单独打包, 后续打包不需要再打包第三方库，直接使用 dll

dll 的使用分为两步：

- 首先，打包一个 dll 库
- 然后，在项目中引入 dll 库



**打包一个 dll 库**

- **新建 `webpack.dll.config.js`**，里面内容：

  ```js
  const path = require('path')
  const webpack = require('webpack')
  const { CleanWebpackPlugin } = require('clean-webpack-plugin')
  
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
  ```

- package.json 配置 dll 启动命令

  ```js
  "scripts": {
      "dll": "webpack --config webpack.dll.config.js --mode production --progress",
  }
  ```



**在主配置中引用 DLL（`webpack.config.js`）**

```js
module.exports = {    
  plugins: [
    // 通过 DllReferencePlugin 插件告知要使用的 DLL 库
    new webpack.DllReferencePlugin({
        manifest: path.resolve(__dirname, 'dll', 'zepto.manifest.json'),
    }), 
  ]
}
```



**在 html 中引入 dll 库**

可以手动引入：

```html
<script src="./dll/dll_zepto.js"></script> <!-- 预编译的库 -->
<script src="./dist/main.js"></script> <!-- 主工程代码 -->
```



或者使用 `add-asset-html-webpack-plugin` 自动引入

- 安装 add-asset-html-webpack-plugin

  ```js
  npm i add-asset-html-webpack-plugin -D
  ```

  add-asset-html-webpack-plugin 主要做的是：

  - 将 dll/dll_zepto.js 复制到 dist 中
  - 在 index.html 中引用 dll_zepto.js

- 在 webpack.config.js 中：

  ```js
  plugins: [
      // 通过 AddAssetHtmlWebpackPlugin 将 dll 库引入到 html 模板中
      new AddAssetHtmlWebpackPlugin({
          filepath: path.resolve(__dirname, 'dll', 'dll_zepto.js'),
      })
  ]
  ```

> 对于 dll，在升级到 webpack4 之后，vue 和 react 的脚手架都不再使用 dll，vue 作者尤雨溪的的答复是：webpack4 已经提供了足够的性能，不需要再花费额外的心思去维护 dll



##### hard-source-webpack-plugin

`HardSourceWebpackPlugin` 是一个用于 **缓存 Webpack 中间构建结果** 的插件，通过将模块解析、loader 处理等中间步骤的结果保存到本地磁盘，**显著提升二次构建速度**（尤其在开发环境）



dll 构建速度已经不明显了，更好的替代方案是使用 HardSourceWebpackPlugin，并且在 webpack5 已经内置这个插件，通过 `cache: true` 即可开启。在 webpack4 中需要下载插件是使用



安装：

```js
npm i hard-source-webpack-plugin -D
```



使用：

```js
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

module.exprts = {
  // ...
  
  plugins: [
    new HardSourceWebpackPlugin()
  ]
}
```

相对于 dll 简单得多，而且性能的提升比 dll 更加明显。

> HardSourceWebpackPlugin 第一次打包没有变化，但是第二次之后打包变化特别大。



**对比 dll：**

|   hard-source-webpack-plugin   |                DLL                |
| :----------------------------: | :-------------------------------: |
| 把常用的文件存储到内存或硬盘中 | 把公共代码打包为dll文件放到硬盘中 |
|    再次打包时直接取读取缓存    |  再次打包时读取dll文件不重新打包  |
|          加载时间减少          |           打包时间减少            |



##### 配置文件别名

-   优点：减少打包时的搜索文件时间

```
resolve: {
  // 配置文件别名
  // 优点： 减少打包时查找文件的时间
  alias: {
    '@css': path.resolve(__dirname, 'src/css'),
  },
},
```



#### 优化代码运行性能



##### 文件资源缓存

主要就是借助浏览器缓存，服务端设置资源缓存，webpack 为 js 和 css 等文件添加文件 hash

webpack 的三种 hash（hash 本身是通过 MD4 的散列函数处理后，生成一个128位的hash值）：

- hash：hash 是对 webpack 整个一次构建而言，在 webpack 构建中，文件都会带上对应的MD5 值，构建生成的文件hash值都是一样的。如果出口是 hash，那么一旦针对项目中任何一个文件的修改，都会构建整个项目，重新获取hash值。如果有目的性的缓存就会失败
- chunkhash：会根据不同的入口（entry）进行借来解析来生成hash值
- contenthash：文件 hash，具体到某一个文件

```js
output: {
    filename: 'js/bundle.[contenthash:8].js', // contenthash: 文件 hash，根据文件来生成 hash
},

plugins: [
    new MiniCssExtractPlugin({
        filename: 'css/main.[contenthash:8].css', // 分离到到 main.css  使用 contenthash 值
    }),
]
```



##### tree shaking

tree shaking：用于**消除 JavaScript 上下文中未引用代码（Dead Code）**的优化技术，通过静态分析移除未被使用的模块导出（exports），从而减少最终打包文件的体积。主要是 ESModule 进行 tree shaking

在 webpack5 中，也提供了对部分 CommomJs 的 tree shaking 能力



> **Tree Shaking 为什么要依赖 ESM 规范？**
>
> 
>
> 事实上，Tree Shaking 是在编译时进行无用代码消除的，因此它需要在编译时确定依赖关系，进而确定哪些代码可以被“摇掉”，而 ESM 具备以下特点：
>
> - import 模块名只能是字符串常量
>
> - import 一般只能在模块的最顶层出现
>
> - import binding 是 immutable 的
>
> 这些特点使得 ESM 具有静态分析能力。而 CommonJS 定义的模块化规范，只有在执行代码后，才能动态确定依赖模块，因此不具备 Tree Shaking 的先天条件。
>
> 在传统编译型语言中，一般由编译器将无用代码在 AST（抽象语法树）中删除，而前端 JavaScript 并没有正统“编译器”这个概念，那么 Tree Shaking 就需要在工程链中由工程化工具完成。



在 webpack4 以上，**对 js 使用 tree shaking 有两种不同的方式**：

- usedExports

  - 在编译阶段分析模块间的依赖关系，标记未被引用的 `export`
  - 在代码压缩阶段（如 TerserPlugin）删除这些未被引用的代码

- sideEffects：查看某个文件是否有副作用，有副作用，就不进行 tree shaking

  - 副作用是指模块执行时除了导出值之外的行为（如修改全局变量、注册事件等）。Webpack 默认假设所有文件都有副作用，需明确告知哪些文件可以安全移除。

  - 配置副作用方式：

    - 在 `package.json` 中声明

      ```js
      {
        "sideEffects": false,  // 所有文件无副作用
      
        // 或指定有副作用的文件
        "sideEffects": ["*.css", "*.global.js"]
      }
      ```

    - 在 webpack 中覆盖

      ```js
      module.exports = {
        module: {
          rules: [
            {
              test: /\.js$/,
              sideEffects: false, // 对 JS 文件禁用副作用检查
            },
          ],
        },
      };
      ```



**useExports 方式：**

- 使用 es6 模块化 

- 开启 usedExports 和 treser

  ```js
  module.exports = {
      optimization: {
          usedExports: true,
          minimize: true
      }
  }
  ```



默认生产环境 production 下，usedExports 和 minimize 值都是 true，即生产环境不需要额外配置就支持 usedExports 方式的 tree shaking



举例：

```js
import { sum, mul } from "./math";

console.log(sum(20, 30));
```

引用了 mul， 但是没有使用

打包后的代码：

```js
/******/ 	var __webpack_modules__ = ({

"./src/math.js": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sum": function () { return /* binding */ sum; }
/* harmony export */
});

        /* unused harmony export mul */
        const sum = (num1, num2) => {
          return num1 + num2;
        }

        const mul = (num1, num2) => {
          return num1 * num2;
        }
})
})
```

webpack 对代码进行标记，主要是对 import & export 语句标记为 3 类：

- 所有 import 标记为 `/* harmony import */`

- 所有被使用过的 export 标记为`/* harmony export ([type]) */`，其中 `[type]` 和 webpack 内部有关，可能是 binding, immutable 等等

- 没被使用过的 export 标记为`/* unused harmony export [FuncName] */`，其中 `[FuncName]` 为 export 的方法名称（可以看到上面没使用到 mul，那么就标记了 /* unused harmony export mul */；注意后面是 mul）

这个主要是告诉 terser，可以删除这个没有被使用的函数；通过开启 treser，那么就可以在进行压缩的时候，将 mul 删除



**sideEffects 声明副作用：**

比如，在 index.js 中，直接：

```js
import '../css/index.css';

import './test';
```

这样，css 是希望可以这样引入，不要被 tree shaking 掉，而 js 不希望这样子引用而直接 tree shaking 掉，那么就可以配置 package.json 的 sideEffects，用来告诉哪些模块有副作用，不能被 tree shaking 掉

```js
{
    "sideEffects": [
        "*.css",
        "*.scss"
    ]
}
```

这样子代表 css、scss 文件不会被 tree shaking，而没有配置的 js 类型文件、例如 `import './test';` 将被 tree shaking 掉。*注意：是在生产环境，因为生产环境默认开启了 terser*



所以，总结在真实项目中，production 默认就开启了 useExports，再手动配置 package.json 的 sideEffects 即可



**esm 的动态导入 import**

虽然 ESM 支持动态 `import()`（异步代码拆分），但 **Tree Shaking 仍然有效**，因为 Webpack 会对动态导入的模块**单独分析其内部依赖关系**，移除未使用的导出



动态 `import()` 的路径必须是**静态字符串**（或可静态推断的表达式）[而 require 没有这个规定]，Webpack 在构建时能明确知道加载的是哪个模块，从而分析其导出是否被使用



总结：

1. **编译阶段**：
   - Webpack 解析所有 `import()` 的静态路径，生成独立的 chunk（代码块）。
   - 对每个 chunk 内部的模块**单独应用 Tree Shaking**（分析导出和引用关系）。
2. **运行时阶段**：
   - 浏览器按需加载 chunk，但 chunk 内部已经是优化后的代码（移除了未使用的导出）。



##### 代码分割

作用: 主要的目的是将代码分离到不同的 bundle 中，之后就可以按需加载，或者并行加载这些文件，提高代码加载性能

默认情况下，所有的 JavaScript 代码（业务代码、第三方依赖、暂时没有用到的模块）在首页全部都加载， 就会影响首页的加载速度

webpack 中代码分离的方式主要有三种：

- 通过多入口：entry 配置多入口
- 防止重复：使用 Entry Dependencies（不推荐） 或者SplitChunksPlugin（官方推荐） 去重和分离代码
- 动态导入：通过模块的内联函数调用来分离代码



**通过多入口：**

主要就是配置不同的入口，对 bundle 进行分割

```js
const { resolve } = require('path')

module.exports = {
    entry: {
        main: './src/main.js',
        index: './src/index.js'
    },
    output: {
        filename: "bundle.[name].js",
        path: resolve(__dirname, 'dist')
    }
}
```



**Entry Dependencies：**

上面多入口打包有一个问题，就是如果 main.js 和 index.js 都引用了 lodash，那么分别打包，会造成两个打包后的文件都引入 lodash，解决：通过 Entry Dependencies(入口依赖)共享 lodash

> 注意：开发中还是更建议直接使用 SplitChunks ,因为如果多个页面用到多个公共的第三方库，这种方式都要手动进行配置，非常不友好

```js
const { resolve } = require('path')

module.exports = {
    entry: {
        main: {
            import: './src/main.js',
            dependOn: 'shared'
        },
        index: {
            import: './src/index.js',
            dependOn: 'shared'
        },
        shared: ['lodash']
    },
    output: {
        filename: "bundle.[name].js",
        path: resolve(__dirname, 'dist')
    }
}
```

 ![](./imgs/img25.png)



**代码分割 SplitChunks **

splitChunks 的一些属性：

- chunks：

  - async：代表模块是异步进行加载的，才会进行分离（默认就是 async）,比如：

    ```js
    import('lodash').then(res => {})
    ```

  - inital：模块是同步加载的，进行分离

  - all：所有情况（一般设置为 all 即可）

- minSize：只有大于这个值的包才会被拆分

- minChunks：这个包至少被引用几次才会拆分

```
module.exports = {
    optimization: {
        // 代码分割
        splitChunks: {
            chunks: 'all',
            minSize: 30 * 1024, // 只有大于 30kb 的 chunks 才进行分割
            minChunks: 1, // 这个 chunks 至少被引用一次才分割
        }
    }
}
```

- cacheGroups：用于对拆分的包就行分组，比如一个 lodash 在拆分之后，并不会立即打包，而是会等到有没有其他符合规则的包一起再打包

```js
module.exports = {
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    // 匹配规则：如果是从 node_modules 中引入的
                    test: /[\\/]node_modules[\\/]/,
                    filename: 'js/[name]_[hash:4].js'
                },
                // 如果想要将我们自己写的文件单独打包，那么可以再配置(要注意于前面设置的包大小限制 minSize 配合)
                xxx: {
                    test: /xxx/,
                    filename: 'js/[name]_[hash:4].js'
                }
            }
        }
    }
}
```

 ![](./imgs/img26.png)

在使用 SplitChunks  的时候，一般很少去手动设置这些属性，只需要设置 chunks： ‘all’ 基本可以，其他的使用默认设置即可。还有当需要单独对自己写的模块进行打包，设置一下 cacheGroups 即可。react 跟 vue 的脚手架对 SplitChunks  的设置都比较简单



拓展：

一般像 vue 脚手架，**同步的代码**，通过 SplitChunks 最多就分离出来 4 个文件，分别是：

- main.bundle.js
- vendor_chunks.js：第三方包
- common_chunks.js：自己的模块被**多个入口多次引用**（一般 spa 单页面也不会有这个文件）
- runtime.js：如 `import('abc').then(res=>{})`这种异步加载的代码，在 webpack 中即为运行时代码



更详细的 splitChunks 学习，查看：[SplitChunks学习](./SplitChunks学习.md)



**动态导入(dynamic import)：**

通过动态导入的方式也可以进行代码分离，webpack 对于异步导入的代码都会进行单独的打包

- 使用 ECMAScript 中的 import() 语法来完成，也是目前推荐的方式

  ```js
  import('./sub.js').then(res => {
      
  })
  ```

- 使用 webpack 遗留的 require.ensure，目前已经不推荐使用



动态导入的打包文件命名需要使用到下面两者配合：

- opuput.chunkFilename

- 魔法注释 /* webpackChunkName:  '名字' */

在 webpack.config.js 中：

```js
module.exports = {
    chunkFilename: 'js/[name]_chunk.js'
}
```

在 index.js 中

```js
import(/* webpackChunkName: 'sub' */ './sub').then(({ addSub }) => {
    console.log(addSub(1, 7))
  })
```

  ![](./imgs/img27.png)



##### 懒加载和预加载

**懒加载：**体验稍微差，兼容性好一点

在  index.js 中：

```
const btn = document.querySelector('#btn')

btn.addEventListener('click', (e) => {
  import(/* webpackChunkName: 'sub' */'./sub').then(({ addSub }) => {
    console.log('懒加载', addSub(1, 7))
  })
})
```

懒加载在初次请求的时候并没有去请求 sub 模块，而是在点击按钮的时候才去加载模块

 ![](./imgs/img28.png)



**预加载：**体验好，兼容性差

```js
const btn = document.querySelector('#btn')

btn.addEventListener('click', (e) => {
  // 预加载：体验好，兼容性差
  import(/* webpackChunkName: 'sub', webpackPrefetch: true */ './sub').then(
    ({ addSub }) => {
      console.log('预加载', addSub(1, 9))
    }
  )
})
```

预加载会在**浏览器空闲**的时候，去把 sub 模块加载出来

 ![](./imgs/img29.png)



##### optimization. runtimeChunk

optimization. runtimeChunk 主要是将运行时的代码进行抽离（也就是将运行时的代码从主包 bundle 中抽离出来）

- 运行时代码：如 `import('abc').then(res=>{})`这种异步加载的代码，在 webpack 中即为运行时代码

这样做的好处是：抽离出来后，有利于浏览器的缓存策略（线上更新版本时，充分利用浏览器缓存，使用户感知的影响到最低）；即修改了业务代码 main，那么 runtime 中代码不需要重新加载，反之也是

```js
runtimeChunk: {
  name: entrypoint => `runtime_${entrypoint.name}`
},
```



##### pwa

pwa：渐进式网络开发应用程序 离线可访问

-   可靠 - 即使在网络不稳定甚至断网的环境下，也能瞬间加载并展现
-   用户体验 - 快速响应，具有平滑的过渡动画及用户操作的反馈
-   用户黏性 - 和 Native App 一样，可以被添加到桌面，能接受离线通知，具有沉浸式的用户体验

```
npm i workbox-webpack-plugin -D

plugins: [
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
]

// 并且在入口文件注册 serviceWorker，还有处理兼容性
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => {
        console.log('serviceWorker 注册成功')
      })
      .catch(() => {
        console.log('serviceWorker 注册失败')
      })
  })
}
```



##### 使用 cdn

CDN：内容分发网络，指通过相互连接的网络系统，利用最靠近每个用户的服务器，更快、更可靠地将音乐、图片、视频、应用程序及其他文件发送给用户，来提供高性能、可扩展性及低成本的网络内容传递给用户



**CDN 基本原理：**

首先，把静态资源放到源节点里面。

当用户张三需要使用到某一个图片，那么就会先到最近的边缘节点查找，如果附近地区之前有叫李四的用户访问过这张图片，那么这张图片就会缓存在这两者最近的边缘节点，那么就可以直接在边缘节点把这张图片返回给李四；如果在边缘节点没找到，那么就回去父节点，父节点没有，就会去源节点查找。在源节点找到，就会传给父节点，父节点会备份一份，然后传给边缘节点，边缘节点再备份，最后返回给用户

 ![](./imgs/img30.png)



一般在开发中，使用 CDN 主要是两种方式

- 打包的所有静态资源，放到 CDN 服务器，用户所有资源都是通过 CDN 服务器加载的

- 一些第三方资源放到 CDN 服务器上



**静态资源放到 CDN 服务器：**

- 首先需要购买 CDN 服务器，国内一般阿里、腾讯的 CDN 服务器

- 然后将资源放到 CDN 服务器

- webpack 通过修改 publicPath，在打包时添加上自己的CDN地址

  ```js
  module.exports = {
      output: {
          publicPath: 'https://www.xxx.com/cdn/'
      }
  }
  ```



**webpack 中第三方资源使用 CDN 的方法：**



**方法1：使用html-webpack-externals-plugin**

安装：

```js
npm i html-webpack-externals-plugin -D

```

使用：

```
plugins: [
    new HtmlWebpackExternalsPlugin({
        externals: [{
            module: "jquery",
            entry: "https://cdn.bootcdn.net/ajax/libs/jquery/1.12.4/jquery.min.js",
            global: "jQuery"
        }]
    })
]
```



**方法2：直接使用外部扩展 externals**

外部扩展 externals 的作用：**防止**将某些 `import` 的包(package) **打包**到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖(external dependencies)

首先在 index.html 中引入：

```js
<script type="text/javascript" src="https://cdn.bootcdn.net/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
```

然后在 webpack.config.js 中配置：

```js
module.exports = {
    externals: {
        // 要忽略的库名---npm 包名
        // 右边是填这个库暴露出来的一个全局对象
        jquery: "jQuery"
    }
}
```

当在开发环境不需要使用 CDN 时，可以利用 ejs 模板的条件判断：

```js
<% if (process.env.NODE_ENV !== 'production') { %>
    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/1.12.4/jquery.min.js"</script>
<% } %>
```



**CDN 降级方案**

以 react 包为例：

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // 降级逻辑
    function loadFallback() {
      // 如果 CDN 未加载成功，动态插入本地资源
      if (!window.React) {
        document.write('<script src="/static/react.production.min.js"><\/script>');
        document.write('<script src="/static/react-dom.production.min.js"><\/script>');
      }
    }

    // 异步加载 CDN，失败时触发降级
    const cdnReact = 'https://cdn.example.com/react/17.0.2/react.production.min.js';
    const script = document.createElement('script');
    script.src = cdnReact;
    script.onerror = loadFallback; // CDN 加载失败时降级
    document.head.appendChild(script);
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```



##### gzip 压缩

http 压缩是指在服务器和浏览器间传输压缩文本内容的方法。http 压缩通常采用 gzip 压缩算法压缩html、js、css 等文件。压缩的最大好处就是降低了网络传输的数据量，从而提高客户端浏览器的访问速度。当然，同时也会增加一点服务器的负担



**http 压缩的流程：**

- 可以在服务端进行压缩 gzip，可以了在前端通过 webpack 压缩成 gzip

- 兼容的浏览器在向服务器发送请求时，会告知服务器自己支持哪些压缩格式

    ![](./imgs/img32.png)

- 服务器在浏览器支持的压缩格式下，直接返回对应的压缩后的文件(index.js.gz)，然后浏览器会自动对 gz 文件进行解压，生成 js 文件

**目前常用的 http 压缩格式：**

- gzip – GNU zip格式（定义于RFC 1952），是目前使用比较广泛的压缩算法
- deflate – 基于deflate算法（定义于RFC 1951）的压缩，使用zlib数据格式封装
- br – 一种新的开源压缩算法，专为HTTP内容的编码而设计（目前兼容性没有上面两个好）



**在 webpack 中实现 http 压缩：**

使用 compression-webpack-plugin 进行 http 压缩

安装：

```js
npm install compression-webpack-plugin -D
```

使用：

> webpack 4 版本只能使用 compression-webpack-plugin 5.0.1 版本以下的，compression-webpack-plugin 5.0.1一下的会跟 CleanWebpackPlugin 冲突

```js
plugins: [
    new CompressionWebpackPlugin({
        test: /\.js$/, // 匹配哪些文件需要压缩
        minRatio: 0.7, // 压缩比例
        algorithm: 'gzip', // 压缩格式
    }),
]
```

一般情况下， html、图片不需要压缩，而 css 中可能有使用背景图，也不压缩



## 优化体验和打包分析



### 打包构建显示进度条

```
package.json 启动命令行加 --progress

"build": "webpack --mode production --progress",
```



### 分析打包各个模块所需时间

如果希望看到每一个 loader、plugins 消耗的打包时间，可以利用插件：speed-measure-webpack-plugin

安装：

```js
npm install speed-measure-webpack-plugin -D
```

使用：

```js
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin")
const smp = new SpeedMeasurePlugin()

const webpackConfig = (env, options) => {
    return {
        plugins: []
    }
}

module.exports = smp.wrap(webpackConfig)
```

 ![](./imgs/img34.png)



### 配置不同环境

在 webpack 中，可以使用 NODE_ENV=development 配置不同环境，但是直接使用 NODE_ENV 在不同平台（window、mac）有不同的使用方式，所以需要借助 cross-env 来抹平平台差异

安装：

```js
npm install cross-env -D
```

使用：

```js
"scripts": {
    "build": "cross-env NODE_ENV=production webpack"
}
```

取值：

```js
process.env.NODE_ENV
```



### 分析打包大小

**使用官方提供的：**

在 package.json 中

```js
"scripts": {
    "stats": "webpack --mode production --profile --json > stats.json"
},
```

执行会生成一个 stats.json 文件

然后打开 http://webpack.github.com/analyse，将 stats.json 文件上传，就能看到

![](./imgs/img36.png)



**使用 webpack-bundle-analyzer**

安装：

```js
npm install webpack-bundle-analyzer -D
```

使用：

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

plugins: [
    new BundleAnalyzerPlugin()
]
```

会自动在浏览器127.0.0.1:8888 上打开这个页面

![](./imgs/img35.png)



## webpack 拓展



### 封装 Library

利用 webpack 打包一个我们自己的库文件

在 index.js 中

```js
import * as math from "./lib/math";
import * as format from './lib/format'

export {
  math,
  format
}
```

在 webpack.config.js 中：

```js
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  devtool: false,
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'gweid-utils.js',
    libraryTarget: 'umd', // 使用 umd
    library: 'gweidUtils', // 包名
    globalObject: 'this' // 兼容 Node 和浏览器
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
}
```

umd：指打包出来的东西既支持 amd，又支持 CommonJs，也支持浏览器直接使用

- CommonJs 又分为社区 CommomJs 和 node 的 CommonJs；node 的 CommonJs：有 module 对象 和 module.exports

分析打包后的代码，通过 umd 支持不同模块化：

 ![](./imgs/img33.png)

globalObject: 'this' 这里的 this 设置的就是上面图片中自执行函数的 this



### 自定义 loader 和 plugins



#### 写一个 loader

**loader 的基本认知**

Loader是一个具有单一职责的转换器

- 转换器：在 webpack 中一切皆 js 模块，而 loader 的作用就是把非 js 模块转化为 js 模块，供 webpack 进行打包处理
  - 非js模块即样式文件（.css、.less、.scss等），非标准JS文件（.ts、.jsx、.vue），以及其他类型的文件（svg、png | jpg | jpeg等）
- 单一职责：一个 loader 只负责一种转换。单一职责是 webpack 社区对 loader 定义的约束。如果一个源文件需要经历多步转换才能被使用，就应该通过多个 loader 去转换



loader 本质上是一个导出为函数的 javascript  模块，在编译过程中，loader-runner 这个库会调用这个 loader 函数，然后将上一个 loader 产生的结果或者资源文件传进去

```js
module.exports = function(content, sourcemap, meta) {
  return content
}
```

导出的函数接收三个参数：

- content：资源文件的内容（webpack通过 fs.readFile 读到的文件内容）
- sourcemap：前面 loader 生成的 source map，可以传递给后方 loader 共享
- meta：其他需要传给后方 loader 共享的信息，可自定义

一般来讲，**很少用到 sourcemap 以及 meta 这两个参数**

最后，必须把 content 或者处理过的文件内容返回去，类型为 string 或者 buffer



**引用 loader 的几种方式：**

自定义在 myLoader/myLoader.js 的 loader 怎么去引用

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'myLoader'
      }
    ]
  }
}
```

像正常那样，直接写 loader 名字是不行的，因为 webapck 中直接写 loader 名字默认会去 node_modules 中查找

- 第一种，直接自定义 loader 的路径，这种方法依赖于 context（这种写起来过于繁琐）

  ```js
  const path = require
  
  module.exports = {
    context: 
    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'myLoader'
        }
      ]
    }
  }
  ```

- 使用 resolveLoader 配置读取 loader 的默认路径

  ```js
  module.exports = {
    resolveLoader: {
      modules: ['node_modules', './myLoader']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'myLoader'
        }
      ]
    }
  }
  ```



**loader 的执行顺序：**

一般情况下，loader 的执行顺序是自下向上，从右往左。为什么呢？

loader 执行包括两个阶段，pitch 阶段和 normal 阶段。

Webpack 在处理一个模块时，Loader 的执行顺序如下：

```text
Loader1.pitch -> Loader2.pitch -> ... -> LoaderN.pitch -> 读取资源 -> LoaderN.normal -> ... -> Loader2.normal -> Loader1.normal
```

- pitch 阶段

  - **提前拦截：**如果某个 Loader 的 `pitch` 方法返回非 `undefined` 值，会**跳过后续 Loader 的 `pitch` 和文件读取**，直接进入 `normal` 阶段。某些场景下可以**通过 `pitch` 提前终止不必要的处理（如缓存命中时）**

  - **共享数据 (`data`)：`pitch` 方法的 `data` 参数可以在 Loader 链中传递数据**

    ```js
    module.exports.pitch = function(remainingRequest, previousRequest, data) {
      data.value = '共享数据'; // 后续 Loader 可通过 data 访问
    };
    ```

- Normal 阶段：常规 loader 处理，就是一般认为的 loader 对源文件进行转译的阶段。



例如：有 loader1.js

```js
// Normal 阶段
module.exports = function(content, sourcemap, meta) {
  console.log('Normal 1')
  return content
}

// Pitch 阶段
module.exports.pitch = function() {
  console.log("Pitch 1");
}
```

有 loader2.js

```js
// Normal 阶段
module.exports = function(content, sourcemap, meta) {
  console.log('Normal 2')
  return content
}

// Pitch 阶段
module.exports.pitch = function() {
  console.log("Pitch 2");
}
```

使用：

```js
module.exports = {
  resolveLoader: {
    modules: ['node_modules', './myLoader']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['loader1', 'loader2']
      }
    ]
  }
}
```

那么控制台会输出：

 ![](./imgs/img38.png)

为什么会这样呢？首先，在 webpack 中，loader 会交给 runLoaders 这个函数处理，而这个函数来自于 loader-runner 这个第三方包，来看看 runLoaders 的处理逻辑：

```js
exports.runLoaders = function runLoaders(options, callback) {
    // ...
    
    // 执行 iteratePitchingLoaders 方法迭代 PitchingLoaders
    iteratePitchingLoaders(processOptions, loaderContext, function(err, result) {
		if(err) {
			return callback(err, {...});
		}
		callback(null, {...});
	});
}

function iteratePitchingLoaders(options, loaderContext, callback) {
	// iterate
	if(currentLoaderObject.pitchExecuted) {
		loaderContext.loaderIndex++;
		return iteratePitchingLoaders(options, loaderContext, callback);
	}

	// load loader module
	loadLoader(currentLoaderObject, function(err) {
		// ...
        
        currentLoaderObject.pitchExecuted = true;

		runSyncOrAsync(
			fn,
			loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, currentLoaderObject.data = {}],
			function(err) {
                // ...
                loaderContext.loaderIndex--;
                iterateNormalLoaders(options, loaderContext, args, callback);
			}
		);
	});
}
```

可以看到，runLoaders 最后实际上就是调用 iteratePitchingLoaders 这个函数，这个函数主要就是迭代 loader，找到 pitch 阶段执行，但是还做了一件事，就是通过 loaderContext.loaderIndex++。最后，再迭代 loader 执行 normal 阶段是利用 loaderContext.loaderIndex--。所以这就是 pitch 是顺序执行，normal 是逆序执行，而 loader 对源文件进行转译的阶段是 normal 阶段，所以才有自右向左，从下往上的执行顺序。

 ![](./imgs/img39.png)



**修改 loader 执行顺序：**

首先，目前 loader 有四类：

- 前置（Pre）
- 普通（Normal）
- 后置（Post）
- 行内（Inline）

首先是 Normal loader，这个就是平时常见的 loader



然后是前置跟后置 loader，这个可以通过 enforce 设置：

```js
module.exports = {
  resolveLoader: {
    modules: ['node_modules', './myLoader']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'myLoader',
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        use: 'normalLoader'
      },
      {
        test: /\.js$/,
        use: 'testLoader',
        enforce: 'post'
      }
    ]
  }
}
```

那么执行顺序是就不会从下往上，而是 myLoader --> normalLoader --> testLoader



接着是行内 loader，在 webpack 中，还可以这样子写 loader

```js
import 'loader1!loader2!./test.js'
```

> 官方一般是不推荐使用行内 loader 的

所以，基于以上，loader 的实行顺序：pre loader > normal loader > inline loader >  post loader



**同步与异步 loader**

首先，必须要明确的是，loader 函数必须要有返回值，不然会报错。而且是在 loader 函数执行完之后就要返回值，那么就会存在问题，比如 loader 里面有异步的操作，那么异步操作会进入到异步队列，把返回放在异步操作里面，就不符合 loader 函数执行完之后就要返回值的设定，一样会报错。所以就有了异步 loader 的概念。

先看同步 loader，同步 loader 返回有两种方式：

- 直接 return content
- 使用 this.callback，这个一般是需要返回错误的时候
  - 参数1：错误信息，没有就 null
  - 参数2：content
  - 参数3：sourcemap
  - 参数4：meta

```js
module.exports = function(content, sourcemap, meta) {
  // return content

  console.log('syncOrAsyncLoader')
  this.callback(null, content, sourcemap, meta)
}
```

> 这里的 this 就是 loader 实例

接着是异步 loader，很简单，只要调用 this.async() 返回 callback 即可

```js
module.exports = function(content, sourcemap, meta) {
  //------------------------ 异步 loader
  console.log('开始了')

  const callback = this.async()

  setTimeout(() =>{
    console.log('异步 loader')
    callback(null, content)
  }, 2000)
}
```



**获取 loader 参数以及参数校验**

1. 获取参数：webpack 提供了 loader-utils 解析库来获取 loader 传进来的参数

   安装：

   ```js
   npm i loader-utils -D
   ```

   使用：首先在使用 loader 的时候传入参数：

   ```js
   module.exports = {
     resolveLoader: {
       modules: ['node_modules', './myLoader']
     },
     module: {
       rules: [
         {
           test: /\.js$/,
           use: [
             {
               loader: 'optionLoader',
               options: {
                 name: 'optionLoader',
                 needLog: true
               }
             }
           ]
         }
       ]
     }
   }
   ```

   获取参数：

   ```js
   const { getOptions } = require('loader-utils') 
   
   module.exports = function (content) {
     const options = getOptions(this)
     console.log(options) // { name: 'optionLoader', needLog: true }
   
     return content
   }
   ```

2. 可以通过 webpack 提供的 schema-utils 进行参数校验

   安装：

   ```js
   npm i schema-utils -D
   ```

   使用：

   ```js
   const { getOptions } = require('loader-utils')
   const { validate } = require('schema-utils');
   
   const schema = {
     "type": "object",
     "properties": {
       "name": {
         "type": "string",
         "description": "请输入name"
       },
       "needLog": {
         "type": "boolean",
         "description": "请输入needLog"
       }
     }
   }
   
   module.exports = function (content) {
     // 获取参数
     const options = getOptions(this)
   
     // 参数检验
     validate(schema, options, 'optionLoader')
   
     return content
   }
   ```



**手动实现 loader：**

实例1：不使用 babel-loader，实现自己的 babel-loader

myBabelLoader.js

```js
const { transform } = require('@babel/core')
const { getOptions } = require('loader-utils')

module.exports = function(content) {
  const callback = this.async()

  const options = getOptions(this)

  transform(content, options, (err, res) => {
    // 在回调里面返回，必须使用异步 loader
    if(err) {
      callback(err)
    } else {
      callback(null, res.code)
    }
  })
}
```

使用：

```js
module.exports = {
  resolveLoader: {
    modules: ['node_modules', './myLoader']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'optionLoader',
            options: {
              presets: [
                '@babel/preset-env'
              ]
            }
          }
        ]
      }
    ]
  }
}
```



实例2：写一个 md 文件转 html 的 loader

首先需要用到 html-webpack-plugin 去展示页面，然后是 marked 去转换 md 为 html，还有就是 highlight.js 代码高亮，这三个包要安装一下。

然后是后面会使用 highlight.js 默认的样式文件，所以需要安装一下 style-loader、css-loader

一份需要转换的 md 文件，webpack.md

index.js

```js
import "highlight.js/styles/default.css"
import './css/codeHighlight.css'

import code from './doc/webpack.md'

document.body.innerHTML = code
```

webpack.confg.js

```js
const path = require('path')
const HtmlWebpackPlugun = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: false,
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  resolveLoader: {
    modules: ['node_modules', './myLoader']
  },
  module: {
    rules: [
      // 实现一个 md 文件转译 loader
      {
        test: /\.md$/,
        use: [
          {
            loader: 'mdCompileLoader',
          }
        ]
      },
      // 需要用到 highlight.js 的默认 css 样式使代码高亮
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugun()
  ]
}
```

mdCompileLoader.js

```js
const marked = require('marked')
const hljs = require('highlight.js')

module.exports = function(content) {

  // 这样主要是利用 highlight 给标签设置上 class 类，后面就可以通过 class 类写 css
  marked.setOptions({
    highlight: (code, lang) => {
      return hljs.highlight(lang, code).value;
    }
  })

  // 使用 marked 将 md 代码转换为 html
  const htmlContent = marked(content)

  // 将 html 转换为 模板字符串，因为 loader 必须返回 string 或者 buffer
  const strContent = "`" + htmlContent + "`"

  // 为了在 index.js 中可以通过 import code from './doc/webpack.md' 的形式引入
  const resContent = `var code = ${strContent}; export default code;`

  return resContent
}
```



实例3：[自定义 loader 读取 *.vue 文件源码](https://juejin.cn/post/6904686261080948750)



#### 编写一个 plugin

了解什么是 tapable

https://juejin.cn/post/6937829048332746788

所有的 webpack 插件都是基于 tapable 事件流， tapable 的 hook 的 使用流程就分为三步：

1. 创建一个 hook

   ```js
   const testHook = new AsyncSeriesHook(['arg1'])
   ```

   数组里面有几个就代表后面会传几个参数

2. 注册回调事件

   ```js
   testHook.tapAsync('xxx', (arg) => {})
   ```

   接收参数 arg

3. 触发注册过的回调事件

   ```js
   testHook.callAsync('hello', () => {})
   ```

   传入参数的值为 hello



实例1：开发一个上传静态资源到服务器的插件。在打包好后，自动把 dist 目录上传到服务器

要上传文件到服务器，使用 node-ssh 这个包

安装：

```shell
npm i node-ssh -D
```

webpack.config.js

```js
const { resolve } = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const UploadAssetPlugin = require('./plugins/uploadAssetPlugin')

module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin(),

    // 自定义的上传静态资源到服务器插件
    new UploadAssetPlugin({
      host: '',
      username: '',
      password: '',
      remotePath: '/root/asset-test'
    })
  ]
}
```

uploadAssetPlugin.js：

```js
const { NodeSSH } = require('node-ssh')

class UploadAssetPlugin {
  constructor(options) {
    this.options = options

    this.ssh = new NodeSSH()
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('upload-asset-plugin', async (compilation, callback) => {
      console.log('准备上传资源到服务器...')

      // 获取到打包后的资源输出目录
      const outputPath = compilation.outputOptions.path

      // 创建 ssh 连接
      await this.connectSSH()

      // 删除服务器中原来的资源
      const serverDir = this.options.remotePath
      await this.ssh.execCommand(`rm -rf ${serverDir}/*`)

      // 通过 ssh 将打包后的资源上传到服务器
      await this.uploadAsset(outputPath, this.options.remotePath)

      // 关闭 ssh 连接
      this.ssh.dispose()
      
      // 异步一般需要 callback 返回
      callback()
    })
  }

  async connectSSH() {
    try {
      await this.ssh.connect({
        host: this.options.host, // 主机 host 地址
        username: this.options.username, // 用户名
        password: this.options.password // 密码
      })

      console.log('ssh 链接成功...')
    } catch (error) {
      console.log('ssh 连接失败！！！')
    }
  }

  async uploadAsset(outputPath, remotePath) {
    const status = await this.ssh.putDirectory(outputPath, remotePath, {
      recursive: true,
      concurrency: 10
    })

    console.log(`资源上传${status ? '成功' : '失败'}`)
  }
}

module.exports = UploadAssetPlugin
```



更多自定义 webpack plugin 可以参考：

https://juejin.cn/post/6844904162405138445



## webpack 的启动流程（webpack-cli）

基于 webpack5.24.4 和 webpack-cli4.5.0 分析启动流程

![](./imgs/img37.png)



### 从 npm run build 开始

首先，npm run build 是执行的 `"build": "webpack --mode production --progress" 这一行代码，相当于执行 npx webpack

npx webpack 主要就是去到 node_modules 下面的 .bin 目录找到 webpack 文件，然后执行



### node_modules/.bin/webpack

```js
#!/bin/sh
# ...

if [ -x "$basedir/node" ]; then
  "$basedir/node"  "$basedir/../webpack/bin/webpack.js" "$@"
  ret=$?
else 
  node  "$basedir/../webpack/bin/webpack.js" "$@"
  ret=$?
fi
exit $ret
```

可以看出，就是通过 shell 命令去执行 node_modules/webpack/bin/webpack.js 文件



### node_modules/webpack/bin/webpack.js 文件

```js
// 对包进行安装的函数
const runCommand = (command, args) => {
	const cp = require("child_process");
	return new Promise((resolve, reject) => {
		const executedCommand = cp.spawn(command, args, {
			stdio: "inherit",
			shell: true
		});
	});
};

// 用于检测 webpack-cli 有没有安装
const isInstalled = packageName => {
	try {
		require.resolve(packageName);
		return true;
	} catch (err) {
		return false;
	}
};

/**
 * 主要做的：
 *   1、拼接到路径：pkgPath = webpack-cli/package.json
 *   2、引入 webpack-cli/package.json
 *   3、拼接路径 path.resolve(path.dirname(pkgPath), pkg.bin[cli.binName]) = webpack-cli/bin/cli.js
 *   4、执行 webpack-cli/bin/cli.js
 */
const runCli = cli => {
	const path = require("path");
	const pkgPath = require.resolve(`${cli.package}/package.json`);
	// eslint-disable-next-line node/no-missing-require
	const pkg = require(pkgPath);
	// eslint-disable-next-line node/no-missing-require
	require(path.resolve(path.dirname(pkgPath), pkg.bin[cli.binName]));
};

const cli = {
	name: "webpack-cli",
	package: "webpack-cli",
	binName: "webpack-cli",
	installed: isInstalled("webpack-cli"), // 检测有没有安装 webpack-cli
	url: "https://github.com/webpack/webpack-cli"
};

/**
 * 主要的逻辑：
 * 如果安装了 webpack-cli，那么直接执行 runCli
 * 如果没有安装 webpack-cli
 *     1、报警告，没有安装 webpack-cli
 *     2、检测使用的是 npm 还是 pnpm 还是 yarn
 *     3、提问题：是否需要安装 webpack-cli
 *     4、安装成功后执行 runCli
 */
if (!cli.installed) {
    // ...
	const notify =
		"CLI for webpack must be installed.\n" + `  ${cli.name} (${cli.url})\n`;

	console.error(notify);

	let packageManager;

	if (fs.existsSync(path.resolve(process.cwd(), "yarn.lock"))) {
		packageManager = "yarn";
	} else if (fs.existsSync(path.resolve(process.cwd(), "pnpm-lock.yaml"))) {
		packageManager = "pnpm";
	} else {
		packageManager = "npm";
	}

	const installOptions = [packageManager === "yarn" ? "add" : "install", "-D"];

	const question = `Do you want to install 'webpack-cli' (yes/no): `;

	const questionInterface = readLine.createInterface({
		input: process.stdin,
		output: process.stderr
	});

	process.exitCode = 1;
	questionInterface.question(question, answer => {
		// ...
		// 调用 runCommand 安装 webpack-cli, 安装完 webpack-cli 后执行 runCli
		runCommand(packageManager, installOptions.concat(cli.package))
			.then(() => {
				runCli(cli);
			})
			.catch(error => {
				console.error(error);
				process.exitCode = 1;
			});
	});
} else {
	runCli(cli);
}
```

这个一步最终就是**通过 runCli 函数去加载 node_modules/webpack-cli/bin/cli.js，然后执行 cli.js 文件**

> 我们在使用 webpack 通过 npm 下载包的时候，一般是会 webpack 跟 webpack-cli 一起下载的，所以基本就是直接走到了 runCli(cli) 这一步



### node_modules/webpack-cli/bin/cli.js

这个的逻辑其实也很简单，就是如果没有下载 webpack，就发出警告，并且通过提问的方式询问是否需要下载 webpack。

如果安装了 webpack，那么执行 runCLI

```js
const runCLI = require('../lib/bootstrap');
const utils = require('../lib/utils');

// 判断有没有下载 webpack 这个包（我们在 npm 下载的时候，一般都是会将 webpack 和 webpack-cli 一同下载的）
if (utils.packageExists('webpack')) {
    runCLI(process.argv, originalModuleCompile);
} else {
    const { promptInstallation, logger, colors } = utils;

    promptInstallation('webpack', () => {
        utils.logger.error(`It looks like ${colors.bold('webpack')} is not installed.`);
    })
        .then(() => {
            logger.success(`${colors.bold('webpack')} was installed successfully.`);

            runCLI(process.argv, originalModuleCompile);
        })
        .catch(() => {
            logger.error(`Action Interrupted, Please try once again or install ${colors.bold('webpack')} manually.`);

            process.exit(2);
        });
}
```

- promptInstallation 里面会通过提问引导用户下载 webpack

这一步的最终结果就是执行 runCLI，这个函数由 webpack-cli/lib/bootstrap.js 得到



### runCLI 函数

runCLI 函数由 webpack-cli/lib/bootstrap.js 得到，主要作用：就是创建一个 WebpackCLI 类实例，然后执行这个实例里面的 run 方法

```js
const WebpackCLI = require('./webpack-cli');

const runCLI = async (args, originalModuleCompile) => {
    try {
        const cli = new WebpackCLI();

        cli._originalModuleCompile = originalModuleCompile;

        await cli.run(args);
    } catch (error) {
        //...
    }
};
```



### new WebpackCLI()

```js
class WebpackCLI {
    constructor() {
        this.webpack = require('webpack');
        //...
    }
    
    async createCompiler(options, callback) {
        //...
        try {
            compiler = this.webpack(
                config.options,
                callback
                    ? (error, stats) => {
                          if (error && this.isValidationError(error)) {
                              this.logger.error(error.message);
                              process.exit(2);
                          }

                          callback(error, stats);
                      }
                    : callback,
            );
        } catch (error) {

        }

        return compiler;
    }
}
```

new WebpackCLI() 最主要的作用就是引入了 webpack。webpack 本质上就是一个函数，它接受两个参数，一个是 config 配置，一个是回掉函数。config 配置就是我们常常配置的 webpack.config.js 还有 package.json 里面的比如 --watch 这些



### webpack cli 的 run

执行 run 方法：

```js
class WebpackCLI {
    constructor() {
        this.webpack = require('webpack');
        //...
    }
    
    async run(args, parseOptions) {
        const loadCommandByName = async (commandName, allowToInstall = false) => {
            // ...
            if (isBuildCommandUsed || isWatchCommandUsed) {
                const options = this.getBuiltInOptions();
				// 执行 makeCommand
                await this.makeCommand(
                    isBuildCommandUsed ? buildCommandOptions : watchCommandOptions,
                    isWatchCommandUsed ? options.filter((option) => option.name !== 'watch') : options,
                    async (entries, options) => {
                        if (entries.length > 0) {
                            options.entry = [...entries, ...(options.entry || [])];
                        }
						// 执行 buildCommand
                        await this.buildCommand(options, isWatchCommandUsed);
                    },
                );
            }
        }
    }
}
```

1. 通过 makeCommand 函数检测一些包有没有安装

2. 在 makeCommand 函数里面通过执行 makeOption 对配置参数进一步处理

   ```js
   class WebpackCLI {
       async makeCommand(commandOptions, options, action) {
           //...
           if (options) {
               // ....
               options.forEach((optionForCommand) => {
                   // 执行 makeOption 对配置参数进行处理
                   this.makeOption(command, optionForCommand);
               });
           }
       }
   
       makeOption(command, option) {
           //....
       }
   }
   ```

3. 执行 buildCommand，这个函数主要就是执行 createCompiler 拿到 webpack 的 compiler

   ```js
   class WebpackCLI {
       constructor() {
           this.webpack = require('webpack');
           //...
       }
       
       async run(args, parseOptions) {
           const loadCommandByName = async (commandName, allowToInstall = false) => {
               // 执行 makeCommand
               await this.makeCommand(
                       // 执行 buildCommand
                       await this.buildCommand(options, isWatchCommandUsed);
                   },
               );
       }
       
       async buildCommand(options, isWatchCommand) {
           // ...
           compiler = await this.createCompiler(options, callback);
       }
   }
   ```

4. createCompiler 这个函数主要就是调用了 this.webpack 拿到 webpack 函数执行，返回 webpack 的 compiler

   ```js
   async createCompiler(options, callback) {
       // ...
       compiler = this.webpack(
           config.options,
           callback
           ? (error, stats) => {
               if (error && this.isValidationError(error)) {
                   this.logger.error(error.message);
                   process.exit(2);
               }
   
               callback(error, stats);
           }
           : callback,
       );
       
       return compiler
   }
   ```



### 结论

在 webpack 中，启动 webpack 借助于 webpack-cli，webpack-cli 主要做的事就是：对 webpack.config.js 以及 package.json 中与 webpack 相关的配置参数做处理、合并等等一些前置操作，其实最核心的就是下面这一段，执行 wbepack 函数

```js
compiler = this.webpack(
    config.options,
    callback
    ? (error, stats) => {
        if (error && this.isValidationError(error)) {
            this.logger.error(error.message);
            process.exit(2);
        }

        callback(error, stats);
    }
    : callback,
);
```

其实在 vue-cli 或者 create-react-app 里面就根本没有使用到 webpack-cli，就是因为 webpack-cli 那边主要就是做的一些配置前置处理，而这些脚手架工具不需要。

验证：在 webpack 中不使用 webpack-cli 也能进行打包

新建一个 build.js 文件：

```js
const webpack = require('webpack')

const configFun = require('./webpack.config')

const webpackConfig = configFun(null, { mode: 'production' })

const compiler = webpack(webpackConfig, (err, res) => {
  if (err) {
    console.log(err)
  }
})
```

然后执行 `node build.js`，可以发现，依然可以生成打包后的文件



## webpack 源码阅读

https://github.com/gweid/webpack-source-code



## 手写一个简单的 webpack

https://github.com/gweid/gweid-webpack



## 附录

1. webpack 流程图

![webpack 完整流程图](./imgs/img2.jpg)

​       [webpack基本原理](https://blog.didiyun.com/index.php/2019/12/06/wepack-%e9%80%8f%e8%a7%86-%e6%8f%90%e9%ab%98%e5%b7%a5%e7%a8%8b%e5%8c%96%ef%bc%88%e5%ae%9e%e8%b7%b5%e7%af%87%ef%bc%89/)



2. [简单实现一个 webpack](https://juejin.cn/post/6854818576470933512)