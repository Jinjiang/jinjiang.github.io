---
title: '通过HTML5 Canvas API调节图像的亮度和颜色'
date: 2013/10/11 04:15:29
updated: 2013/12/11 10:52:22
---

译自：[Adjusting Image Brightness and Color Using the HTML5 Canvas API](http://www.storminthecastle.com/2013/10/06/color-matrix-filters-using-the-html5-canvas/)

你曾否需要调节一张图片的亮度？或者增强红色通道让它变得温暖一些？

![](http://www.storminthecastle.com/wp-content/uploads/2013/04/filtered.jpg)

这是我之前两篇文章“[如何通过HTML5 Canvas处理图片酷效](http://www.storminthecastle.com/2013/04/06/how-you-can-do-cool-image-effects-using-html5-canvas/)”和“[如何创建一个HTML5的大头贴应用](http://www.storminthecastle.com/2013/10/06/color-matrix-filters-using-the-html5-canvas/how-you-can-build-an-html5-photobooth-app/)”的后续。在之前的那些文章里，我提供了一些可分离的颜色滤镜代码：灰度、灰褐色、红色、变亮、变暗等。这些滤镜都是经典的颜色滤镜，每个像素点的颜色都是独立运算的，互不影响。我们的可以将其建模成一个单独数据驱动的称为颜色矩阵滤镜(Color Matrix Filter)的东西。这一概念将会遍布本文。这种滤镜将会以一个包含权重(即系数)的颜色矩阵作为输入，并决定输出的颜色组件(color component)如何和输入的颜色组建相对应。

<!--more-->

这个应用实例允许你在一个表格里编辑颜色矩阵，并立即把矩阵应用到当前加载的图片中。下图的表格展示了灰褐色滤镜的矩阵：

![sepia](http://www.storminthecastle.com/wp-content/uploads/2013/05/sepia.png)

通过这个例子，每个像素的新红色组件`r’`都将会根据给定的`r`、`g`、`b`、`a`进行如下计算：

    r' = 0.393r + 0.769g + 0.189b + 0

作为每个颜色组件值额外的系数`i`被加载了表格的最后，用来变量或变暗最终的计算值。同理新的`g’`、`b’`、`a’`也进行相似的计算。下面的代码展示了等同于灰褐色颜色矩阵的JavaScript数组：

    var sepiaMatrix = 
    [
      0.393, 0.769, 0.189, 0, 0,
      0.349, 0.686, 0.168, 0, 0,
      0.272, 0.534, 0.131, 0, 0,
          0,     0,     0, 1, 0,
    ];

下面这段代码展示了等同于灰度特效矩阵的JavaScript数组：

    var grayscaleMatrix = 
    [
      0.33, 0.34, 0.33, 0, 0,
      0.33, 0.34, 0.33, 0, 0,
      0.33, 0.34, 0.33, 0, 0,
         0,    0,    0, 1, 0,
    ];

颜色矩阵滤镜的代码如下：

    colorMatrixFilter = function (pixels, m) {
      var d = pixels.data;
      for (var i = 0; i < d.length; i += 4) {
        var r = d[i];
        var g = d[i + 1];
        var b = d[i + 2]; 
        var a = d[i + 3];

        d[i]   = r * m[0] + g * m[1] + b * m[2] + a * m[3] + m[4];
        d[i+1] = r * m[5] + g * m[6] + b * m[7] + a * m[8] + m[9];
        d[i+2] = r * m[10]+ g * m[11]+ b * m[12]+ a * m[13]+ m[14];
        d[i+3] = r * m[15]+ g * m[16]+ b * m[17]+ a * m[18]+ m[19]; 
      }
      return pixels;
    };

我希望你已经乐在其中了。颜色矩阵提供了一个应用颜色滤镜的强大通用工具。

[demo](http://www.storminthecastle.com/projects/colormatriximage/) & [源码](http://www.storminthecastle.com/projects/colormatriximage/colormatriximage.zip)