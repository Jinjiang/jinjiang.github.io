---
title: 'Code Review for Vue 2.0 Preview'
date: 2016/04/28 01:16:03
updated: 2016/05/11 02:17:49
---

是的！[Vue 2.0 发布了！](https://jiongks.name/blog/announcing-vue-2/) 源代码仓库[在此](https://github.com/vuejs/vue/tree/next)

首先，当我第一次看到 Vue 2.0 的真面目的时候，我的内心是非常激动的

### Demo

来个简单的 demo，首先把 `dist/vue.js` 导入到一个空白的网页里，然后写：

**当然，在大家阅读下面所有的内容之前，先想象一下，这是一个运行时 min+gzip 后只有 12kb 大小的库**

    <script src="./dist/vue.js"></script>
    
    <div id="app">
      Hello {{who}}
    </div>
    <script>
      new Vue({
        el: '#app',
        data: {who: 'Vue'}
      })
    </script>

你将看到 "Hello Vue"

然后再看一个神奇的：

    <script src="./dist/vue.js"></script>
    
    <div id="app"></div>
    <script>
      new Vue({
        el: '#app',
        render: function () {
          with (this) {
            __h__('div',
              {staticAttrs:{"id":"app"}},
              [("\n  Hello "+__toString__(who)+"\n")],
              ''
            )
          }
        }
        data: {who: 'Vue'}
      })
    </script>

这个是 compile 过后的格式，大家会发现首先 `#app` 下不需要写模板了，然后 `<script>` 里多了一个 `render` 字段，Vue 在运行时其实是会把模板内容先转换成渲染方法存入 `render` 字段，然后再执行，如果发现 `render` 已经存在，就跳过模板解析过程直接渲染。所以在 Vue 2.0 中写一段模板和写一个 `render` option 是等价的。为什么要这样设计，稍后会我们会涉及到。

<!--more-->

### Code Review

废话不说，来看[仓库](https://github.com/vuejs/vue/tree/next)

哎呀好东西太多我都不知道该先讲哪个啦！

### `package.json` - -

[https://github.com/vuejs/vue/blob/next/package.json](https://github.com/vuejs/vue/blob/next/package.json)

先看这里，我个人习惯是拿到仓库之后除了 README (它没写) 就先看这个。和 1.x 相比，开发工具链还是以 rollup + webpack + karma 为主，开发的时候用 webpack 加 watch；打包的时候用 rollup 快速而且可以自动删掉没用到的代码片段；测试的时候用 karma 各种组合，包括 e2e、spec、coverage、sauce等。语法检查用了 eslint 这个似乎没什么争议和悬念。另外我发现了两个新东西：[nightwatch](http://nightwatchjs.org/) 和 [selenium-server](https://www.npmjs.com/package/selenium-server)

另外你们就选眼睛再迟钝也会看到 ssr 这个词吧！对，就是服务端渲染 Server-Side Rendering！先不急，这个最后说，你们可以先去 high 一会儿

### `src`

作为一个见证了一小段 Vue 2.0 成长过程的脑残粉，我得跟大家从时间线的角度介绍一下这个文件夹：

#### `compiler` + `runtime`

早些时候 Vue 2.0 的代码还是这样分的，一半运行时，一半(预)编译时，中间会通过一个 JavaScript 的格式严格划清界限，即源代码 template + JavaScript 经过编译之后变成了一段纯 JavaScript 代码，然后这段纯 JavaScript 的代码又可以在运行时被执行渲染。

这里面奇妙的地方是：编译时的代码完全可以脱离浏览器预执行，也可以在浏览器里执行。所以你可以把代码提前编译好，减轻运行时的负担。

由于 Vue 2.0 对 template 的解析没有借助 DOM 以及 fragment document，而是在 John Resig 的 [HTML Parser](https://github.com/vuejs/vue/blob/14feb83879fe32fc9c54eddf33c6c5ef2fb4e8a2/src/compiler/parser/html-parser.js) 基础上实现的，所以完全可以在任何主流的 JavaScript 环境中执行，这也为 ssr 提供了必要的基础

Vue 最早会打包生成三个文件，一个是 runtime only 的文件 vue.common.js，一个是 compiler only 的文件 compiler.js，一个是 runtime + compiler 的文件 vue.js，它们有三个打包入口，都放在了 `entries` 目录下，这是 `src` 里的第三个文件夹，第四个文件夹是 `shared`，放置一些运行时和编译时都会用到的工具方法集。

#### `compiler` + `runtime` + `platforms`

Wahahaha~

这要说到 Vue 2.0 的第二个优点：virtual-DOM！virtual-DOM 有很多优点，也被很多人热议，而 Vue 2.0 里面的 virtual-DOM 简直是把它做到了极致！代码非常简练，而且性能超高 (据说秒杀 React，我自己没试过，大家可以自己比比看)。在这一点上编译器的前置起到了非常重要的作用，而且很多 diff 算法的优化点而且是在运行时之前就准备好的。

另外 virtual-DOM 的另一个优点当然就是可以对渲染引擎做一般化的抽象，进而适配到更多类型的终端渲染引擎上！所以在我的怂恿下，小右把本来在 `runtime` 下的 `runtime/dom` 文件夹挪到了一个名叫 `platforms` 的新文件夹下，改名叫 `platforms/web/runtime`，把本来 `compiler` 文件夹下 web 相关的 `modules` 挪到了 `platforms/web/compiler`！

(是的没错，今天在 [Weex](https://alibaba.github.io/weex/) 的子仓库里已经有另外一个 `platforms/weex` 文件夹了耶)

#### `compiler` + `runtime` + `platforms` + `server`

是的没有错！Vue 2.0 既然已经有了 virtual-DOM，也有了运行环境无关的 compiler，为什么不能 ssr 呢？！Vue 2.0 不只是简单的把预渲染拿到服务端这么简单，Vue 2.0 ssr 除了提供传统的由源文件编译出字符串之外，还提供了输出 stream 的功能，这样服务端的渲染不会因为大量的同步字符串处理而变慢。即：`createRenderer()` 会返回 `renderToString()` 和 `renderToStream()` 两个方法。同时，在 `platforms/web` 文件夹下除了 `runtime` 和 `compiler` 之外又多了一个 `server` 目录，这样编译器、服务端流式预渲染、运行时的铁三角架构就这样达成了！

### `test`

说到测试，我惊奇的发现，在带来了这么多颠覆性的改变之后，Vue 2.0 竟然完好保留了绝大多数 1.0 的 API 设计，而且更快更小巧延展性更强。Vue 2.0 在前期研发阶段主要是通过粗线条的 e2e 测试进行质量保障的，因为版本延续性做得非常好，所以这部分在 1.x 的积累已经帮上很大忙了。现在 Vue 2.0 逐渐的在从 feature 的角度在进一步覆盖测试用例，对每个 API 和每个流程进行测试。目前以我个人的感觉主要的常见的链路都已经比较畅通了，具体功能细节上偶尔还是会遇到 bug 待修复，不过作为一个新兴的 Vue 2.0 来说，相信这已经远远超过大家的预期了！

### 其它

我觉得 Vue 2.0 在编译器和运行时的解耦上做得超级棒！中间格式设计得也非常巧妙，把静态的部分在编译时就分析出来，而且通过非常简单的 `__h__`, `__renderList__` 等方法就搞定了几乎所有的逻辑控制和数据绑定。之前我个人在实践 Weex 的时候也是会把 template 提前 compile，但只是 compile 成一段 JSON，逻辑分析还是在运行时做的，当时和小右交流的时候就在讨论，能不能把分析过程也前置，无奈自己功力不够啊，一直没搞出来。看到 2.0 横空出世，简直是泪流满面有木有！！

还有一件事情也是之前跟小右聊到过，就是目前 Vue 提供的很多 directive 包括 filter 也都是有机会前置处理的，所以在 Vue 2.0 里，有相当一部分 directive 是前置处理成一般格式的，运行时只是针对各端的渲染机制保留了 attr, style, class, event 等几个最基础简单的解析过程，比如 if, for, else 都直接在 compile 的时候被解开了。而且 Vue 2.0 把这部分内容抽象得如此清晰，除了赞叹还是赞叹！！

还有就是，你们去看看 Vue 2.0 的提交记录，300+ 次提交，上万行高效优质的代码，总共花了差不多两周的时间，而且提交时间几乎遍布二十四个小时……

别的不多啰嗦了，我觉得大家还是亲自看过 Vue 2.0 的源码，会对这些内容有更深刻的了解。从今天起，fork + clone Vue 2.0，写写 demo、写写测试、练练英文 XD go!
