---
title: '网站装修笔记20120406'
date: 2012/04/06 06:29:53
updated: 2012/04/17 01:48:13
tags:
- links
---

今天为我的新网站做了两件事情：

* 第一件事是为我的主题皮肤加入了侧边栏显示，并使用了css3 media queries技术进行了响应式设计，并借鉴了一些metro ui的思路
* 第二件事是加入了友情链接插件，可以在侧边栏显示一些自定义的链接，方便将来和博友们交换链接

### 友情链接

先说友情链接插件的事情吧，我在Typecho的插件站找到了一款友情链接的插件，名字就叫[Links](http://typecho.us/plugins/links-for-imhan.html)，非常方便实用。我现在随便放了3个链接，看看样子。大家希望跟我交换链接的，可暂时留言至此，回头我会另外做个交换链接的页面。

![友情链接示意图](http://jiongks-typecho.stor.sinaapp.com/usr/uploads/2012/04/2077996433.png)

### 响应式侧边栏

然后是侧边栏，我把最近文章和最近评论两个侧边栏的widget加入了名为`large`的css class。这类widget会在条件允许的情况下占用更大的空间。一般情况下宽度是普通widget的两倍。在一些特殊的界面宽度下，widget的宽度是一样的，大家没有什么分别。

对于css3 media queries的利用，我这里按窗口宽度分了5档1400px+/1050px+/650px+/400px+/400px-，进行响应式设计。每一档的内容宽度、侧边栏宽度和布局都不太一样。以适应不同的终端。举其中一个例子(1050px~1400px之间)：

    @media all and (min-width: 1050px) and (max-width: 1400px) {
        #wrapper {
            position: relative;
            padding-right: 280px;
        }
        #sidebar {
            position: absolute;
            width: 260px;
            top: 160px;
            right: 0;
        }
        #sidebar .widget,
        #sidebar .large {
            width: 98%;
        }
    }


最终效果如图：

![响应式设计预览](http://jiongks-typecho.stor.sinaapp.com/usr/uploads/2012/04/394641605.jpg)

这款皮肤我会稍后更新共享在这里。

另外我最近抽空研究过了SAE Storage，接下来的事情是做一些有趣的侧边栏小控件出来，比如投票、相册、之类的。

先记下这么多