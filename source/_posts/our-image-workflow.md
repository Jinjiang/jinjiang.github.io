---
title: '手机淘宝前端的图片相关工作流程梳理'
date: 2015/08/10 04:15:46
updated: 2015/08/10 04:22:08
tags:
- css
- image
---

本文首发自[阿里无线前端博客](https://github.com/amfe/article/issues/8)

_注：本文摘自阿里内网的无线前端博客《无线前端的图片相关工作流程梳理》。其实是一个月前写的，鉴于团队在[中国第二届 CSS Conf](http://css.w3ctech.com/) 上做了《手机淘宝 CSS 实践启示录》的分享，而图片工作流程梳理是其中的一个子话题，故在此一并分享出来，希望仍可以给大家一些经验和启发。另外，考虑到这是一篇公开分享，原版内容有部分删节和调整，里面有一些经验和产出是和我们的工作环境相关的，不完全具有普遍性，还请见谅。_

今天很荣幸的跟大家分享一件事情，就是经过差不多半年多的努力，尤其是最近 2 周的“突击扫尾”，无线前端团队又在工具流程方面有了一个不小的突破：我们暂且称其为“图片工作流”梳理。

### 图片！图片！图片！

要说最近 1 年里，无线前端开发的一线同学最“难搞”的几件事，图片处理绝对可以排在前三。

- 首先，我们首先要从视觉稿 (绝大部分出自 photoshop) 里把图片合理的分解、测量、切割、导出——俗称“切图”
- 然后，我们要把切好的图放入页面代码中，完成相关的本地调试
- 第三步，把本地图片通过一个内部网站 (名叫 TPS) 上传到我们的图片 CDN 上，并复制图片的 CDN 地址，把本地调试用的相对路径替换掉
- 第四步，不同的图片、不同的外部环境下 (比如 3g 还是 wifi)，我们需要给图片不一样的尺寸、画质展现，并有一系列的配置需要遵循
- 如果视觉稿有更改 (不要小看这件事，微观上还是很频繁的哦)，不好意思，从第一步开始再重新走一遍……

这里面“难搞”在哪些地方呢？我们逐一分析一下：

1. “切图”的效率并不高，而且每一步都很容易出现返工或再沟通
2. 打开 TPS 网站上传图片放到前端开发流程中并不是一个连贯流畅的步骤，而且 GUI 相比于命令行工具的缺陷在于无法和其它工具更好的集成
3. 替换 CDN 图片路径的工作机械而繁琐，并且代码中替换后的图片地址失去了原本的可读性，非常容易造成后期的维护困惑甚至混乱
4. 适配工作异常繁杂和辛苦，也很容易漏掉其中的某个环节
5. 视觉变更的成本高，web 的快速响应的特点在丧失

所以可能把这些东西画成一张图表的话：

![](http://img2.tbcdn.cn/L1/461/1/58a8b4f12816b6f71918c31ee5a0ceae74f40fb9)

### 团队的单点突破

在最近半年的一段时间里，无线前端团队先后发起了下面几项工作，从某个点上尝试解决这些问题：

<!--more-->

#### lib.flexible

首先，我们和 UED 团队共同协商约定了一套 REM 方案 (后更名为 flexible 方案，进而演进为 lib.flexible 库)，通过对视觉稿的产出格式的约定，从工作流程的源头把控质量，同时在技术上产出了配套的 [lib.flexible](https://github.com/amfe/lib-flexible/) 库，可以“抹平”不同设备屏幕的尺寸差异，同时对清晰度进行了智能判断。这部分工作前端的部分是 @wintercn 寒老师和 @terrykingcha 共同创建的。

![](http://img4.tbcdn.cn/L1/461/1/bd051f9dbea5cf39a1b087f552181ce509ca5c7f)

#### 视觉稿辅助工具普及

其次，我们于去年 12 月开始启动了一个“视觉稿工具效率提升”的开放课题，由团队的 @songsiqi 负责牵头，我们从课题的一开始就确立了 KPI 和 roadmap，经过一段时间的调研和落实，收罗了很多实用的辅助工具帮助我们提升效率，同时布道给了整个团队。比如 [cutterman](http://www.cutterman.cn/)、[parker](http://www.cutterman.cn/parker)、[Size Marks](https://github.com/romashamin/Size-Marks-PS) 等

#### img-uploader

在 @hongru 去年主持完成的一系列 One-Request 前端工具集当中，有一个很有意义的名叫 `or-uploadimg` 的图片上传工具。它把 TPS 的图片上传服务命令化了。这给我们对图片上传工作批量化、集成化提供了一个非常重要的基础！这个工具同时也和淘宝网前端团队的另一个 TPS 图片上传工具有异曲同工之妙。大概用法是这样的，大家可以感受一下：

    var uploader = require('@ali/or-uploadimg');

    // 上传 glob 多张图
    uploader('./**/*.jpg', function (list) {
        console.log(list)
    });
    // 上传多张
    uploader(['./1.jpg', './3d-base.jpg'], function (list1, list2) {
        console.log(list1, list2);
    })

    // 上传单张
    uploader('./3d-base.jpg', function (list1) {
        console.log(list1)
    })

随后团队又出现了这一工具的 [gulp](http://gulpjs.com) 插件，可以对图片上传的工作流程做一个简单的集成，具体集成方式是分析网页的 html/css 代码，找到其中的相对图片地址并上传+替换 CDN URL。

    var gulp = require('gulp');
    var imgex = require('@ali/gulp-imgex');

    gulp.task('imgex', function() {
        gulp.src(['./*.html'])
            .pipe(imgex())
            .pipe(gulp.dest('./'));

        gulp.src('./css/*.css')
            .pipe(imgex({
                base64Limit: 8000, // base64化的图片size上限，小于这个size会直接base64化，否则上传cdn
                uploadDest: 'tps' // 或者 `mt`
            }))
            .pipe(gulp.dest('./css'));
    });

#### lib.img

`lib.img` 是团队 @chenerlang666 主持开发的一个基础库，它是一套图片自动处理优化方案。可以同时解决屏幕尺寸判断、清晰度判断、网络环境判断、域名收敛、尺寸后缀计算、画质后缀计算、锐化度后缀计算、懒加载等一系列图片和性能相关的问题。这个库的意义和实用性都非常之高，并且始终保持着快速的业务响应和迭代周期，也算是无线前端团队的一个明星作品，也报送了当年度的无线技术金码奖。

![](http://img1.tbcdn.cn/L1/461/1/b98433bdbbf29c3682b169bd3f004a22fc5935d1)

#### px2rem

[px2rem](https://www.npmjs.com/package/px2rem) 是 @songsiqi 主持开发的另一个小工具，它因 lib.flexible 方案而生，因为我们统一采用 rem 单位来最终记录界面的尺寸，且对于个别1像素边框、文本字号来说，还有特殊的规则作为补充 (详见 lib.flexible 的文档)。

![](http://img4.tbcdn.cn/L1/461/1/b78ccf6e3f3332e03751e6fbbec1abeec25bee1c)

同样的，它也有 [gulp](https://www.npmjs.com/package/gulp-px2rem) / browser 的各种版本。

#### img4dpr

`img4dpr` 则是一个可以把 CSS 中的 CDN URL 自动转成 3 种 dpr 下不同的尺寸后缀。算是对 lib.img 的一个补充。如果你的图片不是产生在 `<img>` 标签或 JavaScript 中，而是写在了 CSS 文件里，那么即使是 lib.img 恐怕也无能为力，img4dpr 恰恰是在解决这个问题。

![](http://img1.tbcdn.cn/L1/461/1/d0d545549d5a93d5a717ac673c7d54701f0d4066)

### 完事儿了吗？

看上去，团队为团队做了很多事情，每件事情都在单点上有所突破，解决了一定的问题。

但我们并没有为此停止思考

有一个很明显的改进空间在这里：今天我们的前端开发流程是一整套工程链路，每个环节之间都紧密相扣， __解决了单点的问题并不是终点，基于场景而不是功能点的思考方式，才能够把每个环节都流畅的串联起来，才能给前端开发者在业务支持的过程当中提供完美高效畅通无阻的体验——这是我们为之努力的更大的价值！也是我认为真正“临门一脚”的最终价值体现！__

### 基于场景的思维方式

__这种思维方式听上去很玄幻，其实想做到很简单，我们不要单个儿看某个工具好不好用，牛不牛掰，模拟真实工程场景，创建个新项目，从“切图”的第一步连续走到发布的最后一步，看看中间哪里断掉了？哪里衔接的不自然？哪里不完备？哪里重复设计了？哪里可以整合？通常这些问题都会变得一目了然。__

首先，在 Photoshop 中“切图”本身的过程对于后续的开发流程来说是相对独立的，所以这里并没有做更多的融合 _(从另外一个角度看，这里其实有潜在的改造空间，如何让“切图”的工作也能集成到前端工具链路中，这值得我们长期思考)_

然后，从图片导出产生的那一刻起，它所经历的场景大概会是这么几种：

- 放入 `images` 文件夹
  - to HTML
    - src: (upload time) -> set `[src]` -> webpack require -> hash filename (upload time) -> file-loader
    - data-src
      - (upload time) -> set `[data-src]` -> lib.img (auto resize)
  - to JavaScript: element.src, element.style.backgroundImage
      - (upload time) -> set `[data-src]` data
      - (upload time) -> set `[src]` (manually resize)
      - (upload time) -> set `element.style.background` -> lib.img (manually resize)
  - to CSS: background-image
      - (upload time) -> set `background` -> postcss (upload time) -> px2rem, img4dpr

其中 `(upload time)` 指的是我有机会在这个时机把图片上传到 CDN 并把代码里的图片地址替换掉；`(* resize)` 指的是我有机会在这个时机把图片的域名收敛/尺寸/画质/锐化度等需求处理掉。

经过这样一整理，我们很容易发现问题：

1. 图片上传存在很多种可选的时机，并没有形成最佳实践
2. 有些链路完全没有机会做必要的处理 (如 to HTML -> src 的链路无法优化图片地址)
3. 有些链路处理图片的逻辑并不够智能 (比如需要手动确定优化图片选项的链路)
4. 图片上传 CDN 之后必须手动替换掉源代码里的图片路径，这个问题在任何一个链路里都没有得到解决
5. CSS 相关的小工具很多，比较零散，学习和使用的成本在逐步变高变复杂
6. 没有统一完善的项目脚手架，大家创建新项目都需要初始化好多小工具的 gulp 配置 (当然有个土办法就是从就项目里 copy 一份 `package.json` 和一份 `gulpfile.js`)

### 基于场景的“查漏补缺”

![](http://gtms03.alicdn.com/tps/i3/TB1xb2FIpXXXXb7XVXXtkvyUVXX-2048-1536.jpg)

在完善场景的“最后一公里”，我们做了如下的工作：

1. 把所有的 CSS 工具集成到了 postcss，再通过 postcss 的 gulp 插件、webpack 插件、browserify 插件令其未来有机会灵活运用到多种场景而不需要做多种工具链的适配，即：postcss-px2rem、postcss-img4dpr，同时额外的，借此机会引入 postcss-autoprefixer，让团队拜托旧的 webkit 前缀，拥抱标准的写法
2. 把图片上传的时机由最早的 or-imgex-gulp 在最后阶段分析网页的html/css代码上传替换其中的图片，变为在 `images` 目录下约定一个名为 `_cdnurl.json` 的文件，记录图片的 hash 值和线上 CDN 地址，并写了一个 `@ali/gulp-img-uploader` 的 gulp 插件，每次运行的时候会便利 `images` 文件夹中的图片，如果出现新的 hash 值，就自动上传到 CDN，并把相应生成的 CDN URL 写入 `_cdnurl.json`
3. 同时，这个文件可以引入到页面的 JavaScript 环境中，引入到 img4dpr 工具中，引入到 lib.img 的逻辑中，让 HTML/CSS/JavaScript 的各种使用图片的场景都可以访问到 `_cdnurl.json` 中记录的本地图片路径和线上地址的对应关系
4. 这也意味着 lib.img, img4dpr 需要做相应的改动，同时
5. 页面本身要默认把 `_cdnurl.json` 的信息引入以做准备
6. 创建一个 lib.cdnurl 的库，在图片未上传的情况下，返回本地路径，在已经上传的情况下，返回 CDN URL，这样通过这个库作支持，外加 lib.img、img4dpr，开发者可以做到在源代码中完全使用本地路径，源代码的可读性得到了最大程度的保证
7. 基于 adam 创建一个包含全套工具链路的项目模板 (脚手架)

上述几件事我们于上周一做了统一讨论和分工，这里要感谢 @mingelz @songsiqi @chenerlang666 的共同努力！！

#### 夹带私货 (偷笑)

我在这个过程中，融入了之前一段时间集中实践的 [vue 和 webpack 的工程体系](http://jiongks.name/blog/just-vue/)，在 vue 的基础上进行组件化开发，在 webpack 的基础上管理资源打包、集成和发布，最终合并在了最新的 just-vue 的 adam template 里面。

之前不是在文章的最后卖了个“最后一公里”的关子吗，这里介绍的图片工作流改进就是其中的一部分：）

同时，我基于 lib.img 的思路，结合 vue.js 自身的特点，写了一个 `v-src` 的 directive，在做到 lib.img 里 `[data-src]` 相同目的的同时，更好的融入了 vue.js 的体系，同时加入了更高集成度的功能，稍后会再介绍。

__夹带了私货之后是不是我就没法用了？__

最后我想强调的是，除了自己的这些“私货”之外，上面提到的几个改进点和这些个人的内容是完全解耦的，如果你不选择 vue.js 或 webpack 而是别的同类型工具或自己研发的一套工具，它依然可以灵活的融入你的工作流程中。

### 最终效果

我们在团队内部把这些工作流程以脚手架的方式进行了沉淀，并放在了团队内部叫做 `adam` 的 generator 平台上 (后续会有介绍) 取名叫做 `just-vue` (时间仓促，adam 和相关的 generator 未来会在适当的时机开放出来)。大致用法：

安装 adam 和 just-vue 模板：

    tnpm install -g @ali/adam
    adam tmpl add <just-vue git repo>

交互式初始化新项目：

    $ adam

    ? Choose a template: just-vue
    ? Project Name: y
    ? Git User or Project Author: ...
    ? Your email address: ...
    Awesome! Your project is created!
     |--.gitignore
     |--components
     |--|--foo.vue
     |--gulpfile.js
     |--images
     |--|--_cdnurl.json
     |--|--logo.png
     |--|--one.png
     |--|--taobao.jpg
     |--lib
     |--|--lib-cdnurl.js
     |--|--lib-img.js
     |--|--vue-src.js
     |--package.json
     |--README.md
     |--src
     |--|--main.html
     |--|--main.js
     |--|--main.vue

#### 目录结构剖析

然后大家会看到项目目录里默认就有：

- `gulpfile.js`，里面默认写好了图片批量上传并更新 `_cdnurl.json`、webpack 打包、htmlone 合并 等常见任务
- `images` 目录，里面放好了关键的 `_cdnurl.json`，还有几张图片作为示例，它们的 hash 和 CDN URL 已经写好了
- `src/main.*`，主页面入口，包括一个 htmlone 文件 (`main.html`)，一个 webpack 文件 (`main.js`) 和一个 vue 主文件 (`main.vue`)，默认引入了需要的所有样式和脚本，比如 lib.img, lib.flexible, lib.cdnurl, _cdnurl.json, v-src.js 等，我们将来主要的代码都会从 `main.vue` 写起——额外的，我们为 MT 模板开发者贴心的引入了默认的 mock 数据的 `<script data-mt-variable="data">` 标签，不需要 MT 模板开发环境的将其删掉即可
- `components` 目录，这里会把我们拆分下来的子组件都放在这里，我们示范性的放了一个 `foo.vue` 的组件在里面，并默认引入了 lib.cdnurl 库
- `lib` 这里默认放入了 lib.img, lib.cdnurl, v-src.js 几个库，这几个库在未来逐步稳定之后都会通过 tnpm + CommonJS 的方式进行管理，目前团队 tnpm + CommonJS 的组件整合还需要一定时间，这里是个方便调整迭代的临时状态。

然后，我们来看一看 `main.vue` 里的细节，这才是真正让你真切感受到未来开发体验的地方。

#### 图片工作场景

首先，新产生任何图片，尽管丢到 `images` 目录，别忘了起个好理解的文件名

#### CSS 中的图片

然后，在 `main.vue` 的第 11 行看到了一个 CSS 的 background-image 的场景，我们只是把 `url(../images/taobao.jpg)` 设为其背景图片：

    background-image: url(../images/taobao.jpg);

__完成了！就这样！你在发布之前不需要再关注额外的事情了。没有手动上传图片、没有另外的GUI、没有重命名、没有 CDN 地址替换、没有图片地址优化、没有不可读的代码__

#### HTML 中的图片

我们再来看看 HTML 里的图片，来到 39 行：

    <img id="test-img" v-src="../images/one.png" size="cover">

__一个 `[v-src]` 特性搞定！就这样！你在发布之前不需要再关注额外的事情了__ (这里 `[size]` 特性提供了更多的图片地址优化策略，篇幅有限，大家感兴趣可以移步到 `lib/vue-src.js` 看其中的实现原理)。

#### JavaScript 中的图片

最后再看看在 JavaScript 里使用图片，来到 68 行：

    this.$el.style.backgroundImage = 'url(' + cdn('../images/logo.png') + ')'

__只加入了一步 `cdn(...)` 的图片生成，也搞定了！就这样！你在发布之前不需要再关注额外的事情了。__

#### 发布

那有人可能会怀疑： __“那你都说发布之前很方便，发布的时候会不会太麻烦啊？”__

好问题，发布就两行命令：

    # 图片增量上传、webpack 打包、htmlone 合并，最终生成在 dist 目录
    gulp
    # 交互式上传到 awp
    awp

正常的命令行反应是类似这样的：

    $ gulp
    [04:46:48] Using gulpfile ~/Sites/alibaba/samples/y/gulpfile.js
    [04:46:48] Starting 'images'...
    uploaded ../images/logo.png e1ea82cb1c39656b925012efe60f22ea http://gw.alicdn.com/tfscom/TB1SDNqIFXXXXaTaXXX7WcCNVXX-400-400.png
    uploaded ../images/one.png 64eb2181ebb96809c7202a162b9289fb http://gw.alicdn.com/tfscom/TB1G7JHIFXXXXbTXpXX_g.pNVXX-400-300.png
    uploaded ../images/taobao.jpg 4771bae84dfc0e57f841147b86844363 http://gw.alicdn.com/tfscom/TB1f2xSIFXXXXa1XXXXuLfz_XXX-1125-422.jpg
    [04:46:48] Finished 'images' after 46 ms
    [04:46:48] Starting 'bundle'...
    [04:46:49] Version: webpack 1.10.1
          Asset     Size  Chunks             Chunk Names
        main.js  17.1 kB       0  [emitted]  main
    main.js.map  23.5 kB       0  [emitted]  main
    [04:46:49] Finished 'bundle' after 1.28 s
    [04:46:49] Starting 'build'...
    "htmlone_temp/cdn_combo_1.css" downloaded!
    "htmlone_temp/cdn_combo_0.js" downloaded!
    [04:46:57] >> All html done!
    [04:46:57] Finished 'build' after 8.07 s
    [04:46:57] Starting 'default'...
    done
    [04:46:57] Finished 'default' after 130 μs
    $ awp (交互式过程略)

你甚至可以写成一行：

    gulp && awp

最终这个初始化工程的示例页面的效果如下

![](http://img4.tbcdn.cn/L1/461/1/a9b1d49e0461e8f7b652d4fac2bb21998eed638d)

#### 设计变更了？

这条链路是我们之前最不愿意面对的，今天，我们来看看这条链路变成了什么，假设有一张设计图要换：

1. 在 Photoshop 里把图重新切下来
2. 同名图片文件放入 `images` 文件夹
3. 运行 `gulp && awp`

__就这样！__

额外的，如果尺寸有变化，就加一步：更改相应的 CSS 尺寸代码

### 总结

在整个团队架构的过程中，大家都在不断尝试，如何以更贴近开发者真实场景的方式，还原真实的问题，找出切实有效的解决方案，而不仅仅是单个功能或特性。这样我们往往会找到问题的关键，用最精细有效的方式把工作的价值最大化。其实“基于场景的思维方式”不只是流程设计的专利，我们业务上的产品设计、交互设计更需要这样的思维。我个人也正是受到了一些产品经理朋友们的思维方式的影响，把这种方式运用在了我自己的工作内容当中。希望我们产出的这套方案能够给大家创造一些价值，更是向大家传递我们的心得体会，希望这样的思维方式和做事方式可以有更多更广的用武之地。