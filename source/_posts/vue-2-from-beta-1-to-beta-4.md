---
title: '【整理】Vue 2.0 自 beta 1 到 beta 4 以来的主要更新'
date: 2016/07/28 05:33:05
updated: 2017/08/01 03:01:40
tags:
- vue
---

主要内容来自 [https://github.com/vuejs/vue/releases](https://github.com/vuejs/vue/releases)

之前 [Vue 2.0 发布技术预览版](http://jiongks.name/blog/announcing-vue-2/) 到现在差不多三个月了，之前写过一篇简单的 [code review](http://jiongks.name/blog/code-review-for-vue-next/)，如今三个月过去了，Vue 2.0 在这个[基础](http://jiongks.name/blog/a-big-map-to-intro-vue-next/)之上又带来了不少更新，这里汇总 beta 以来 (最新的版本是 beta 4) 的主要更新，大家随意学习感受一下

### alpha 和 beta 版本的侧重点会有所不同

首先 Vue 2.0 对 alpha、beta 有自己的理解和设定：alpha 版本旨在完善 API、考虑所需的特性；而来到 beta 版则会对未来的正式发布进行充分的“消化”，比如提前进行一些必要的 breaking change，增强框架的稳定性、完善文档和周边工具 (如 vue-router 2.0 等)

### 最后的几个 alpha 版本主要更新

Vue 本身的语法基础这里就不多赘述了，网上有很多资料可以查阅，我们已经假定你比较熟悉 Vue 并对 2.0 的理念和技术预览版的状态有一定的了解。

<!--more-->

#### alpha 5

1. ref 的写法由 `<comp v-ref:foo>` 变成了 `<comp ref="foo">`，更加简单，同时动态数据的写法是 `<comp :ref="x">`
2. 支持 functional components，这个特性蛮酷的，可以把一个组件的生成过程完全变成一个高度自定义的函数执行过程，比如：

    Vue.component('name', {
        functional: true,
        props: ['x'],
        render: (h, props, children) {
            return h(props.tag, null, children)
        }
    })

你可以在 `render()` 函数里写各种特殊的逻辑，这样标签的含义和能力都得到了非常大的扩展，在后续的几次更新中，你马上会感受到一些 functional components 的威力

另外剧透一下，`h` 方法里的第二个参数如果是 `null` 就可以省略，这个改动出现在了 beta 1

#### alpha 6

可以设置特殊的 keyCode，比如 `Vue.config.keyCodes.a = 65`，然后你就可以写 `<input @keyup.a="aPressed">` 了

#### alpha7

1. 一个组件的生命周期名由 `init` 改成了 `beforeCreated` (大家可以在 Vuex 的源码里看到对应的改变哦)
2. `Vue.transition` 的 hook 支持第二个参数，把 vm 传递进去

如：

    Vue.transition('name', {
        onEnter (el, vm) {
            ...
        }
    })

### Beta 1 ~ Beta 4

#### beta 1

1. 自定义 directive 里 `update` 的触发时机发生了变化，由于 functional component 等概念的引入，一个 directive 的变更的颗粒度也不完全是 directive 本身引起的，所以这里做了一个更具有通用性的调整；同时 hook 名 `postupdate` 也相应的更名为 `componentUpdated`——如果你想让 `update` 保持原有的触发时机，可以加入一句 `binding.value !== binding.oldValue` 即可。
2. `Vue.traisition` 的 hook 名做了简化
    * `onEnter` -> `enter`
    * `onLeave` -> `leave`
3. server-side rendering
    * `server.getCacheKey` 更名为 `serverCacheKey`，避免多一层结构嵌套
    * `createRenderer`/`createBundleRenderer` 方法不会强制应用 `lru-cache`，而是开发者手动选择

#### beta 2

`<transition>` 标签来了！

其实这个玩意儿我之前在 polymer 等其他框架里也见到过，不过看到 Vue 的语法设计，还是觉得巧妙而简洁：


    <transition>
        <div v-if="...">...</div>
    </traisition>

    <transition-group tag="ul">
        <li v-for="...">...</li>
    </traisition-group>

更牛掰的在这里，还记得 functional components 吧，你今天可以这样抽象一个动画效果的标签：

    Vue.component('fade', {
        functional: true,
        render (h, children) {
            return h('transition', {
                props: {...},
                on: {
                    beforeEnter,
                    afterEnter
                }
            }, children)
        }
    })

然后

    <fade>...</fade>

就可以实现高度自定义的动画效果了，这个我个人觉得是非常赞的设计和实现！

#### beta 3

1. 支持在自定义组件中使用原生事件。因为在 Vue 2.0 的设计中，自定义组件上是不能绑定原生事件的，自定义组件上的事件绑定被默认理解为组件的自定义事件，而不是原生事件。针对这个问题我很早就提了 [issue](https://github.com/vuejs/vue/issues/2942) 当时小右提出了一个新的语法设计，就是 `<comp @click.native="..."></comp>`，beta 3 的时候终于看到它被实现了，嘿嘿，有点小激动
2. 支持两种语法 `<div :xxx.prop="x">` 和 `<div v-bind:prop="{ xxx: x }">` 来对 DOM 的 property 进行绑定，最近我自己也在思考一些在 virtual-DOM 上支持 properties 而不只是 attributes 的想法，这个设计让我也多了一些新的思路。

#### beta 4

2 天前发布的，其实这个版本以 bugfix 为主

### 总结

以上是近期 Vue 2.0 的一些更新，让我自己比较兴奋的主要是 functional component 以及基于这个设计的 `<transition>` 和 `<transition-group>` 标签和自定义 transition 标签的能力拓展，还有就是久违的 `<comp @click.native="..."></comp>`

最后希望大家可以多多试用，有更大兴趣的可以多多学习 Vue 的源码！