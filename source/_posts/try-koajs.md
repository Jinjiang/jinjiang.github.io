---
title: '用 Koa 写服务体验'
date: 2015/06/21 07:59:43
updated: 2015/06/21 10:52:43
---

![Koa](http://img2.tbcdn.cn/L1/461/1/5682414ab4dc8dd1b4ff91b0b57f96947c1c1c11)

晒一下自己用 [Koa](https://koajs.com/) next generation web framework for node.js 写的一个 web 服务

这个 web 服务主要是做内容的列表展示和搜索的 (可能说得比较抽象，但确实是 web 服务最常需要做的事情) 主要的文件一共就2个：

- `app.js` 主程序
- `lib/model.js` 数据层

其中 `model.js` 是和具体业务逻辑相关的，就不多介绍了，这也不是 Koa 的核心；而 `app.js` 的代码可以体现 Koa 的很多优点，也使得代码可以写得非常简练而去清晰——这是我自己都完全没有想到的事情

<!--more-->

### 加载资源和相关依赖库

    // resources

    var koa = require('koa')
    var app = koa()

    var logger = require('koa-logger')
    var route = require('koa-route')

    var fs = require('fs')
    var path = require('path')
    var extname = path.extname

    var views = require('co-views')
    var render = views('./views', {
      map: { html: 'ejs' }
    })

    var model = require('./lib/model')

其中：

1. `koa` 是最核心的库，`app` 是 `koa` 生成的 web 服务主程序
2. [`koa-logger`](https://www.npmjs.com/package/koa-logger) 和 [`koa-route`](https://www.npmjs.com/package/koa-route) 都是koa官方开发的“中间件”，分别用来打印日志和路由设置，路由设置稍后还会提到
3. `fs` 和 `path` 都是 Node 的官方包，用来进行本地文件和路径相关的处理，辅助性质的
4. [`co-views`](https://www.npmjs.com/package/co-views) 是用来渲染模板的库，而 `render` 是它生成的实例，这个用法也跟传统用法不太一样，稍后会提及

### Web 服务工作流

    // workflow

    app.use(logger())

    app.use(route.get('/', list))
    app.use(route.get('/page/:page', list))
    app.use(route.get('/search/:keywords', search))
    app.use(route.get('/search/:keywords/:page', search))

    app.use(function *(next) {
      if (!this.path.match(/^\/assets\//)) {
        yield* next
        return
      }
      var path = __dirname + this.path
      var fstat = yield stat(path)

      if (fstat.isFile()) {
        this.type = extname(path)
        this.body = fs.createReadStream(path)
      }
    })

    app.use(function *(next) {
      if (this.needRendered) {
        this.body = yield render(this.templateView, {cache: false, data: this.templateModel})
      }
      yield* next
    })


    // utils

    function stat(file) {
      return function (done) {
        fs.stat(file, done)
      }
    }

这部分代码是用来规划服务器工作流的，从请求被接受到响应被发出，整个过程都在这段代码里一览无余。工作流设计的主要的用法是 `app.use(...)`。里面的参数其实就是一个 generator。

1. 首先是打开日志
2. 然后是分发路由，这里可以看到，有首页、列表、搜索、搜索列表 4 种设计，分别对应到了各自的处理方，`list` 和 `search` 其实都是在利用 `lib/model` 在生成数据，准备给模板进行渲染。这里的原理也有特殊之处，稍后会看到
3. 再看紧随其后的两个 `app.use`，分别是处理静态资源目录 `assets` 和对模板+数据进行渲染

所以完整的工作流可以理解为：

1. 请求页面 (列表或搜索) -> `logger` -> 路由分发 -> `list` 或  `search` -> 模板渲染 -> 回应
2. 请求静态资源 -> `logger` -> 找到对应的 `assets` 文件 -> 回应

### `function *() {}` 和 `yield` 是啥？

这个其实是 Koa 的精髓所在，在介绍它之前，我们先把 `list` 和 `search` 的代码也贴出来：

    // routes

    function *list(page, next) {
      next = arguments[arguments.length - 1]
      this.templateView = 'page'
      this.templateModel = yield model.list({page: page})
      this.needRendered = true
      yield *next
    }

    function *search(keywords, page, next) {
      next = arguments[arguments.length - 1]
      this.templateView = 'search'
      this.templateModel = yield model.search({keywords: keywords, page: page})
      this.needRendered = true
      yield *next
    }

大家会发现，首先 `app.use(...)`  和 `route.get(path, ...)` 传入的参数都是一种写得很像函数的东西，但不同之处是函数的写法是 `function foo() {...}`，而这里的写法多了一个星号，即 `function *foo() {}`。这种写法其实就是 ES6 里的 generator。而 `yield` 正是配合这个写法的一种语法。

有关 ES6 generator 的基础知识，建议大家来 @兔哥 的这个 [ES6 教程网页](http://es6.ruanyifeng.com/#docs/generator)来学习，这里不做原理方面的赘述。但我想说的是，由于 web 服务的处理本身就是“一层一层”的，并且有些处理是可以同步的，有些是只能异步的，我们不免要精心设计很多中间件并保障它的可扩展性，同时尽量简化异步操作的写法保障它的可读性。

有了 ES6 generator 和 `yield` 之后，我们的每一层中间件都可以从流程上看成一个以 `yield *next` 语句切分出来的 “三明治”：

    function *(next) {
      // 下一步之前的操作
      yield *next // 进行下一步
      // 所有逻辑处理完之后的补充操作
    }

而且这个“下一步”是不介意是不是异步行为，都可以这样简单描述清楚的。

![koa workflow](https://camo.githubusercontent.com/d80cf3b511ef4898bcde9a464de491fa15a50d06/68747470733a2f2f7261772e6769746875622e636f6d2f66656e676d6b322f6b6f612d67756964652f6d61737465722f6f6e696f6e2e706e67)

后头看我们设计的整个工作流的实现：

![workflow](http://img4.tbcdn.cn/L1/461/1/4e70cfbf5ae5069d6bb1a049cbb73e26241d34a7)

我们这里的逻辑基于全部是出现在 `yield *next` 之前的，但是如果你需要在临发出响应之前做点什么，就可以写在其后面了

### `co-views` 的用法

`co-views` 其实是对通用模板引擎渲染平台 [consolidate](https://www.npmjs.com/package/consolidate) 的封装，consolidate 应该算是 express.js 时代非常重要的一个库，它支持包括 ejs, mustache, swig 等各种模板渲染并提供统一的 api 调用方法。根据对 `co-views` 源码的分析，它把 consolidate 统一的 api 又封装成了 `return function (done) {...}` 的形态，这样源代码中的 `yield render(view, model)` 就能够融入 generator 的逻辑之中。

值得一提的是，源代码中 `yield render(view, model)` 这里的 `model` 传入了一个 `{cache: false}` 的参数，这会意味着模板不会被缓存，每次修改模板文件之后，在不重启服务的情况下，刷新页面就可以看到最新的效果。这个选项是针对开发环境设置的，为了保障线上环境的运行性能和效率，这个选项应该是不需要的。

### `lib/model` 的用法

同上，我们在 `lib/model.js` 里封装的 `yield model.list({page: page})` 和 `yield model.search({keywords: keywords, page: page})` 也都会生成形如 `return function (done) {...}` 的返回值，以融入 generator 的逻辑之中。

### 最后，监听端口

    // listen

    app.listen(3000)
    console.log('listening on port 3000')

That's it

### 后记

在首次尝试用 generator 的方式编写 web 服务的时候，我自己一开始总会把 `yield` 的位置、`yield` 后面要不要加星号、`function` 后面要不要加星号、`app.use()` 的调用顺序这几件事情弄得乱糟糟的，可能还是对 generator 和 koa 的理解不够深入，不过逐渐写着写着，感受到了更多的爽和快感。到最后用如此简单的一个 js 文件完成了全部的功能和逻辑串联，还是觉得很兴奋的。大家如果感兴趣也可以搞来玩一玩，写点自己平时用得到用不到的小玩意儿体验一下：）
