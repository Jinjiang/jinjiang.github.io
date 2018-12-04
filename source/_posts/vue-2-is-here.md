---
title: 'Vue 2.0 来了！'
date: 2016/10/01 12:45:09
updated: 2017/08/01 03:00:44
tags:
- vue
---

终于发布了！

原文：[https://medium.com/the-vue-point/vue-2-0-is-here-ef1f26acf4b8#.6r9xjmu6x](https://medium.com/the-vue-point/vue-2-0-is-here-ef1f26acf4b8#.6r9xjmu6x)

今天我非常兴奋的官宣 Vue.js 2.0 的发布：Ghost in the Shell。历经 8 个 alpha 版本、8 个 beta 版本和 8 个 rc 版本 (矮油好巧！)，Vue.js 2.0 已经为生产环境准备好了！我们的官方教程 [vuejs.org/guide](http://vuejs.org/guide/) 也已经全面更新。

2.0 的工作自今年 4 月启动以来，[核心团队](https://github.com/orgs/vuejs/people)为 API 设计、bugfix、文档、类型声明做出了很重要的贡献，社区中的同学们也反馈了很多有价值的 API 建议——在此为每一位参与者致以大大的感谢！

<!--more-->

### 2.0 有哪些新东西

#### 性能

![基于第三方 benchmark，数值越低越好](https://d262ilb51hltx0.cloudfront.net/max/1600/1*Lu6OJiraJYShl4aBppoh3w.png)

基于[第三方 benchmark](http://stefankrause.net/js-frameworks-benchmark4/webdriver-ts/table.html)，数值越低越好

2.0 用一个 fork 自 [snabbdom](https://github.com/snabbdom/snabbdom) 的轻量 Virtual DOM 实现对渲染层进行了重写。在其上层，Vue 的模板编译器能够在编译时做一些智能的优化处理，例如分析并提炼出静态子树以避免界面重绘时不必要的比对。新的渲染层较之 v1 带来了巨大的性能提升，也让 Vue 2.0 成为了最快速的框架之一。除此之外，它把你在优化方面需要做的努力降到了最低，因为 Vue 的响应系统能够在巨大而且复杂的组件树中精准的判断其中需要被重绘的那部分。

![](https://d262ilb51hltx0.cloudfront.net/max/1600/1*xV2_bx4eWC9RXiBZjeAMrw.png)

还有个值得一提的地方，就是 2.0 的 runtime-only 包大小 min+gzip 过后只有 16kb，即便把 *vue-router* 和 *vuex* 都包含进去也只有 26kb，和 v1 核心的包大小相当！

#### 渲染函数

尽管渲染层全面更新，Vue 2.0 兼容了绝大部分的 1.0 模板语法，仅废弃掉了其中的一小部分。这些模板在背后被编译成了 Virtual DOM 渲染函数，但是如果用户需要更复杂的 JavaScript，也可以选择在其中直接撰写渲染函数。同时我们为喜欢 JSX 的同学提供了[支持选项](https://github.com/vuejs/babel-plugin-transform-vue-jsx)

渲染函数使得这种基于组件的开发模式变得异常强大，并打开了各种可能性——比如现在新的 transition 系统就是完全基于组件的，内部由渲染函数实现。

#### 服务端渲染

Vue 2.0 支持服务端渲染 (SSR)，并且是[流式的](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer#rendererrendertostreamvm)，可以做[组件级的缓存](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer#component-caching)，这使得极速渲染成为可能。同时，*vue-router* 和 *vuex* 2.0 也都支持了可以通用路由和客户端状态“hydration”的服务端渲染。你可以通过 [vue-hackernews-2.0 的 demo app](https://github.com/vuejs/vue-hackernews-2.0/) 了解到它们是如何协同工作的。

### 辅助库

官方支持的库和工具——*vue-router*、*vuex*、*vue-loader* 和 *vueify*——都已经升级并支持 2.0 了。**vue-cli 现在已经默认生成 2.0 的脚手架了。**

特别之处在于，*vue-router* 和 *vuex* 在它们的 2.0 版本中都已经有了很多改进：

**vue-router**

* 支持多命名的 `<router-view>`
* 通过 `<router-link>` 组件改进了导航功能
* 简化了导航的 hooks API
* 可定制的滚动行为控制
* [更多复杂示例](https://github.com/vuejs/vue-router/tree/dev/examples)

**vuex**

* 简化了组件内的用法
* 通过改进 modules API 提供更好的代码组织方式
* 可聚合的异步 actions

它们各自的 2.0 文档里有更多的细节：

* [http://router.vuejs.org/](http://router.vuejs.org/)
* [http://vuex.vuejs.org/](http://vuex.vuejs.org/)

#### 社区项目

中国最大的在线订餐平台饿了么的[团队](https://github.com/ElemeFE/)已经基于 Vue 2.0 构建了[一套完整的桌面 UI 组件库](https://github.com/ElemeFE/element)。不过还没有英文文档，但是他们正在为此而努力！

很多其他社区的项目也都在为 2.0 做兼容——请移步到 [awesome-vue](https://github.com/vuejs/awesome-vue) 搜索关键字“2.0”。

### 从 1.0 迁移

如果你是一个 Vue 的新同学，现在就可以“无脑”使用 Vue 2.0 了。最大的问题其实是目前 1.0 的用户如何迁移到新的版本。

![](https://d262ilb51hltx0.cloudfront.net/max/1600/1*157Ly5X6gx0C2CIvsMaNog.png)

为了帮助大家完成迁移，团队已经在配合 [CLI 迁移辅助工具](https://github.com/vuejs/vue-migration-helper)制作[非常详实的迁移教程](http://vuejs.org/guide/migration.html)。这个工具不一定捕获每一处被废弃的东西，但相信能帮你开个好头。

### One More Thing……

中国最大的电商公司阿里巴巴的工程师们已经发起了一个叫做 [Weex](https://github.com/alibaba/weex) 的项目，通过 Vue-inspired 语法在移动端渲染 native UI 组件。但是很快，“Vue-inspired” 将会成为 “Vue-powered”——我们已经启动了官方合作，让 Vue 2.0 真正成为 Weex 的 JavaScript 运行时框架。这让用户能够撰写横跨 Web、iOS 和 Android 的通用 Vue 组件！我们的合作才刚刚开始，这将会是 2.0 发布后未来我们专注的重点，请大家拭目以待！

Vue 从一个不起眼的 side project 开始如今已经有了长足的发展。今天它已经是[社区资助的](https://www.patreon.com/evanyou)，[被实际广泛认可的](https://www.quora.com/How-popular-is-VueJS-in-the-industry/answer/Evan-You-3?__snid3__=365957938&__nsrc__=2&__filter__)，并且根据 [stats.js.org](http://stats.js.org/) 统计在所有 JavaScript 库中增势最强劲的一个。我们相信 2.0 会走得更远。这是 Vue 自启动以来最大的一次更新，我们期待大家用 Vue 创造出更多好产品！