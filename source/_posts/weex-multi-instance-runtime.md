---
title: "Weex 在 JS Runtime 内的多实例管理"
date: 2016/8/31 11:17
updated: 2016/8/31 11:17
---

<mark>本文早些时候发表在 weexteam 的博客 https://github.com/weexteam/article/issues/71</mark>

Weex 的技术架构和传统的客户端渲染机制相比有一个显著的差别，就是引入了 JavaScript，通过 JS Runtime 完成一些动态性的运算，再把运算结果和外界进行通信，完成界面渲染等相关操作指令。而客户端面对多个甚至可能同时共存的 Weex 页面时，并没有为每个 Weex 页面提供各自独立的 JS Runtime，相反我们只有一个 JS Runtime，这意味着所有的 Weex 页面共享同一份 JS Runtime，共用全局环境、变量、内存、和外界通信的接口等等。这篇文章会循序渐进的介绍 Weex JS Runtime 这部分的内容，大概的章节设计是这样的：

1. 为什么需要多实例
2. 多实例管理面临的挑战
3. 解决问题的思路
4. 几个特殊处理的地方
5. 总结

### 为什么在 JS Runtime 内部手动管理多实例？

如果只用一个词来回答，那就是“性能”

如果要用一段话来回答：手机上的资源是很宝贵的，包括CPU、内存、电量等等，而 Weex 团队从设计初期就决定以页面为单位对产品实现进行划分，一个完整的应用是多个相互独立解耦的页面通过一定的路由规则和链接跳转互联起来组合而成。所以为每个页面都单独提供一份 JS Runtime 代价还是比较昂贵的，这会引起大量的资源开销，手机发烫，反应迟钝，甚至应用或操作系统的崩溃。尤其是在国内一些中低端机型上面，反应尤其明显。

从另外一个角度讲，我们通过同一个 JS Runtime，可以更直接方便的做一些运行时的资源共享，比如 JS Framework 的初始化过程，只需要应用启动的时候执行一次就可以了，不必每个页面被打开的时候才进行。目前 JS Framework 的启动过程一般会在几百毫秒不等，相当于每个页面打开的时候，这几百毫秒都被节省下来了。

### 多实例管理的 JS Runtime 需要额外关注哪些问题？

首先不同的 Weex 页面肯定需要执行各自的 JavaScript 运算，完成各自的 native 指令收发。所以如何避免多个 Weex 页面在同一个 JS Runtime 里相互“打架”就变得至关重要。

这里的“打架”有以下几个细节：

- 数据和状态的记录，能够正确的完成并且不会被其它页面的运算所干扰或截获
- 和 native 之间的收发指令或通信，能够准确的调度不同的 native 端页面
- 对系统资源的利用，遇到大运算量的页面时，其它页面有机会快速得到响应

除了“打架”的问题之外，传统 HTML5 页面里，每个 JS Runtime 的生命周期是对应页面本身的生命周期的，相对是个短效的实例，而且一旦页面被关闭，对应这个页面的 JS Runtime 就可以大方的 kill 掉，没有任何后顾之忧；而 Weex 的 JS Runtime 需要在应用被开启之后至始至终存在并不间断工作，所以长期运转的内存管理也变成了一个不得不正视的问题。

### Weex 解决上述问题的过程

- 首先，我们会为每个新打开的 Weex 页面创建一个唯一的 instance id
- 其次，JS Runtime 里所有的 native 通信接口，不管是发送还是接收，全部需要传递 instance id 作为第一个参数，这样 JS Runtime 和 native 端都可以快速准确的识别并分发给每个 Weex 页面，比如：
    - `createInstance(id, code, config, data)`：创建一个新的 Weex 页面，通过一整段 Weex JS Bundle 的代码，在 JS Runtime 开辟一块新的空间用来存储、记录和运算
    - `sendTasks(id, tasks)`：从 JS Runtime 发送指令到 native 端
    - `receiveTasks(id, tasks)`：从 native 端发送指令到 JS Runtime
- 然后，我们根据不同的 instance id 在 JS Runtime 里进行独立的运算和数据、状态记录。这里我们通过 JavaScript 里的闭包原理把不同实例的运算和数据状态管理隔离在了不同的闭包里，达到相互不“打架”的目的。

#### 初级形态

形如：

```javascript
// old version of Weex JS Runtime

function createInstance(id, code) {
  const customComponents = {}

  function define(name, definition) {
    // todo: register a weex component in this Weex instance
    ...
    customComponents[name] = definition
    ...
  }
  function bootstrap(name) {
    // todo: start to render this Weex instance from a certain named component
    ...
    sendTasks(id, [...])
    ...
  }

  // run
  eval(code)
}
```

我们在闭包中设置了这么几个东西，保障隔离效果：

1. `define`: 用来自定义一个复合组件
2. `bootstrap`: 用来以某个复合组件为根结点渲染页面

这样的话，假设有一个 Weex 页面，它的代码是这样的：

``` js
// 伪代码，并不能实际运行

// A Weex JS Bundle File

// define a component named `foo`
define('foo', {
  type: 'div',
  children: [
    { type: 'text', attr: { value: 'Hello World' }}
  ]
})

// render the page with `foo` component
bootstrap('foo')
```

那么 Weex 页面里的 `define` 和 `bootstrap` 表面上是全局方法，实际上只会针对当前的 Weex instance 在一个更小的作用域下执行，而不会干扰或污染全局环境或其它 Weex 页面。

这是我们最初的版本的形态。

#### 配合更开放的前端包管理工具

随着 Weex JS Framework 代码的不断演进，功能也逐渐丰富起来，上层的 Weex 页面也写得越来越复杂，之前简单的 `define` + `bootstrap` 已经满足不了工程上的需求和设想了。这个时候我们需要引入前端资源包管理的概念，而且拥抱现有的各种成熟的包管理规范和工具。这其中包括 AMD、CMD、CommonJS、ES6 Modules 等等。这个时候 `define` 和 `bootstrap` 这两个名字就显得起得有点太大了，尤其是 `define`，和 AMD 里的语法重叠，所以和很多兼容 AMD 语法的打包工具都会产生冲突。所以我们逐步把这些方法转变成了带有 Weex 特殊前缀的方法：

1. `__weex_define__`: `define` 的别名，用来自定义一个复合组件
2. `__weex_bootstrap__`: `bootstrap` 的别名，用来以某个复合组件为根结点渲染页面

同时我们可以借助各种打包工具把 Weex 页面拆成多个文件开发和维护，然后打包成一个文件完成发布和运行，以 webpack 为例，上述的例子会打包生成类似：

``` js
// 伪代码，并不能实际运行

/******/ (function(modules) { // webpackBootstrap
/******/  // The module cache
/******/  var installedModules = {};

/******/  // The require function
/******/  function __webpack_require__(moduleId) {

/******/    // Check if module is in cache
/******/    if(installedModules[moduleId])
/******/      return installedModules[moduleId].exports;

/******/    // Create a new module (and put it into the cache)
/******/    var module = installedModules[moduleId] = {
/******/      exports: {},
/******/      id: moduleId,
/******/      loaded: false
/******/    };

/******/    // Execute the module function
/******/    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/    // Flag the module as loaded
/******/    module.loaded = true;

/******/    // Return the exports of the module
/******/    return module.exports;
/******/  }


/******/  // expose the modules object (__webpack_modules__)
/******/  __webpack_require__.m = modules;

/******/  // expose the module cache
/******/  __webpack_require__.c = installedModules;

/******/  // __webpack_public_path__
/******/  __webpack_require__.p = "";

/******/  // Load entry module and return exports
/******/  return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

  __weex_define__('foo', {
    type: 'div',
    children: [
      { type: 'text', attr: { value: 'Hello World' }}
    ]
  })

  __weex_bootstrap__('foo')

/***/ }
/******/ ]);
```

</div>

#### 从 `eval` 到 `new Function`

之后我们在最终执行 Weex JS Bundle 代码时，从略显简陋的 `eval` 命令改写成了 `new Function`，即：

``` js
// old version
function define() {...}
function bootstrap() {...}
eval(code)

// new version
import { aaa, bbb } from 'xxx' // place and name your methods as you like
const fn = new Function('define', 'bootstrap', code)
fn(aaa, bbb)
```

用 `new Function` 的前几个参数定义了即将执行的 Weex JS Bundle 中“伪装”的几个全局变量或全局方法，然后运行的时候把那些背后的“伪装”传递进去，形式上更灵活，运行时更安全。

同时也是因为闭包中需要准备的变量和方法也逐渐多起来了，`new Function` 的写法更便于清晰的管理和对应这些内容。

#### 性能优化

可能很多同学注意到了，不论是 `eval` 还是 `new Function` 其实效率都是不高的，为什么还要这样用呢？主要的原因还是因为我们需要动态的为每个 Weex 页面创造这样的闭包。后来在 native 端我们还想到了一些变通的优化办法，即在 native 端将 Weex JS Bundle 代码包装在一个闭包里，再丢给 JavaScript 去执行。所以，如果一个 Weex JS Bundle 大代码如下：

``` js
// 伪代码，并不能实际运行

__weex_define__('foo', {
  type: 'div',
  children: [
    { type: 'text', attr: { value: 'Hello World' }}
  ]
})

__weex_bootstrap__('foo')
```

而客户端现在要基于这个 Weex JS Bundle 创建一个页面，instance id 为 `x`，那么客户端会先为这段代码加上特殊的头和尾：

``` js
// 伪代码，并不能实际运行

// 特殊的头部代码
(function (global) {
  const env = global.prepareInstance('x')
  (function (__weex_define__, __weex_bootstrap__) {
// 特殊的头部代码

__weex_define__('foo', {
  type: 'div',
  children: [
    { type: 'text', attr: { value: 'Hello World' }}
  ]
})

__weex_bootstrap__('foo')

// 特殊的尾部代码
  })(env.define, env.bootstrap)
})(this)
// 特殊的尾部代码
```

这样的话我们先通过 `prepareInstance('x')` 创建一个属于 `x` 这个 id 的方法，然后通过 `function (__weex_define__, __weex_bootstrap__)` 创造一个闭包，把 JS Bundle 的源代码放进去，效果和之前的实现是等价的，但是由于没有用到 `eval` 和 `new Function`，性能有了一定的提升，在我们实验室数据中，JavaScript 运算的时间缩短了 10%~25%。

当然，由于在浏览器的环境下，我们没有机会在执行 JavaScript 之前对内容进行高性能的处理，所以 HTML5 Renderer 还没有办法通过这样的改造提升执行效率，在这方面我们还会继续探索。

#### 其它多实例管理接口设计

包括上述提到的 `createInstance()` 接口在内，JS Runtime 还提供了以下几个和 native 通信的方式：

首先是 native 配置的导入：

- `registerComponents(components)`
- `registerModules(modules)`

这两个 API 用来让 JS Runtime 知道当前 Weex 支持哪些原生组件和原生的功能模块，及其相关的细节。

其次是实例的生命周期管理：

- `createInstance(id, code, ...)`
- `refreshInstance(id, data)`
- `destroyInstance(id)`

这三个 API 用来让 JS Runtime 知道每一个页面的创建和销毁的时机，特别的，我们还提供了一个 `refreshInstance` 的接口，可以便捷的更新这个 Weex 页面的“顶级”根组件的数据。

最后，每个 Weex 页面在具体工作的时候会更频繁的使用到下面这两个 API

- `sendTasks(id, tasks)`：从 JS Runtime 发送指令到 native 端
- `receiveTasks(id, tasks)`：从 native 端发送指令到 JS Runtime

这其中，`sendTasks` 中的指令会以 native 的功能模块进行分类和标识，比如 DOM 操作 (`dom` 模块)、弹框操作 (`modal` 模块) 等，每个功能模块又提供了多种方法可以调用，一个指令其实就是由指定的功能模块名、方法名以及参数决定的。比如一个 DOM 操作的指令 `sendTasks(id, [{ module: 'dom', method: 'removeElement', args: [elementRef]}])`。

`receiveTasks` 中的指令一共有两种，一种是 `fireEvent`，相应客户端在某个 DOM 元素上触发的事件，比如 `fireEvent(titleElementRef, 'click', eventObject)`；而另一种则是 `callback`，即前面功能模块调用之后产生的回调，比如我们通过 `fetch` 接口向 native 端发送一个 HTTP 请求，并设置了一个回调函数，这个时候，我们会先在 JavaScript 端为这个回调函数生成一个 `callbackId`，比如字符串 `"x"`——其实我们实际上发送给 native 端的是这个 `callbackId`，当请求结束之后，native 需要把请求结果返还给 JS Runtime，为了能够前后对得上，这个回调最终会成为类似 `callback(callbackId, result)` 的格式。

至此，我们就拥有了 7 个主要的接口，来完成 native 和 JS Runtime 之间的通信，同时可以做到多实例之间的隔离。

### 几个特殊处理的地方

篇幅有限，所有问题不能一一展开，这里提几个我们比较有心得的地方

#### 如何避免某个页面大数据量通信阻塞其它页面的通信

绝对的避免和杜绝是很难的，我们通过以下集中方式尝试缓解和回避这种现象出现，部分想法还在论证当中：

1. 持续优化 JS 代码的算法实现，这个是肯定要做的。
2. 如果一个页面的内容在运算到一半的时候，用户就关掉了这个页面，尽管不能像关闭一个浏览器标签时那样杀掉这个 JS Runtime，但是可以通过在 `sendTasks` 的时候返回一个特殊的值来提示 JS 代码可以省去后续的计算，让整个 JS 阻塞的状态立即恢复。
3. 部分用户交互可以跳过 JS 执行逻辑直接相应，比如为按钮监听点击事件，并在事件被触发的时候执行 `openURL` 这个打开网址的命令是个很长的链路，但如果我们支持 `<a href>` 这样的标签，用户点击链接的时候，页面可以不经过 JS 运算直接跳走，这样回避了 JS 阻塞带来的问题。
4. 通过用户体验上的一些技巧尽量回避界面一直无相应致使用户一直等待的体验，比如通过伪类规则让用户点击一个按钮的时候第一时间感受到“hover”效果等。
5. 可以考虑“双核” JS Runtime，永远有一个闲置的随时等待打开新页面的 JS Runtime，这样在页面切换的时候，新页面的加载和运算不会被旧页面阻塞。当然这样做存在对架构和资源的挑战。

更多的思路和想法等待大家的挖掘和探讨。

#### 安全、隐私和稳定性

其实现在在 Weex 页面里，不经过声明给一个变量赋值还是会产生全局环境的污染，我们短期只能通过宣导的方式，教育开发者避免使用全局变量——这在传统的 HTML5 和 JavaScript 开发中都是特别不推荐的做法。

长期来看，我们可以提供一些发布前的语法检测工具，帮助开发者更好的驾驭自己的代码。

从隐私性的角度，如果你的客户端是多个团队共同研发的，相互之间希望不被打扰，我们也可以考虑引入浏览器中比较广泛实践的“同源策略”，根据 JS Bundle URL 的域名区分对待。

#### 更高更复杂的课题：支持多个 Framework 共存

让 Weex 能够支持多种 Framework 共存，既是满足多方业务团队不同技术栈和需求的一个重要决定，同时也是尊重前端社区固有的开放自由的精神，更是让 Weex 在快速更迭的前端技术栈中立于不败之地的基础。

早期的 Weex 是重度依赖我们自身研发的 JS Framework 的，它基于 Vue 1.x 的数据监听机制，配合 Weex virtual-DOM APIs 进行数据绑定，并沿用了 mustache 的经典模板语法。现如今，Vue 2.0 迎来了很多颠覆式的革新和改进、React 也被越来越多的工程师所接受，Angular、Zepto/jQuery、VanillaJS 也都有众多的前端开发者在使用。所以我们在支持 native 端多实例指令分发的同时，也支持了多 JS Framework 本地部署并相互隔离，可以支持不同的 Weex 页面基于各自的 JS Framework 开发运行。

首先我们约定，每个 Weex 页面的 JS Bundle 第一行需要出现一行特殊格式的注释，比如：

``` js
// { "framework": "Vue" }
...
...
...
```

它能够识别当前 Weex 页面所对应的 JS Framework，比如这个例子是需要 Vue 来解析的。如果没有识别出合法的注释，则被认为对应到默认的 Weex JS Framework。

然后把每个 Weex 页面及其对应的 JS Framework 名称的关联关系记录下来。

最后把上面提到的 JS 和 native 通信的 `createInstance`, `refreshInstance`, `destroyInstance`, `sendTasks`, `receiveTasks` 等接口在每个 JS Framework 中都封装一遍，然后每次这些全局方法被调用的时候，JS 都可以根据记录下来的页面和 JS Framework 的对应关系找到相应的 JS Framework 封装的方法，并完成调用。

这样每个 JS Framework，只要：1\. 封装了这几个接口，2\. 给自己的 JS Bundle 第一行写好特殊格式的注释，Weex 就可以正常的运行基于各种 JS Framework 的 页面了。

### 总结

这篇文章主要介绍了 Weex 在 JS Runtime 这个环节的一些现状，以及它的来龙去脉，同时介绍了一些心得经验和特别的地方。篇幅有限，有些东西描述的还是比较简略，感兴趣的同学可以移步我们的 github 了解更多细节，同时欢迎大家一起参与到我们的开源项目建设当中来！

谢谢
