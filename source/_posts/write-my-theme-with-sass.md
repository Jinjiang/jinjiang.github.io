---
title: '用Sass重新整理自己的博客主题样式'
date: 2013/06/05 02:23:10
updated: 2013/06/11 10:04:34
tags:
- sass
---

![Sass](http://sass-lang.com/images/sass.gif)

远远关注[Sass](http://sass-lang.com)很久了，今天终于鼓起勇气写了[我的第一个Sass文件](http://jiongks.sinaapp.com/usr/themes/iambig-3d/style.sass)

### Sass简介

一种CSS的预处理程序，基于Ruby运行。安装过程和相关的准备工作非常简单：

0. 当然首先要安装[Ruby](http://www.ruby-lang.org/)
1. `gem install ruby`，必要的环境下需要在命令前加上`sudo`
2. 进入我的博客主题文件夹，运行`sass-convert style.css style.sass`，把我的css文件先转换成sass文件
3. 运行`sass --watch style.sass:style.css`，使得程序自动把`style.sass`文件接下来的任何改动自动同步转换到`style.css`

这时，新的Sass文件就创建完毕了！^_^ 去碎觉……

呵呵，开个玩笑。其实这样的Sass文件虽然格式上没有任何问题，但和直接撰写CSS几乎没区别。而Sass除了可以让我们少写几个花括号和分号之外，其实还有很多实用的特性是我们真正需要的。

无论如何，现在的这个Sass文件是一个整理的基础，接下来，我们就来一步一步整理这个文件，同时也一步一步熟悉Sass的特性。

<!--more-->

### Variables: 变量与计算

我把CSS文件中通用的字体、颜色等等属性值归纳了出来，并找到其中的相关性，比如文本框的边框颜色始终比链接的文字颜色亮一些，即：

    a {
      color: #0c0;
    }
    
    input:not([type]),
    input[type="text"],
    input[type="password"] {
      border: 2px lime solid;
    }

在Sass中将其改写为：

    $color-link: #0c0
    
    a
      color: $color-link
    
    input:not([type]),
    input[type="text"],
    input[type="password"]
      border: 2px lighten($color-link, 10%) solid

即可，输出的结果不变。

### Nesting：选择器嵌套

把嵌套着的选择器添加不同的缩进，同时把重复表达的外层选择器去掉。如：

    h2 {
      margin: 0.75em 0;
      padding: 0.25em 0.5em;
      background-color: rgba(0, 204, 0, 0.4);
      color: #339933;
    }
    
    h2 strong {
      color: white;
    }
    
    h2 a {
      color: #009900;
    }
    
    h2 a:hover {
      background: yellow;
      color: black;
    }

可以转换为：

    h2
      margin: 0.75em 0
      padding: 0.25em 0.5em
      background-color: rgba($color-link, 0.4) // 链接颜色，透明度40%
      color: desaturate($color-link, 50%) // 链接颜色，饱和度减少50%
    
      strong
        color: white
    
      a
        color: darken($color-link, 10%) // 链接颜色，变暗10%
    
        &:hover
          background: $color-mark // 特殊标记的颜色
          color: black

### Mixin：将可重用的CSS属性值混入不同的CSS规则当中

这个特性是我花最多时间整理的，整理过后发现整个文件结构真的清晰很多。

#### 提取出成套的样式

比如我的博客主题中，3D的标题和按钮就是两套集成度重用性都很高的样式，我创建了`@mixin title-3d`和`@mixin button-3d`两个大的属性集合：

    @mixin title-3d
      ...
      &::before,
      &::after
        ...
      ...
    
    @mixin button-3d
      ...
      &::before,
      &::after
        ...
      &:hover::before
        ...
      &:hover::after
        ...
      ...

随后我把这些属性集合应用到了标题和按钮上：

    h2
      @include title-3d
    
    button,
    input[type="button"],
    input[type="submit"],
    .button-3d
      @include button-3d

#### 继续归纳和抽象

整理完上面这两个大的集合之后，我发现，其实3d的标题和按钮样式上其实也有很多想通的地方，于是我进一步抽象出了一些3d模型的通用集合：

    @mixin short-transform
      -webkit-transition: -webkit-transform 0.3s
    
    @mixin transform-origin-0
      -webkit-transform-origin: 50% 50%
    @mixin transform-origin-1
      left: 0
      top: 0
      -webkit-transform-origin: 0% 0%
    @mixin transform-origin-2
      right: 0
      top: 0
      -webkit-transform-origin: 100% 0%
    @mixin transform-origin-3
      right: 0
      bottom: 0
      -webkit-transform-origin: 100% 100%
    @mixin transform-origin-4
      left: 0
      bottom: 0
      -webkit-transform-origin: 0% 100%
    
    @mixin init-3d
      @include short-transform
      @include transform-origin-0
      -webkit-transform-style: preserve-3d
    
    @mixin p-element
      position: absolute
      content: ""

然后到之前的集合把这些通用集合抽象出来：

    @mixin title-3d
      @include init-3d
      ...
    
      &::after,
      &::before
        @include p-element
        @include short-transform
        background-color: lighten($color-text, 30%)
    
      &::before
        height: 100%
        width: $button-3d-height*2
        @include transform-origin-1
        ...
    
      &::after
        height: 100%
        width: $button-3d-height*2
        @include transform-origin-2
        ...

#### 统一封装不同浏览器的CSS前缀

    @mixin box-sizing($sizing: border-box)
      -moz-box-sizing: $sizing
      box-sizing: $sizing
    
    @mixin transform($value...)
      -webkit-transform: $value
      transform: $value
    
    @mixin transform-origin($value)
      -webkit-transform-origin: $value
      transform-origin: $value
    
    @mixin transform-3d($value: preserve-3d)
      -webkit-transform-style: $value
      transform-style: $value
    
    @mixin transform-perspective($value: 350px)
      -webkit-perspective: $value
      perspective: $value
    
    @mixin transition($value...)
      -webkit-transition: $value
      transition: $value
    
    @mixin transition-transform($duration: 0.3s)
      -webkit-transition: -webkit-transform $duration
      transition: transform $duration
    
    ...

### Extend：选择器的继承

其实这个特性和mixin很多时候可以二选一使用，比如这里的`.button-3d`选择器可以不必和`button`、`input[type="button"]`、`input[type="submit"]`写在一起，可以写成：

    .button-3d
      ...
    
    button,
    input[type="button"],
    input[type="submit"]
      @extend .button-3d

不过我这里这样写的必要性不太大，所以就没有实际的例子可以分享了。

### 结语

最终[我的第一个Sass文件](http://jiongks.sinaapp.com/usr/themes/iambig-3d/style.sass)就这样整理完毕了。(p.s.当然这个文件未来可能还是会有改动，届时可能会和本篇文章描述的内容不符)

经过上面这几轮代码的整理，这个Sass文件才真的很Sass了。回顾这次整理的过程，先后用到了变量、运算、嵌套、重用属性等Sass的特性，简单明了，而且`sass --watch`命令、`sass-convert`命令可以方便的对文件进行监听和格式转换。我几乎在感觉不到学习成本的情况下提高了开发效率。这里也推荐大家试试看。