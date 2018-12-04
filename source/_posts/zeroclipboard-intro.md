---
title: 'ZeroClipboard 学习笔记'
date: 2012/07/29 04:41:20
updated: 2012/08/20 10:45:48
tags:
- ZeroClipboard
---

如题，周末抽空学习了一下。

[ZeroClipboard](https://github.com/jonrohan/ZeroClipboard/)是在桌面电脑的浏览器上，通过flash技术实现“复制到剪切板”功能的一个程序。它的好处是可以兼容所有浏览器，完成剪切板的操作。

我们在使用的时候主要就用到两个文件：一个是js文件`ZeroClipboard.js`，用来引用在网页中；另一个则是swf文件`ZeroClipboard.swf`，它无需我们在代码里引用，而是被之前的那个`ZeroClipboard.js`二次调用的。

ZeroClipboard的工作原理大概是，在网页的“复制”按钮上层遮罩一个透明的flash，这个flash在被点击之后，会调用其的剪切板处理功能，完成对特定文本的复制。这里有几件事需要我们来完成：

1. 创建一个透明的flash
2. 将这个flash浮在按钮上层
3. 确定要复制的文本是什么
4. 监听这个透明flash的鼠标点击事件
5. 该flash被点击之后，完成剪切板处理

对于这几件事，ZeroClipboard分别提供了不同的api，来完成整个需求。

<!--more-->

### 创建flash

创建的过程其实就是一个`var clip = new ZeroClipboard.Client()`的过程，这时`ZeroClipboard.swf`会被载入。值得注意的时，这里的swf文件默认需要放在和网页相同的目录下，且文件名固定。如果我们需要移动这个swf文件的位置或改名，则需要在创建swf文件之前运行：

    ZeroClipboard.setMoviePath( 'http://YOURSERVER/path/ZeroClipboard.swf' );
    或
    ZeroClipboard.setMoviePath( './src/ZeroClipboard.swf' );

里面的参数可以是相对地址也可以是绝对地址。

### 将透明flash浮在按钮上层

这里有一个很有趣的英文单词：__glue__。我们可以通过下面这个api，将flash和按钮重叠，且浮在按钮之上：

    clip.glue( 'clip-button-id' );
    或
    clip.glue( document.getElementById('clip-button-id' ));

即第一个参数为id或dom对象都可以。如果按钮在网页运行中位置发生了变化，flash是不会自动调整位置的，为此我们提供了另一个api可以手动更新flash的位置：

    clip.reposition();

#### flash的相对浮动

这里还提供了一种更巧妙的方式：如果按钮的上层有任何`position:relative`的块状元素，比如div，而按钮和这个块状元素的位置又是相对固定的，那么可以在调用`glue`函数时，将这个div的id作为第二个参数传进去，不过同时`reposition`这个api就失效了。比如：

    clip.glue( 'clip-button-id', 'clip-container-id' );

### 设置要复制的文本

这一步很简单：

    clip.setText('要复制的文本在这里');

### 监听事件

通过addEventListener进行事件绑定，可以绑定的事件有以下几个：

* `onload`：flash文件加载成功
* `onmousedown`：鼠标在flash上按下
* `onmouseup`：鼠标在flash上释放
* `onmouseover`：鼠标经过flash
* `onmouseout`：鼠标移开flash
* `oncomplete`：剪切板操作完成 (用鼠标点击该flash浮层的时候会触发事件复制到剪切板)

### 剪切板操作完成之后可以通过api销毁flash

    clip.destroy();

[DEMO](http://bowser.effectgames.com/%7Ejhuckaby/zeroclipboard/)  
[更多细节和高阶操作的介绍](https://github.com/jonrohan/ZeroClipboard/blob/master/docs/instructions.md)