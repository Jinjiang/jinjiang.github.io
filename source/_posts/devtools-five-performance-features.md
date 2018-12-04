---
title: 'Chrome开发者工具中评估性能的五大新特性'
date: 2013/09/18 06:37:03
updated: 2013/12/11 10:52:06
---

摘自：[Chrome DevTools Revolutions 2013](https://www.html5rocks.com/en/tutorials/developertools/revolutions2013/)

本次开发者工具的改进中有几项新特性是针对性能的：

* 持续绘制模式
* 显示绘制矩形及其层的边框
* 每秒帧数的测量仪
* 找到强制同步布局(layout thrashing)
* 对象分配跟踪

<!--more-->

### 持续绘制模式

持续绘制模式是开发者工具设置中的一个选项(**渲染**>**开启持续页面绘制**)，这个选项可以帮助你识别单个元素或CSS样式的渲染开销。

通常Chrome只在响应一个布局或样式的变化时绘制屏幕，并且只是绘制屏幕中需要更新的区域。当你开启持续页面绘制选项时，整个屏幕都会不断的重绘。一个置顶的界面会展示Chrome在绘制页面时所花费的时间，以及近期绘制时间的分布图。穿过整个直方图的那条横线代表16.6毫秒标记线。

![置顶的绘制时间界面](https://1-ps.googleusercontent.com/x/s.html5rocks-hrd.appspot.com/www.html5rocks.com/en/tutorials/developertools/revolutions2013/xpaint-times.png.pagespeed.ic.4GHJaoT9je.webp)

这样做的好处是你可以走遍DOM树中的元素面板，隐藏单个元素(隐藏当前选中元素的快捷键是H)或关闭一个元素的CSS样式。通过留意页面绘制时间的变化，你可以看到单个元素或样式为页面渲染所增加的“负担”。如果隐藏一个元素使得绘制时间明显下降，那么你要重点关照一下这个元素的样式或构造了。

开启持续绘制模式的方法：

1. 打开开发者工具的设置
2. 打开**常规**选项卡，在**渲染**中，打开**开启持续页面重绘**

注意：如果你看不到这个设置项，请打开**about:flags**，打开**在所有页面中使用GPU合成**，并重启Chrome。

更多信息，请移步至：[用开发者工具的持续绘制模式进行长绘制时间的性能分析](https://updates.html5rocks.com/2013/02/Profiling-Long-Paint-Times-with-DevTools-Continuous-Painting-Mode)

### 显示绘制矩形及其层的边框

另一个开发者工具的选项是展示正在被绘制的矩形区域(设置>渲染>展示绘制矩形)。比如，在下面这个屏幕截图中，一个矩形正在被绘制，在这里，CSS悬停效果被应用到了紫色图形中。

![网站展示绘制中的矩形](https://1-ps.googleusercontent.com/x/s.html5rocks-hrd.appspot.com/www.html5rocks.com/en/tutorials/developertools/revolutions2013/xpaint-rect-1.png.pagespeed.ic.vrXLmQcKHF.webp)

你得回避导致整个界面被重绘的设计实践与开发实践。比如，在下面这个屏幕截图中，用户正在滚动页面。一个绘制矩形覆盖在了滚动条上，另有一个绘制矩形覆盖在了整个页面的剩余部分。它的罪魁祸首是body元素的背景图片。该背景图片是fixed定位的，它要求Chrome每次滚动页面的时候都得重绘整个页面。

![网站展示全屏幕的重绘](https://1-ps.googleusercontent.com/x/s.html5rocks-hrd.appspot.com/www.html5rocks.com/en/tutorials/developertools/revolutions2013/xpaint-rect-2.png.pagespeed.ic.G7rwOiDpvh.webp)

### 每秒帧数测量仪

**每秒帧数测量仪**显示了页面当前的帧率、最小帧率和最大帧率、一个展示帧率随时间变化的条形图、以及不同帧率分布的直方图。

![每秒帧数测量仪](https://1-ps.googleusercontent.com/x/s.html5rocks-hrd.appspot.com/www.html5rocks.com/en/tutorials/developertools/revolutions2013/xfps-meter.png.pagespeed.ic.s2bF1Y3FUT.webp)

开启每秒帧数测量仪的方法：

1. 打开开发者工具的设置
2. 打开**常规**选项卡
3. 在**渲染**中，打开*强制加速合成*以及**显示每秒帧数测量仪**

你可以通过打开**about:flags**，然后开启**每秒帧数计数器**并重启Chrome，来强制每秒帧数测量仪始终显示。

### 寻找强制同步布局(layout thrashing)

为了最大化渲染性能，Chrome通常会在应用程序中批处理布局变化请求，并制定一个日程来异步计算和渲染这些变化请求。尽管如此，当一个应用程序获取依赖于布局的属性值的时候(比如offsetHeight或offsetWidth)，Chrome会强制立刻同步渲染页面布局。我们称之为强制同步布局。这会明显的降低渲染的性能，在大DOM树中重复运行时尤为明显。这种情形也被称之为“layout thrashing”。

当我们检测到一个强制同步布局的时候，时间线记录中会有警告，它会在相应的时间线记录边上显示一个黄色的警告图标。鼠标悬停在这些记录上会看到无效的布局的代码堆栈记录、以及造成强制布局的代码堆栈记录。

![时间线视图中的强制同步布局弹泡](https://1-ps.googleusercontent.com/x/s.html5rocks-hrd.appspot.com/www.html5rocks.com/en/tutorials/developertools/revolutions2013/xforced-sync-layout-popup.png.pagespeed.ic.fvGqEI6wkY.webp)

该弹泡同时展示了需要布局的结点数量、重新布局的树的尺寸、布局的范围和布局的根。

更多信息，请移步至：[时间线Demo：诊断强制同步布局](https://developers.google.com/chrome-developer-tools/docs/demos/too-much-layout/)

### 对象分配跟踪

对象分配跟踪是一个新型的内存描述资料，它可以实时展示内容分配的情况。当你开始分配跟踪时，开发者工具实时持续生成堆的快照。堆分配的描述资料展示了对象在哪里被创建，且识别被保留的路径。

![堆分配描述资料的视图](https://www.html5rocks.com/en/tutorials/developertools/revolutions2013/allocation-tracker.png)

跟踪对象分配的方法：

1. 打开开发者工具，点击**描述资料**选项卡
2. 选择**记录堆分配**然后点击**开始**
3. 当你完成数据的收集之后，点击**停止记录堆描述信息**(描述资料面板左下角的红色的圆)。
