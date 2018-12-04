---
title: 'Vue.js 源码学习笔记'
date: 2015/07/26 11:15:41
updated: 2018/02/06 01:17:46
tags:
- vue
---

最近饶有兴致的又把最新版 [Vue.js](http://vuejs.org/) 的源码学习了一下，觉得真心不错，个人觉得 Vue.js 的代码非常之优雅而且精辟，作者本身可能无 (bu) 意 (xie) 提及这些。那么，就让我来吧：）

### 程序结构梳理

![Vue 程序结构](http://img2.tbcdn.cn/L1/461/1/8142ef3fc2055839f1a93a933d80e17694b4f76b)

Vue.js 是一个非常典型的 MVVM 的程序结构，整个程序从最上层大概分为

1. 全局设计：包括全局接口、默认选项等
2. vm 实例设计：包括接口设计 (vm 原型)、实例初始化过程设计 (vm 构造函数)

这里面大部分内容可以直接跟 Vue.js 的[官方 API 参考文档](http://vuejs.org/api/)对应起来，但文档里面没有且值得一提的是构造函数的设计，下面是我摘出的构造函数最核心的工作内容。

![Vue 实例初始化](http://img3.tbcdn.cn/L1/461/1/00049a09def4aff8d80f3bb7229e3f6d395426fb)

整个实例初始化的过程中，重中之重就是把数据 (Model) 和视图 (View) 建立起关联关系。Vue.js 和诸多 MVVM 的思路是类似的，主要做了三件事：

1. 通过 observer 对 data 进行了监听，并且提供订阅某个数据项的变化的能力
2. 把 template 解析成一段 document fragment，然后解析其中的 directive，得到每一个 directive 所依赖的数据项及其更新方法。比如 `v-text="message"` 被解析之后 (这里仅作示意，实际程序逻辑会更严谨而复杂)：
    1. 所依赖的数据项 `this.$data.message`，以及
    2. 相应的视图更新方法 `node.textContent = this.$data.message`
3. 通过 watcher 把上述两部分结合起来，即把 directive 中的数据依赖订阅在对应数据的 observer 上，这样当数据变化的时候，就会触发 observer，进而触发相关依赖对应的视图更新方法，最后达到模板原本的关联效果。

所以整个 vm 的核心，就是如何实现 observer, directive (parser), watcher 这三样东西

<!--more-->

### 文件结构梳理

Vue.js 源代码都存放在项目的 `src` 目录中，我们主要关注一下这个目录 (事实上 `test/unit/specs` 目录也值得一看，它是对应着每个源文件的测试用例)。

`src` 目录下有多个并列的文件夹，每个文件夹都是一部分独立而完整的程序设计。不过在我看来，这些目录之前也是有更立体的关系的：

![Vue 文件结构](http://img4.tbcdn.cn/L1/461/1/cb73a147451157e52500734c0d31665a9540adae)

- 首先是 `api/*` 目录，这几乎是最“上层”的接口封装，实际的实现都埋在了其它文件夹里
- 然后是 `instance/init.js`，如果大家希望自顶向下了解所有 Vue.js 的工作原理的话，建议从这个文件开始看起
    - `instance/scope.js`：数据初始化，相关的子程序 (目录) 有 `observer/*`、`watcher.js`、`batcher.js`，而 `observer/dep.js` 又是数据观察和视图依赖相关联的关键
    - `instance/compile.js`：视图初始化，相关的子程序 (目录) 有 `compiler/*`、`directive.js`、`parsers/*`
- 其它核心要素：`directives/*`、`element-directives/*`、`filters/*`、`transition/*`
- 当然还有 `util/*` 目录，工具方法集合，其实还有一个类似的 `cache.js`
- 最后是 `config.js` 默认配置项

篇幅有限，如果大家有意“通读” Vue.js 的话，个人建议顺着上面的整体介绍来阅读赏析。

接下来是一些自己觉得值得一提的代码细节

### 一些不容错过的代码/程序细节

#### `this._eventsCount` 是什么?

一开始看 `instance/init.js` 的时候，我立刻注意到一个细节，就是 `this._eventsCount = {}` 这句，后面还有注释

![eventsCount1](http://img4.tbcdn.cn/L1/461/1/ba0408eb6b96275540a3584e8d2f54fc3e6fa143)

> for $broadcast optimization

非常好奇，然后带着疑问继续看了下去，直到看到 `api/events.js` 中 `$broadcast` 方法的实现，才知道这是为了避免不必要的深度遍历：在有广播事件到来时，如果当前 vm 的 `_eventsCount` 为 `0`，则不必向其子 vm 继续传播该事件。而且这个文件稍后也有 `_eventsCount` 计数的实现方式。

![eventsCount2](http://img2.tbcdn.cn/L1/461/1/c998cff73b20104c67f9a87d696fed2e505bfb5e)

![eventsCount3](http://img2.tbcdn.cn/L1/461/1/d536a283e6f76e5ab82d1fb77abea50d86edefd1)

这是一种很巧妙同时也可以在很多地方运用的性能优化方法。

#### 数据更新的 diff 机制

前阵子有很多关于视图更新效率的讨论，我猜主要是因为 virtual dom 这个概念的提出而导致的吧。这次我详细看了一下 Vue.js 的相关实现原理。

实际上，视图更新效率的焦点问题主要在于大列表的更新和深层数据更新这两方面，而被热烈讨论的主要是前者 (后者是因为需求小还是没争议我就不得而知了)。所以这里着重介绍一下 `directives/repeat.js` 里对于列表更新的相关代码。

![diff1](http://img2.tbcdn.cn/L1/461/1/688d02febd3c3b0633bb89a8c6ed0d03111651de)

首先 `diff(data, oldVms)` 这个函数的注释对整个比对更新机制做了个简要的阐述，大概意思是先比较新旧两个列表的 vm 的数据的状态，然后差量更新 DOM。

![diff2](http://img1.tbcdn.cn/L1/461/1/947041e58ac0648ef21c0a76f88c4dd21c1e10ca)

第一步：遍历新列表里的每一项，如果该项的 vm 之前就存在，则打一个 `_reused` 的标 (这个字段我一开始看 `init.js` 的时候也是困惑的…… 看到这里才明白意思)，如果不存在对应的 vm，则创建一个新的。

![diff3](http://img3.tbcdn.cn/L1/461/1/befe4ad131b854f48a5db76d208d066b3fc92bf9)

第二步：遍历旧列表里的每一项，如果 `_reused` 的标没有被打上，则说明新列表里已经没有它了，就地销毁该 vm。

![diff4](http://img3.tbcdn.cn/L1/461/1/734be56ff87ce5f7eab1f0c2dfeccf1980bfb4fe)

第三步：整理新的 vm 在视图里的顺序，同时还原之前打上的 `_reused` 标。就此列表更新完成。

顺带提一句 Vue.js 的元素过渡动画处理 (`v-transition`) 也设计得非常巧妙，感兴趣的自己看吧，就不展开介绍了

#### 组件的 `[keep-alive]` 特性

![keepAlive1](http://img3.tbcdn.cn/L1/461/1/84c59f338de3b80f50df41aac16ef35fc7d96ee3)

![keepAlive2](http://img4.tbcdn.cn/L1/461/1/aab1152e83634dcd06fdf1eb2d68aed37468c643)

Vue.js 为其组件设计了一个 `[keep-alive]` 的特性，如果这个特性存在，那么在组件被重复创建的时候，会通过缓存机制快速创建组件，以提升视图更新的性能。代码在 `directives/component.js`。

#### 数据监听机制

如何监听某一个对象属性的变化呢？我们很容易想到 `Object.defineProperty` 这个 API，为此属性设计一个特殊的 getter/setter，然后在 setter 里触发一个函数，就可以达到监听的效果。

![ob](http://img3.tbcdn.cn/L1/461/1/14830039350289177a948fc2a1c3af4f84ed07d2)

不过数组可能会有点麻烦，Vue.js 采取的是对几乎每一个可能改变数据的方法进行 prototype 更改：

![ob_array1](http://img1.tbcdn.cn/L1/461/1/82d90098f1f2f8c0d6499e950d6f42a1ed3d64b1)

但这个策略主要面临两个问题：

1. 无法监听数据的 `length`，导致 `arr.length` 这样的数据改变无法被监听
2. 通过角标更改数据，即类似 `arr[2] = 1` 这样的赋值操作，也无法被监听

为此 Vue.js 在文档中明确提示不建议直接角标修改数据

![ob_array2](http://img4.tbcdn.cn/L1/461/1/d26e450e3d6cf2e9dfb85be44bb4d61a058fa43a)

同时 Vue.js 提供了两个额外的“糖方法” `$set` 和 `$remove` 来弥补这方面限制带来的不便。整体上看这是个取舍有度的设计。我个人之前在设计数据绑定库的时候也采取了类似的设计 (一个半途而废的内部项目就不具体献丑了)，所以比较认同也有共鸣。

#### path 解析器的状态机设计

首先要说 `parsers` 文件夹里有各种“财宝”等着大家挖掘！认真看一看一定不会后悔的

`parsers/path.js` 主要的职责是可以把一个 JSON 数据里的某一个“路径”下的数据取出来，比如：

    var path = 'a.b[1].v'
    var obj = {
      a: {
        b: [
          {v: 1},
          {v: 2},
          {v: 3}
        ]
      }
    }
    parse(obj, path) // 2

所以对 `path` 字符串的解析成为了它的关键。Vue.js 是通过状态机管理来实现对路径的解析的：

![state1](http://img2.tbcdn.cn/L1/461/1/192c0ee1f09e39da97f478ac487fff1a7f41ee30)

咋一看很头大，不过如果再稍微梳理一下：

![state graph](http://img2.tbcdn.cn/L1/461/1/3acfc1236df2d6cd068dd8540e0b0baeb4b8916b)

也许看得更清楚一点了，当然也能发现其中有一点小问题，就是源代码中 `inIdent` 这个状态是具有二义性的，它对应到了图中的三个地方，即 `in ident` 和两个 `in (quoted) ident`。

实际上，我在看代码的过程中[顺手提交了这个 bug](https://github.com/yyx990803/vue/issues/1063)，作者眼明手快，当天就进行了修复，现在最新的代码里已经不是这个样子了：

![state2](http://img2.tbcdn.cn/L1/461/1/c3d6fbfe3fd1fec5d8bbb582b8785244107c1ce6)

而且状态机标识由字符串换成了数字常量，解析更准确的同时执行效率也会更高。

### 一点自己的思考

首先是视图的解析过程，Vue.js 的策略是把 element 或 template string 先统一转换成 document fragment，然后再分解和解析其中的子组件和 directives。我觉得这里有一定的性能优化空间，毕竟 DOM 操作相比之余纯 JavaScript 运算还是会慢一些。

然后是基于移动端的思考，Vue.js 虽确实已经非常非常小巧了 (min+gzip 之后约 22 kb)，但它是否可以更小，继续抽象出常用的核心功能，同时更快速，也是个值得思考的问题。

第三我非常喜欢通过 Vue.js 进行模块化开发的模式，Vue 是否也可以借助类似 web components + virtual dom 的形态把这样的开发模式带到更多的领域，也是件很有意义的事情。

### 总结

Vue.js 里的代码细节还不仅于此，比如：

- `cache.js` 里的缓存机制设计和场景运用 (如在 `parsers/path.js` 中)
- `parsers/template.js` 里的 `cloneNode` 方法重写和对 HTML 自动补全机制的兼容
- 在开发和生产环境分别用注释结点和不可见文本结点作为视图的“占位符”等等

自己也在阅读代码，了解 Vue.js 的同时学到了很多东西，同时我觉得代码实现只是 Vue.js 优秀的要素之一，整体的程序设计、API 设计、细节的取舍、项目的工程考量都非常棒！

总之，分享一些自己的收获和代码的细节，希望可以帮助大家开阔思路，提供灵感。