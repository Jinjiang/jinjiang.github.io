---
title: 'Web 表单的未来'
date: 2017/08/04 11:00:16
updated: 2017/08/04 11:05:56
tags:
- 表单
---

译自：[https://blog.prototypr.io/the-future-of-web-forms-4578485e1461](https://blog.prototypr.io/the-future-of-web-forms-4578485e1461) Matt West 的 The Future of Web Forms

license: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

----

如何通过会话式的界面让数据收集更加人性化。

Web 表单是从纸质媒介进化而来的。即设计一组标签和线框来限制输入，同时让数据处理变得跟容易。

毕竟，表单的目的是收集数据，以便执行操作。为了执行该操作，我们需要把收集的数据统一汇总。我们在界面上设计了一些约束以便达到统一汇总的目的。表单旨在符合流程上的需求，而非用户本身。

表单经常给人的感觉是冷冰冰的，没有人情味。因此，我们得到的回应往往也是冷酷和不人性的。我们不深入细节，如果一个朋友问你相同的问题，你可能会多一些回复，但这是一台电脑。他想要的只是数据，别的不在乎。就好像你在跟人说话但是人家并没有在听。为什么没人听的话说出来会让人觉得烦呢？

![](/uploads/2017/08/3710637212.jpg)
Image by [Ken Teegardin](https://www.flickr.com/photos/teegardin/5512347305/in/photolist-9p7dNM-nfdbBe-cDphCL-9xSJ1E-4ygMXx-6jXLSo-9oAgas-nytcFV-aXPWKv-2rxaS-6jXZNW-oTkWEk-iYYsDH-pMeotq-5SLAGV-6jERwK-6jBcih-iq2oUj-9c36uA-6wAbW4-7vWrZv-dRsLkh-99N1pk-g1vCAm-g4P8w-eSo6V4-biaFTP-6jk9td-J9DyZ-cQay4s-6jXYcS-9PSLHY-iYKUVr-h5Eh26-6jBXaA-7vTL6V-pMfC4t-5u8Nod-7b3sfu-fdPdkW-7vVobi-5Tscj8-7vUV6p-bDw2PE-6jxKBi-5Tww8J-89GCkF-6jxKTi-6jBWUG-eiwixk).

和许多数字化的东西一样，表单已经被之前的形态严重影响。我们之所以往线框里填东西是因为我们以前在纸上就是这么画的。

<!--more-->

我们在纸上主要的输入法是钢笔或铅笔。现在已经不一样了，我们被上百年的约束限制了自己。

技术已经从这些约束中解放了我们。我们已经拥有了创建更人性化的人机交互的工具。

![](/uploads/2017/08/4181232011.jpg)
Spike Jonze’s film “Her” provides an interesting prediction for how we might interact with computers in the future.

我们已经很接近在语音识别、自然语言处理和人工智能等方面与人类进行有意义的对话了。甚至我们的工具已经在构建足够优秀的体验了。

所以我们回到表单。我们该如何使用这些工具使得表单更人性化呢？

我们需要摆脱之前对于表单界面的预设。聚焦在通过技术构建一个更佳自然的体验，而不是去除操作层面的约束。

![](/uploads/2017/08/2141635702.png)
A conversation with Facebooks chat bot “Poncho”.

在过去几年中，我们已经看到了一些新产品致力于通过科技让我们的交互更自然。Siri、Alexa、chat bots 都让我们朝着正确的方向发展，但是我们还没有看到这些创新以某种方式融入到浏览器界面中。

我们有非常多的潜力在更加会话式的 web 界面上，当我们需要收集数据时，我们仍然从一堆输入框和下拉框中构建表单。

有些人在推动这件事。保险服务 [Jack](https://withjack.co.uk/quote/) 最近发布了一个令人印象深刻的页面来收集保险报价所需的细节。

![](/uploads/2017/08/1469363781.png)
The “Get a Quote” page from [withjack.co.uk](https://withjack.co.uk/)

虽然回复依然是被约束的，但是这个收集数据的设计流程已经创造出了更加愉悦和友善的体验。

向用户展示一个标准的 web 表单因此而变得更加容易，但是这样的用户交互更像是一个会话的过程，Jack 已经创造出了更加自然的感受。

![](/uploads/2017/08/993446137.png)
Adrian Zumbrunnen’s conversations website [azumbrunnen.me](http://azumbrunnen.me/)

Adrian Zumbrunnen 在发布他的会话式的个人网站之后引起了互联网的关注。Adrian 设计了一个界面，通过一些回复选项来引导用户浏览他的 UI/UX 作品。Adrian 的网站巧妙的考虑到了用户如何到达他的网站并以此为信号来理解用户所处的情景。

我们的方向是对的，但感觉还是少了什么。从技术角度看，构建一个真实的会话式界面需要理解用户的意图和语境，而不仅仅是一些回复选项和位置摆放很聪明的文本框。我们需要基于已经做好的 chat bot 且开发出能够让人们用自然语言与其交流的界面。

界面甚至在开始之前就应该知道我们是谁。底层技术已经有现成的了，那就是浏览器的自动填表。你所有的细节都存在同一个地方，对于一个网站来说，一个简单的请求就可以访问。

该界面应该能够适配当前所处的情境。会话是你是从网站的帮助支持页面开始的还是从营销站点的首页开始的？这些信号可以帮助我们理解用户的语境并为其定制适当的系统回复。这些事情 Adrian 的网站并没有做。

让我们体验一下如何把用户注册流程变得更加会话式。

![](/uploads/2017/08/68310827.png)
What would the sign up flow look like if we moved beyond forms?

我们今天拥有做这件事相应的数据，但是把所有的东西一起提供出来以创造这样一个自然的体验是真正难的地方。

再考虑牵连到可访问性、隐私、多语言支持、赋予情绪和同理心的设计。如果我们打算通过技术引入一个全新的更有意义的交互设计，这些都是我们今天要去面临和克服的挑战。

没想到我们已经走到这么远了，但是这里仍然有很多事情要做。未来就在不远处的转角，但我们要敢于去做才行。