---
title: 'vue-mark-display：用 markdown 语法轻松撰写幻灯片'
date: 2019-04-04 23:21:27
tags:
---

为大家介绍一个刚刚开源，但其实自己已经使用超过 5 年的小工具：`vue-mark-display`。你可以用它把 [markdown](https://commonmark.org/help/) 格式的文本转换成幻灯片并在浏览器中播放和控制。

### 开发背景

我自己工作中经常需要准备各式各样的幻灯片，所以逐渐觉得用 PowerPoint 或 Keynote 来做幻灯演示略微显得有些笨重。这体现在板式和样式设计、文件大小、打开、编辑和播放的方式等很多方面。加上我从事的就是前端开发的工作，对语义化的信息格式非常敏感，深刻的认为，那些你表面上想编辑的“样式”其实是信息的“类型”+“配套的样式”罢了。所以决定用 markdown 外加自己扩展的一些小功能，来撰写幻灯片，并研发了相应的工具，也就是最近开源的 `vue-mark-display`。

最早这个工具是用 vue v0.10 写的，当时源代码里还有像 `v-attr`, `v-repeat`, `v-transition` 这样的“古董级”语法，而且还在依赖 Zepto。最近准备开源这个项目的时候，我也基于最新的前端知识和技能进行了重构。所以大家看到的是比较新的版本。

其实在此之前，我也写过很多类似的小工具了，但都没有坚持使用很久，这次开源的 `vue-mark-display` 我差不多持续使用了 5 年。经历了差不多这 5 年时间，准备过了无数的幻灯片和公开演讲，我想说基于 markdown 以及这些小功能撰写幻灯片真的很酷。如果你也有兴趣试一试用 markdown 为主体来撰写自己的幻灯片，那么不妨了解并体验一下 `vue-mark-display`。

__另外，事实上，如果只是像使用它，你是不需要学习任何关于 Vue 的知识的__ —— __文章最后会提供一个不需要 Vue 知识的开箱即用的办法__ —— 所以它也对 React、Angular 等社区的同学友好 —— 只要你会写 markdown 和简单的 HTML5 代码，你就可以使用 `vue-mark-display` 制作出非常精美的幻灯片。

<!-- more -->

### 基本语法

首先，我们在 markdown 语法的基础上做了一个扩展：通过 `----` 分割线把一整篇 markdown 文档划分成为若干张幻灯片。

``` md
# 这里是第一页

以及一些基本的自我介绍

----

### 这里是第二页

- 这里有内容
- 这里有内容
- 这里有内容

----

没了，讲完了

__谢谢__
```

例如上面的例子就会被生成为三张幻灯片。

<iframe src="https://codesandbox.io/embed/moxv1k071y?fontsize=14&module=%2Fsrc%2FApp.vue" title="Vue Mark Display Demo 1" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

这样你就可以利用 markdown 支持的 h1 - h6 标题、列表、表格、图片、链接、加粗等格式加分页符用极快的速度写出幻灯片了。

通常情况下，你再为自己的幻灯片设置一套全局的 CSS 样式并固化下来成为你的样式风格，基本就可以拿来演示了。以下是我自己喜欢的样式风格：

<iframe src="https://codesandbox.io/embed/61jorw0703?fontsize=14&module=%2Fsrc%2FApp.vue" title="Vue Mark Display Demo 2" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

#### 自定义样式

在这个基础上，我们对 markdown 格式做了一点点进一步的扩展 —— 通过在每一页幻灯片开头撰写 html 注释来设置这页幻灯片的特殊样式。

比如我们为第二页幻灯片换一个不一样的背景，同时正文文字颜色变成白色：

``` md
# 这里是第一页

以及一些基本的自我介绍

----

<!-- style: background: #4fc08d; color: white; -->

### 这里是第二页

- 这里有内容
- 这里有内容
- 这里有内容

----

没了，讲完了

__谢谢__
```

现在翻到第二页看看，背景和文字的颜色就已经改变了

<iframe src="https://codesandbox.io/embed/n734wvx92m?fontsize=14&module=%2Fsrc%2FApp.vue" title="Vue Mark Display Demo 3" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

当然在 markdown 中你也可以撰写任意 HTML5 代码，比如潜入一端 HTML 甚至全局有效的 `<style>` 标签，都可以被解析：

``` md
# 这里是第一页

以及一些基本的自我介绍

<div class="notification">Welcome!</div>

----

<!-- style: background: #4fc08d; color: white; -->

### 这里是第二页

- 这里有内容
- 这里有内容
- 这里有内容

----

没了，讲完了

<div class="notification">Thanks!</div>

<style>
.notification {
  position: absolute;
  top: 20px;
  right: 20px;
  border-radius: 3px;
  padding: 0.25em 1em;
  background-color: yellow;
  color: #666;
}
</style>
```

<iframe src="https://codesandbox.io/embed/1z941rj65l?fontsize=14&module=%2Fsrc%2FApp.vue" title="Vue Mark Display Demo 4" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

#### 其它自定义选项

`vue-mark-display` 还提供了一些方便的 prop 配置项和 event 组件事件，如：

- `@setTitle({ title })` 方便从组件外部获取当前幻灯片的主标题，也就是第一页幻灯片的第一行文字，你可以用这个事件来设置 `document.title`
- `autoFontSize` 根据屏幕大小自动调节默认字号，这个字号是根据自己的演示经验设置的。保证不论屏幕大小，一页幻灯片可以放下的字数是相对稳定的，这样就基本杜绝了因为演示现场屏幕分辨率不一致而导致的适配问题。当然你如果对这个默认的适配结果不满意，也可以自己手动设置组件的 `font-size` 样式。
- `supportPreview` 可以在点击链接的时候，按住键盘上的 <kbd>Alt</kbd> 键，这样链接会从当前屏幕的一个 `<iframe>` 打开，并悬浮在屏幕上方，同时右上角有个关闭按钮可以将其关掉。如果你希望整个幻灯演示过程不被中途访问链接而打断，相信这个功能你会非常喜欢。
- 还有一些选项包括：`urlHashCtrl` 能自动把当前页码和网页的 URL hash 对应、`keyboardCtrl` 可以支持默认键盘左右键翻页、`autoBlankTarget` 所有链接都默认在新标签打开、`baseUrl` 能将链接和图片的相对路径改成你自己的网站等。

同时 `vue-mark-display` 还可以方面得利用第三方手势库支持触摸屏的左右滑动翻页。

上述比较完整的用例可以看这里：

<iframe src="https://codesandbox.io/embed/300xq1mlkp?fontsize=14&module=%2Fsrc%2FApp.vue" title="Vue Mark Display Demo 5" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

### One More Thing

`vue-mark-display` 还支持直接导出成为 PDF 格式文件。因为我们的幻灯片有可能通过各式各样的方式进行传播：有可能是一个链接，也可能是一个文件。所以 `vue-mark-display` 利用 W3C 的 CSS Page Media 相关规范满足了这一需求，你只需要简单的打开浏览器的打印对话框，然后选择导出成为 PDF，就可以轻松的把自己的幻灯片发到钉钉好友、微信群、邮件附件等各个地方。

![](https://github.com/Jinjiang/vue-mark-display/raw/master/pdf.png)

### 最后想说 `vue-mark-display` 已经开源了

欢迎大家试用并提出宝贵的意见，如能一同参与建设和维护，我会更加感激。

- Homepage: https://jinjiang.github.io/vue-mark-display/
- GitHub：https://github.com/jinjiang/vue-mark-display
- npm: https://www.npmjs.com/package/vue-mark-display

同时我也把自己最近在社区分享过的幻灯片全部整理到了这个地址：

https://jinjiang.github.io/slides/

接下里这个项目还有一些规划中的特性会逐步实现并发布，尽请关注。

## 最后的最后

__如果你不想学 Vue，希望开箱即用，直接把 markdown 导出成在线幻灯片：__

来用 `mark2slides` 吧，一键导出！

https://www.npmjs.com/package/mark2slides

用法：

``` bash
npm install --global md2slides
m2s my-slides.md
```

然后去 `dist` 目录开启一个 web server：

``` bash
cd dist
npx serve
```

打开 `http://localhost:5000/`，完毕。

不过这个工具非常初期，还请大家多多提意见，接下来我也会逐步为这个工具增加更多贴心的功能。
