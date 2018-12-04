---
title: '视觉差，走起！'
date: 2013/09/22 05:11:17
updated: 2013/12/11 10:52:11
---

翻译自：[https://www.html5rocks.com/en/tutorials/speed/parallax/](https://www.html5rocks.com/en/tutorials/speed/parallax/)

### 简介

现在满大街都是视觉差(parallax)网站了，我们随便看几个：

* [Old Pulteney Row to the Pole](http://www.rowtothepole.com/)
* [Adidas Snowboarding](https://www.adidas.com/com/apps/snowboarding/)
* [BBC News - James Bond: Cars, catchphrases and kisses](https://www.bbc.co.uk/news/entertainment-arts-20026367)

也许你对这玩意儿还不太熟，视觉差其实就是它的视觉结构会随着页面的滚动而变化。通常情况下页面里的元素会根据页面的滚动位置而缩放、旋转或移动。

![一个视觉差页面的demo](https://www.html5rocks.com/static/demos/parallax/parallax.jpg)  
我们的视觉差demo的完整效果

不管你喜不喜欢视觉差网站，有一件事毫无疑问，它是一个性能的黑洞。因为当页面滚动时，浏览器的优化都倾向于新内容随滚动而出现于屏幕的最上方或最下方的情况。一般来说，内容改变得越少浏览器性能越高。而对于一个视觉差网站来说，在页面滚动时，好多元素都在发生改变，大多数情况下整个页面的大块可视元素都在发生变化，所以浏览器不得不重绘整个页面。

我们有理由这样归纳一个视觉差的网站：

* 背景元素会在你向上或向下滚动页面时改变位置、旋转或缩放。
* 页面内容，如文字或小的图片，在页面滚动时会按照传统的方式进行上下移动。

建议大家先阅读我们之前介绍过的[滚动性能](https://www.html5rocks.com/en/tutorials/speed/scrolling/)来改进你的app的响应速度。本篇文章是基于那篇文章所写的。

所以文字是如果你在建立一个视觉差网站，那么你是否受困于高昂的重绘开销？有没有别的改进建议使得性能最大化？让我们看看这几个方案：

<!--more-->

### 方案1：使用DOM元素和绝对定位

这是很多人默认采取的方案。页面里有一大堆元素，任何时候只要触发滚动事件，这些元素就会进行各种变换来完成视觉上的更新。我已经用这个方式写好了一个[demo页面](https://www.html5rocks.com/static/demos/parallax/demo-1a/demo.html)。

如果你打开开发者工具的时间线的帧模式的话，滚动页面，你会发现各种全屏重绘，这个代价是很高的。如果你滚动多一些，你会发现在一个单个帧里出现了好多滚动事件，每个事件都会触发布局操作。

![Chrome开发者工具中未优化过的滚动事件](https://www.html5rocks.com/static/demos/parallax/paints.png)  
开发者工具展示了一个单个帧里的大块绘制以及多个由事件触发的布局操作

需要铭记的要点是为了达到60fps(匹配传统显示器60赫兹的刷新频率)，我们需要在16毫秒之内搞定一切。在这个版本中我们使得每次滚动事件都造成了视觉上的变化。但是我们之前的文章[用requestAnimationFrame做出更经济实惠的动画](https://www.html5rocks.com/en/tutorials/speed/animations/)和[滚动性能](https://www.html5rocks.com/en/tutorials/speed/scrolling/)已经讨论过，这样做和浏览器的更新机制并不相符，所以我们要么会错过帧，要么会在同一帧里做了多余的工作。这样的网站无法给人一种纯天然不刺激的感觉，用户就会不爽。

让我们把更新界面的代码从滚动事件里拿出来，放到`requestAnimationFrame`的回调函数里吧，滚动事件只是简单的不惑滚动的值。我们的[第二个demo页面](https://www.html5rocks.com/static/demos/parallax/demo-1b/demo.html)在此。

如果你重复滚动测试，你可能会注意到一个轻微的改进，尽管不算明显。原因是因滚动而触发的布局操作并不总是代价昂贵了，但在其他用例中它很可能是。现在至少我们把布局操作限制在了每帧一次。

![Chrome开发者工具中反跳动之后的滚动事件](https://www.html5rocks.com/static/demos/parallax/paints-raf.png)  
开发者工具展示了一个单个帧里的大块绘制以及多个由事件触发的布局操作

现在我们可以每帧绑定一个也可以绑定一百个滚动事件，但我们只记录`requestAnimationFrame`回调函数运行时最近的值并更新到视图上。这里的重点是之前每次滚动事件触发时都强制更新视图，现在则是请求浏览器提供一个合适的窗口来做这件事。怎么样？不错吧！

这个方式的主要问题在于，不论`requestAnimationFrame`与否，整个页面基本上是一个层。通过移动周围的这些可视元素，我们需要大块的重绘。通俗地讲，绘制是一个阻塞操作(虽然这已经在[改变](https://www.chromium.org/developers/design-documents/impl-side-painting))，也就是说浏览器无法做任何其它的工作，我们经常会超出每帧16毫秒的预算，页面还是无法纯天然不刺激。

### 方案2：使用DOM元素和3D变换

不同于绝对定位的另一个方案是我们可以将元素应用到3D变换当中。在这种情形下，我们将这些应用3D变换的元素视为一个新的层，并且在WebKit浏览器中，它通常会导致一个硬件层面的转变。在方案1种，相比之下，我们有一个大的重绘的层，这个层的任何改变都会在CPU中绘制和组合。

也就是说，在这个方案中，一切变得不一样了：我们为应用3D变换的任何元素提供一个潜在的层。如果我们从这一点出发进行元素的变换那么我们无需重绘这个层，而GPU可以处理这些元素的移动并组合成最后的页面。

这里有[另一个demo](https://www.html5rocks.com/static/demos/parallax/demo-2/demo.html)展示了3D变换的使用。如果你滚动页面你将会发现效果得到了大幅度的改善。

人们多次使用`-webkit-transform: translateZ(0);`做hack并看到惊人的性能提升，但今天看来有几个问题：

1. 这并不是跨浏览器兼容的
2. 它强制浏览器为每个元素创建一个新的层。大量的层同样会带来性能瓶颈。所以请尽量少用。
3. 有些WebKit ports是禁用这个的。

如果你谨慎使用3D变换的话，这确实是一个临时解决方案！理想化的讲，我们可以在2D变换时看到和3D同样的渲染特性。浏览器正在以惊人的速度一步一步发展，所以希望这就是我们将会看到的。

最后，你应该针对性的避免绘制任何你可以在页面内简单移动的元素。举个视觉差网站通用的例子，固定div的高度并改变齐背景的位置来提供视觉差效果。不行的是这个元素需要在每次运动的时候都进行重绘，这会带来性能的损耗。取而代之的是，如果可以，你应该创建元素(有必要的话将其包裹在一个`overflow: hidden`的div中)并对齐进行简单的移动。

### 方案3：使用固定位置的canvas或WebGL

我们考虑的终极方案，就是使用一个固定位置的canvas放在页面最底层，把我们想要绘制的各种变换图形都画在里面。一眼看上去这并不像是最优方案，但是这个方案确实有它的一些优势：

* 我们不再需要组合工作了，只需要一个canvas元素就行了
* 我们通过*硬件加速*高效处理一张大位图
* Canvas2D API善于处理我们需要的各种变换，开发和维护都变得很容易。

使用canvas元素给了我们一个新的层，但是仅此*一个*层，而在方案2种，我们实际是为*每个*应用3D变换的元素都创建了一个新的层。所以我们需要组合所有的层到一起，这是一个会增长的工作量。鉴于不同浏览器对变换的不同实现，这同时也是跨浏览器兼容性最好的方案。

如果你看看基于这个方案的[这个demo](https://www.html5rocks.com/static/demos/parallax/demo-3/demo.html)，在开发者工具里测试一下，你会发现性能非常好。这个方案我们简单的使用了canvas的`drawImage` API调用，并且我们将其背景图片和每个色块都绘制在屏幕上正确的位置。

    /**
     * Updates and draws in the underlying visual elements to the canvas.
     */
    function updateElements () {
    
      var relativeY = lastScrollY / h;
    
      // Fill the canvas up
      context.fillStyle = "#1e2124";
      context.fillRect(0, 0, canvas.width, canvas.height);
    
      // Draw the background
      context.drawImage(bg, 0, pos(0, -3600, relativeY, 0));
    
      // Draw each of the blobs in turn
      context.drawImage(blob1, 484, pos(254, -4400, relativeY, 0));
      context.drawImage(blob2, 84, pos(954, -5400, relativeY, 0));
      context.drawImage(blob3, 584, pos(1054, -3900, relativeY, 0));
      context.drawImage(blob4, 44, pos(1400, -6900, relativeY, 0));
      context.drawImage(blob5, -40, pos(1730, -5900, relativeY, 0));
      context.drawImage(blob6, 325, pos(2860, -7900, relativeY, 0));
      context.drawImage(blob7, 725, pos(2550, -4900, relativeY, 0));
      context.drawImage(blob8, 570, pos(2300, -3700, relativeY, 0));
      context.drawImage(blob9, 640, pos(3700, -9000, relativeY, 0));
    
      // Allow another rAF call to be scheduled
      ticking = false;
    }
    
    /**
     * Calculates a relative disposition given the page’s scroll
     * range normalized from 0 to 1
     * @param {number} base The starting value.
     * @param {number} range The amount of pixels it can move.
     * @param {number} relY The normalized scroll value.
     * @param {number} offset A base normalized value from which to start the scroll behavior.
     * @returns {number} The updated position value.
     */
    function pos(base, range, relY, offset) {
      return base + limit(0, 1, relY - offset) * range;
    }
    
    /**
     * Clamps a number to a range.
     * @param {number} min The minimum value.
     * @param {number} max The maximum value.
     * @param {number} value The value to limit.
     * @returns {number} The clamped value.
     */
    function limit(min, max, value) {
      return Math.max(min, Math.min(max, value));
    }

当你处理大图片(或其它可方便绘制到canvas中的元素)的时候，这个方案效果不错，但是处理大块文字的时候这个方案会遇到更多的挑战，但还是可以根据你的网站的情况成为最合适的方案。如果你不得不在canvas里处理文本，你可以使用`fillText` API方法，但是它的可访问性会打折扣(你把文字转成了位图！)并且你不得不处理文字的折行等一些列细节。如果你可以避免它，你真的应该，也更有可能更好的使用上面的变换方案。

既然我们尽可能往远了想，那么没有理由断定视觉差的工作应该在一个canvas元素内完成。如果浏览器支持的话，我们可以使用WebGL。这里的关键在于WebGL有最直接的显卡API调用方式，也是你最有可能达到60fps的方式，尤其在网站效果比较复杂的时候。

你立刻觉得使用WebGL有点过于夸张了，或者WebGL尚未被广泛的支持，但是如果你使用类似[Three.js](https://github.com/mrdoob/three.js/)的工具，你总是可以降级到使用canvas元素同时你的代码被抽象为了一致且友好的形态。所有我们需要的是使用[Modernizr](http://modernizr.com/)检查相关的API支持情况：

    // check for WebGL support, otherwise switch to canvas
    if (Modernizr.webgl) {
      renderer = new THREE.WebGLRenderer();
    } else if (Modernizr.canvas) {
      renderer = new THREE.CanvasRenderer();
    }

然后使用Three.js的API替换掉我们对上下文的处理。这里的[demo](https://www.html5rocks.com/static/demos/parallax/demo-4/demo.html)同时支持了两个渲染方式，假设你的浏览器也会如此！

作为这个方案的最终思考，如果你不会在页面里放太多额外的元素的话，你可以总是[使用canvas作为背景元素](http://updates.html5rocks.com/2012/12/Canvas-driven-background-images)，这Firefox和基于WebKit的浏览器中都可以。很明显这确实不是无处不在的，所以我们平时使用的时候要小心谨慎。

### 取决于你们的实际情况

开发者默认更多使用绝对定位的元素实现视觉差的主要原因其实就是其特性的支持程度。这在某种程度上是幻觉，因为老的目标浏览器很可能提供的是一个极其糟糕的渲染体验。甚至在今天的现代浏览器中，使用绝对定位元素还是无法保障好的性能。

3D变换为你提供了直接操作DOM元素的能力，并可以达到不错的帧率。成功的关键就是在你简单的移动周围元素时避免了绘制。一定记住，WebKit浏览器在这个过程中创建了层，但这和其它浏览器并不相关，所以要在提交方案之前一定要测试确认。

如果你只是定位于顶级浏览器，且可以通过canvas渲染网站，拿canvas可能是你最好的选择。当然如果你使用[Three.js](https://github.com/mrdoob/three.js/)，你应该可以根据你需要的支持情况选择在不同的渲染方式之间进行切换。

### 总结

我们已经评估了几个视觉差网站的实现方案，从决定定位元素到使用固定位置的canvas。当然，你需要的实现方式，依赖于你希望达到的特定的设计效果，但有这几个可选方案总是好的。

还是那句话，不论你用哪个方案：别妄加猜测，试试就知道了。
