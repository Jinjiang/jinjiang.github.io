---
title: '巧用 RequireJS Optimizer 给传统的前端项目打包'
date: 2013/03/30 02:46:47
updated: 2013/03/30 03:15:15
---

[r.js](https://github.com/jrburke/r.js) 本是 [RequireJS](http://requirejs.org/) 的一个附属产品，支持在 NodeJS、Rhino 等环境下运行 [AMD](http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition) 程序，并且其包含了一个名为 RequireJS Optimizer 的工具，可以为项目完成合并脚本等优化操作。

r.js 的介绍中明确写道它是 RequireJS 项目的一部分，和 RequireJS 协同工作。但我发现，RequireJS Optimizer 提供了丰富的配置参数，可以让我们完全跳出 AMD 和 RequireJS 程序的束缚，为我们的前端程序服务。

<!--more-->

### RequireJS Optimizer 常规用法

首先，简单介绍一下 RequireJS Optimizer 的“正派”用法 (以 NodeJS 环境为例)：

事先写好一个配置文件，比如 `config.js`，它是 JSON 格式的，常用属性有：

    {
        // 程序的根路径
        appDir: "some/path/trunk",
        // 脚本的根路径
        // 相对于程序的根路径
        baseUrl: "./js",
        // 打包输出到的路径
        dir: "../some/path/release",
        // 需要打包合并的js模块，数组形式，可以有多个
        // name 以 baseUrl 为相对路径，无需写 .js 后缀
        // 比如 main 依赖 a 和 b，a 又依赖 c，则 {name: 'main'} 会把 c.js a.js b.js main.js 合并成一个 main.js
        modules: [
            {name: 'main'}
            ...
        ]
        // 通过正则以文件名排除文件/文件夹
        // 比如当前的正则表示排除 .svn、.git 这类的隐藏文件
        fileExclusionRegExp: /^\./
    }

然后运行：

    node r.js -o config.js

这时 RequireJS Optimizer 就会：

1. 把配置信息的 `modules` 下的所有模块建立好完整的依赖关系，再把相应的文件打包合并到 `dir` 目录
2. 把所有的 `css` 文件中，使用 `@import` 语法的文件自动打包合并到 `dir` 目录
3. 把其它文件复制到 `dir` 目录，比如图片、附件等等

我已经把 RequireJS 和 r.js 整套东西用到了 [H5Slides](http://github.com/jinjiang/h5slides/) 上。觉得蛮方便的。

不过工作中的前端开发工作并不是绝对理想化的，有些旧的项目，并不是 AMD 的模块化开发方式，而是传统的 js 程序，开发一个页面时可能需要一口气引入三到五个 css 文件、十来个 js 文件…… 上线的时候为了减少流量及 HTTP 请求数又需要把代码尽可能重用和合并。这个时候就需要一个方便快捷的打包工具帮助我们了，下面就介绍一下 RequireJS Optimizer 是如何完成这项工作的。

### 用到的几个关键参数

说到这里，必须要额外介绍几个 RequireJS Optimizer 的参数了：

#### modules[i].include

    modules: [
        {
            name: "main",
            include: ["d", "e"]
        }
    ]

这里的 include 字段提供了“强制建立依赖关系”的功能，也就是说，即使在 main.js 的代码里没有依赖 d.js 和 e.js，它们也会在合并代码的时候插入到 main.js 的前面

#### skipModuleInsertion

在介绍这个参数之前需要说明的是，RequireJS Optimizer 有一个很智能的功能，就是为没有写明 define(...) 函数的模块代码自动将其放入 define(...) 之中。如果我们写明：

    skipModuleInsertion: true

则这种处理将会被取消。

#### onBuildRead

这个参数可以定义一个函数，在处理每个 js 文件之前，会先对文件的文本内容进行预处理。比如下面这个例子里，我会把 main.js 里的代码全部清除：

    onBuildRead: function (moduleName, path, contents) {
        if (moduleName === 'main') {
            contents = '/* empty code */';
        }
        return contents;
    }

### 巧妙应用到传统项目

这时，我们的资源已经足够了。比如我现在的项目有：

__1 个 html__

* index.html

代码：

    <!doctype html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>Index</title>
            <link rel="stylesheet" href="css/a.css">
            <link rel="stylesheet" href="css/b.css">
        </head>
        <body>
    
            ...
    
            <script src="js/a.js"></script>
            <script src="js/b.js"></script>
            <script src="js/c.js"></script>
        </body>
    </html>

__2 个 css__

* css/a.css
* css/b.css

__3 个 js__

* js/a.js
* js/b.js
* js/c.js

__1 个图片文件夹__

* images

#### 合并 css 文件

新建一个 css 文件，叫 css/main.css，内容为：


    @import url(a.css);
    @import url(b.css);

然后把 index.html 中的 2 个 &lt;link&gt; 标签改成一个

    <link rel="stylesheet" href="css/main.css">

#### 合并 js 文件

合并 js 文件的步骤略复杂些。首先也是新建一个 js 文件，叫 js/main.js：

    document.write('<script src="js/a.js"></script>');
    document.write('<script src="js/b.js"></script>');
    document.write('<script src="js/c.js"></script>');

然后把 index.html 中的 3 个 &lt;script&gt; 标签改成一个

    <script src="js/main.js"></script>

接下来就是配置打包工具的时间了。

#### 禁止自动补齐 define(...) 的头尾

    skipModuleInsertion: true

#### 强制建立依赖

    modules: [{name: 'main', include: ['a', 'b', 'c']}]

这样打包出来的 main.js 是这样的：

    // code from a.js
    // code from b.js
    // code from c.js
    document.write('<script src="js/a.js"></script>');
    document.write('<script src="js/b.js"></script>');
    document.write('<script src="js/c.js"></script>');

#### 打包时去掉多余的 js/main.js 的代码

    onBuildRead: function (moduleName, path, contents) {
        if (moduleName === 'main') {
            contents = '/* empty code */';
        }
        return contents;
    }

这样的话，打包工具就会把 `document.write(...)` 的代码去掉，得到干净的

    // code from a.js
    // code from b.js
    // code from c.js
    /* empty code */

运行 `node r.js -o config.js` 就可以得到一个打包成功的项目了，并且打包前后的代码都可以正常运行

附件是这个项目例子的源代码：[project.zip](http://jiongks-typecho.stor.sinaapp.com/usr/uploads/2013/03/1894338901.zip)