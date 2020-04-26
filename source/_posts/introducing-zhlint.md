---
title: '中文格式化小工具 zhlint 及其开发心得'
date: 2020/04/26 03:53:59
updated: 2020/04/27 12:29:56
tags:
- Chinese
- lint
- tool
---

介绍要给小工具给大家：**[zhlint](https://github.com/Jinjiang/zhlint)**

![zhlint logo](https://raw.githubusercontent.com/Jinjiang/zhlint/master/logo.svg)

这个工具可以帮助你快速格式化中文或中英混排的文本。比如常见的中英文之间要不要用空格、标点符号要用全角字符之类的。

看上去这工具似乎和自己的工作和职业关系不大，但其实也是有一定由来的。

### 项目的由来

自己之前参与过一些 [W3C 规范的翻译工作](https://www.w3.org/html/ig/zh/wiki/%E7%BF%BB%E8%AF%91)，这其中除了需要一定的词汇量、语法知识和表达技巧之外，最主要的部分应该就是格式了。因为大家对诸如空格、标点符号等细节的使用其实不太统一，这在团队协作的时候其实会变成问题，大家都花了一些不必要的时间在格式讨论和校对上。感觉这部分工作比较枯燥且机械，但又不得不做。只能花更多时间在上面。

后来因为接触 [Vue.js](https://vuejs.org/) 的关系。这个项目在早期并没有太多人知道它，而且当时社区普遍比较迷信像 Google 这种大厂官方推出的技术方案，对“野生”项目都不是很有兴趣，所以我希望可以把这个项目介绍给更多人认识。结合我之前的翻译经验，我觉得翻译文档是一个比较好的途径，于是就发起了 [Vue 中文文档](https://github.com/vuejs/cn.vuejs.org/)的翻译，结果没想到这件事一发不可收拾，我就不知不觉从 2014/2015 年做到了今天。随着 Vue 的不断发展，关注文档的人也越来越多，中间发生了很多故事，这些故事也让我自己逐步对翻译和中文格式的细节有了更多的认识。

真正触发我做这个项目的事情，是去年的一个翻译讨论：[如何](https://github.com/vuejs/cn.vuejs.org/issues/480)[翻译](https://github.com/vuejs/cn.vuejs.org/issues/544) [attribute](https://github.com/vuejs/cn.vuejs.org/issues/630) 和 [property](https://github.com/vuejs/cn.vuejs.org/issues/646)。这个问题几乎从我接触技术翻译的第一天起就一直是个噩梦。我和周围的小伙伴尝试了各种译法，都不能让所有人满意，无奈之下通过刻意的区分和强化教育，把它们分别译成“特性”和“属性”。这个状态持续了很长一段时间，Vue 的文档也基本都是这么翻译的。直到去年的一段时间，我逐步意识到，也许这两个词不翻译会更好，索性直接保留英文原词，这样不会有歧义，同时随着整个社区的英文程度在提高，像这样的词不翻译大家应该也能顺畅的理解了，中英文混着读也逐渐可以接受了。所以就在 GitHub 开了个 [issue](https://github.com/vuejs/cn.vuejs.org/issues/895)，同时也扩散到了 [W3C Web 中文兴趣组](https://lists.w3.org/Archives/Public/public-chinese-web/2019Apr/0000.html)。没想到这次讨论大家的意见出奇的一致，几乎“全票通过”。看上去困扰我多年的问题终于要解开了……

然而在这之后，我意识到，如何对已经翻译好的大量文档做关键词批量替换并不是一件容易的事情——主要还是格式细节太多了。不能做简单粗暴的文本批量替换。

比如把“特性”换回“attribute”之后，如果“特性”一词的两边也都还是中文，那么“attribute”两边就都需要加一个空格，而如果是标点符号就不需要，而如果是英文，那理论上这个空格已经加过了。所以情况很多很复杂。你读到这里可能觉得那我们稍微加个正则表达式也许可以解决，那我会在告诉你，如果这个词的边上还可能有 HTML 标记或 Markdown 标记，那这个正则该如何写呢？或许也不那么容易了。

因此这个译法改动在去年就已经有定论了，但是实际上到今年上半年我才真正改好。原因是我觉得这次我不打算再靠蛮力去解决问题了，而打算通过工具来解决——这就是我做这个项目的由来和动机——没错我陆陆续续做了一年左右，最近终于做出一个比较文档的版本了，然后才完成了这次译法的替换。

另外一个促使我做这个工具的原因其实是我个人希望尝试一些语法分析之类的技术，因为觉得作为一个前端工程师，未来这个方向的可能性和空间比较大。如之前和很多人都聊到过的，现如今的前端框架全部都开始在编辑器这个环节大做文章。因为它可以帮助你突破一些 JS 语言的限制。所以大家武装到牙齿之后这部分是一定会碰的。我预测接下来这个趋势会从框架往上发展，逐步延申到前端工作的更多环节。做这个工具看上去似乎有那么一点可以积累到的知识和经验，于是就想先做个这个试试看。

### 快速开始

接下来回到 zhlint 这个工具，介绍一下我设计的基本用法：

#### 基本用法

1. 在安装 Node 和 Yarn 之后，运行 `yarn global add zhlint` 或 `npm install -g zhlint`。这样 zhlint 就安装好了。
2. 在命令行里运行 zhlint，就可以启动这个工具并看到关于它的帮助信息。
3. 如果想真正校验一个文本文件，可以运行 `zhlint <filepath>`，比如我们创建一个文件叫做 `foo.md`，其中的文本内容是 `中文English`。那么运行 `zhlint foo.md` 会收到一个错误提示，提醒你中英文之间应该有一个空格。
4. 现在我们更进一步，运行 `zhlint foo.md --fix`，顾名思义这个命令会自动修复文件中的格式错误。所以运行之后文件 `foo.md` 内部的文本内容会变成 `中文 English`。
5. 如果现在有一批文件都需要做格式校验，zhlint 还支持批量多文件匹配。比如 `zhlint src/*.md` 可以校验 `src` 目录下的所有 md 文件。同理也可以加 `--fix` 做批量自动修复。

#### 常见格式问题

1. 空格问题

- `中文English中文` -> `中文 English 中文`
- `中文 ， 中文` -> `中文，中文`
- `1+1=2` -> `1 + 1 = 2`

2. 全角/半角问题

`中文, 中文.` -> `中文，中文。`

3. 特殊组合用法问题

- `Mr.` (不转换全角句号)
- `2020/01/02 01:20:30` (在描述时间和日期的时候冒号和斜杠两边没有空格)

4. 特殊个例问题

- `33.30KB min+gzip` (这里的加号两边不会加空格，该 case 没有普遍规律)

### 研发过程和心得

现在回顾之前的研发过程，首先是做得比较懒散，陆陆续续一点一点做，其次是返工了无数次，发现哪里走不通了就推倒重来，所以经历了太长的时间。

#### 第一版 (未完成 + 未发布)

在最初的版本里，我想的比较简单，就只是把中文内容分为几个颗粒度去处理：char、token、full text。所以我当时只做了五件事：

1. 逐个字符分类识别 (全角字符、半角字符、标点符号、空格)
2. 把字符连接成若干个 token 并分类识别 (中文、英文、标点符号)
3. 实现一个基本的 token 遍历函数
4. 利用这个 token 遍历函数指定校验规则并遍历处理 (比如发现一个中文和一个英文的 token 挨着，就强制塞一个空格进去)
5. 把处理过后的 token 再重新连接起来，得出最终的处理结果

大概的代码结构是这样的：

```js
const checkCharType = char => {...}

const parse = str => {...}

const travel = (tokens, filter, handler) => {...}

const lint = (str, options) => {
  // parse options
  // travel and process tokens
  // join tokens
}
```

然后我逐渐发现 lint 这个函数越写越大，逐渐失控。原因有这么几个：

1. 中文里对括号和引号的使用非常灵活，设计之初低估了它的难度和复杂度。比如：`我们需要 (先做一件事，然后再做一件事，最后再) 做一件事`。括号可以断在任意的地方，可以跨越多个句子，可以包含最前边或最后边的标点符号，也可以把它们留在外边，被截断的前后句子单独拿出来也未必是完整的。
2. 有一些非常特殊的 case 需要绕过，比如括号可以用在英文的单复数变化中 (`minute(s)`)、单引号可以用在英文缩写中 (`doesn't`) 等等。再比如在描述时间和日期的时候，我们不太习惯在每个数字之间都加空格所以会省略空格 (`2020年1月1日` 而不是 `2020 年 1 月 1 日`)。

这些都导致设计之初通过简单的线性 token 机制处理很难做好这件事。“Travel and process” 这部分的代码越来越臃肿。逐渐我意识到，这里需要更多的结构化设计。于是我停下来考虑了一段时间。

#### 第二版：部分重构

之后我逐渐想到两个主意：

1. 第一版尝试把 token 从线性结构转变成树形结构，但这棵树并不是规范的树，尤其是括号，所以我把括号从树形结构中抽离了出来，改为记号 (mark)。记号不会影响树形结构本身，可以单独识别和处理。这有点类似 HTML 之于 text 的区别，也就是某种“超文本标记”。事后证明 mark 这个结构和思路对后续的功能研发还有很大帮助。
2. 把需要 lint 的格式细节整理成一个一个独立的规则，然后轮流处理，这样庞大的“travel and process tokens”就有机会变成 `const rules = [...]; rules.reduce(processRule, str)`。这个思路其实我一开始想到过，但觉得把每条规则都抽象并独立出来是很有难度的，所以一直没有下定决心做。经过这次深思熟虑之后我鼓起勇气试了一下，看起来还是可行的，效果也还可以。

于是我决定把之前的主分支退役，重新开启一个新的分支，开始以上述思路重构代码。

重构之后的处理流程更像是：

```js
// separated files
const rules = [
  (token, index, group, matched, marks) => {...},
  (token, index, group, matched, marks) => {...},
  (token, index, group, matched, marks) => {...},
  // ...
]

// index.js
const checkCharType = char => {...}

const parse = str => {...}

const travel = (tokens, filter, handler) => {...}

const processRule = ({ tokens, marks, ... }, rule) => {...}

const join = (tokens) => {...}

const lint = (str, options) => {...}
```

有了这个结构，我就可以更加专注在格式规则的定义和实现上了。随着工作的深入，我也逐渐加入了一些务实的功能和设计。

#### 支持 Markdown/HTML 格式

截至目前，我们 lint 的假设性目标都是一个字符串——确切的说是单行字符串。但实际上我们需要处理的真实的文本内容是更复杂的。目前绝大多数待处理的文本内容都是 Markdown 格式，可能还夹带了一些 HTML 标记，而且是多行文本。

为了解决真实的问题，我稍微花了一些时间去了解如何解析 Markdown 语法。之前用到 Markdown 的地方基本都是从 Markdown 渲染出最终的 HTML 代码，但这次我们不太需要最终的 HTML 代码，而是 AST，也就是抽象语法树。最终我找到了一个叫做 [unified.js](https://unifiedjs.com/) 的库，它可以把各种格式的文本内容解析成为相应格式的 AST。其中 [remark.js](https://remark.js.org/) 就是在这个库的基础上用来解析 Markdown 语法的，其 AST 格式为 [mdast](https://github.com/syntax-tree/mdast)。大致的用法如下：

```js
const unified = require('unified')
const markdown = require('remark-parse')
const frontmatter = require('remark-frontmatter')

// the content
const content = '...'

const ast = unified().use(markdown).use(frontmatter).parse(content)

// process the Markdown AST
```

接下来就是根据 mdast 庖丁解牛的时刻了。经过研究 mdast 的文档，我发现在 Markdown 语法里，所有的语法节点都可以简单粗暴的区分为两大类：inline 和 block。而 zhlint 要处理的其实就是找出所有不能再拆解的 block，然后把其中的 inline 节点在 zhlint 中标注为我们之前提到过的 mark 类 token。当然其中 inline 节点还要再分为两类：一类是包含文本内容的 (例如加粗、斜体、链接等)，需要继续 lint 处理；一类不包含 (例如图片)，需要原文保留。对于代码片段，我们从自然语言分析的角度认为它不是文本内容，所以也算后者。更妙的是其实在 Markdown 的 parser 里其实是包含了对 HTML 标记的解析的，所以我们不需要额外引入 HTML parser 就可以完成对 HTML 标记的支持。

源代码中大致的语法节点分类如下：

```js
// 不能再拆解的 block
const blockTypes = [
  'paragraph',
  'heading',
  'table-cell'
]
// 包含文本的 inline
const inlineMarkTypes = [
  'emphasis',
  'strong',
  'delete',
  'footnote',
  'link',
  'linkReference'
]
// 不包含文本的 inline
const rawMarkTypes = [
  'inlineCode',
  'break',
  'image',
  'imageReference',
  'footnoteReference',
  'html'
]
```

这样我们就可以先把所有的文本中不可拆解的 block 找出来，同时对这些 block 内部出现的超文本做好 mark 标记，然后带着这些 mark 逐个 lint，最后再把这些结果填入之前的 block 所在的位置。大致思路如下：

```js
const blocks = parseMarkdown(str).blocks
const blockResults = blocks.map(lintBlock)
const result = replaceBlocks(str, blocksResult.map(
  // 意在强调主要处理的信息是处理后的结果和之前所在字符串中的位置
  ({ value, position }) => ({ value, position })
))
```

当然要想把 Markdown/HTML 语法处理好这还不算完，因为相应的 lint 规则也变得更加复杂了。举个例子，当我们处理空格的时候，希望空格始终出现在 inline mark 的外侧 (`中文 [English](a-link-here) 中文` 而不是 `中文[ English ](a-link-here)中文`)。所以对已有规则处理上的复杂度相当于是指数级增长了一倍。而且实际上到最后还需要特别添加一些针对 Markdown/HTML 语法的规则。这里我其实在过程中反复做了各种尝试和搭配组合，才变成了现在的样子。现在的规则已经相对比较稳定了。同时我也在实现类似的规则过程中逐步积累了很多 util functions。所以拜托了一些低级别的重复性问题之后，整个研发过程越往后其实会变得越清晰越简单。

#### 特殊情况处理

在设计和实现 lint 规则的过程中，自己也积累了一些心得，总体上所有的 lint 规则或选项被分为了四部分，分别对应四种需求：

- 基本规则：对空格、标点符号、超文本标记用法的基本定义。这部分规则会抽象成一个 rule。
- 特殊 case 规则：需要打破上述基本规则，但同时具有一定的领域普遍性，比如时间日期的格式、数学表达式、英文中的单引号缩写等。这部分规则也会抽象成一个 rule，但会在很小范围内做定向分析。
- 忽略个别情况：针对具体文本的具体特殊片段，采取保留原文格式的措施，比如加号前后通常是需要空格的，但在具体到 `min+gzip` 的时候，之间没有空格。针对这部分规则我们提供了一种注释语法，可以被 zhlint 识别，从而在 `join` 的时候跳过。
  - 例如上述例子，我们可以在整个被处理的文本内容的任意地方加入注释 `<!-- zhlint ignore: min+gzip -->`。
  - 除此之外，我们还支持了更复杂的通配规则，这里主要参考了一个个人觉得非常棒的 W3C 新提案：[Scroll to Text Fragment](https://github.com/WICG/ScrollToTextFragment)。我们引入了类似的语法 `[prefix-,]textStart[,textEnd][,-suffix]`。这样用户就可以更灵活的使用这一功能。
- [Hexo tag plugin](https://hexo.io/docs/tag-plugins)：在解析的过程中忽略所有 Hexo tag plugin 语法。这个更特殊一点，实际上是针对 Vue 的中文文档加上的。
  - 因为做这件事情意味着需要多个 parser 逐个调用处理，因此我在之前的 `parseMarkdown` 机制的基础上加入了 hyper parser chain 的机制，每段文本在真正运行每条 lint 规则之前，都会链式运行所有的 hyper parser。最终包括了 Markdown 解析、Hexo tag plugin 解析、还有被忽略的个别情况的注释解析。

#### 测试

这次研发过程中，我比较早，也比较严格的实践了测试驱动开发。基于 [Jest](https://jestjs.io/) 写了很多用例，通过这些用例把工具的行为“卡死”，这样当后期引入更多复杂度的时候 (比如决定重构第二版的时候、或决定支持 Markdown 格式之后)，可以通过锁住测试用例进行大胆的重构和尝试，并且在重构的时候一旦发现一些之前没有覆盖到的 edge case，就立刻补充进去，然后重构至这个 case 跑通为止再继续。久而久之整套测试用例也越来越见状。总体下来还是受益匪浅的，帮自己省了很多时间和脑细胞——上一次有这种感觉的项目是 Weex JS runtime 第一版。如一些朋友知道的，当时我们只有 2 个月时间，要从零写一个 JS 框架用在双十一移动主会场，所以除了测试用例我当时谁也没法相信。

#### 最终收尾

完成上述核心功能之后，差不多已经过去一年时间了，最后的一些工作留给了下述这些“外包装”。

- 支持 CLI 命令
- 错误报告
- 打印日志
- 构建 standalone 版本
- 发布到 npm

值得一提的是自己在打印日志的时候，想实现类似 TSC 或 Vue 3.0 模板编译的错误打印格式，即打印出错误所在的那一行代码，并且在再下一行的出错位置放一个小尖角字符 (`^`) 以方便用户定位问题，例如这是 Vue 3.0 模板编译里的效果：

```
2  |    <template key=\\"one\\"></template>
3  |    <ul>
4  |      <li v-for=\\"foobar\\">hi</li>
   |          ^^^^^^^^^^^^^^
5  |    </ul>
6  |    <template key=\\"two\\"></template>
```

但问题来到 zhlint 之后遇到了一些比较特别的问题：

1. zhlint 处理的文本多半是自然语言，每个段落的字数长短不一，所以大概率在打印的时候会折行 (相对来说代码书写长期的最佳实践是每行少于 80 个字符，所以这个问题并不明显)。设想一下如果被定位的字符在一大段话的正中间，那么再下一行的小尖角字符已经完全失去了辅助定位的作用。
2. zhlint 处理的多半是中文文本，所以这产生了另外一个问题，中英文混排的时候字符是不等宽的。所以小尖角字符之前的空格数很难算准。

为此我采取了一种不太一样的定位展示效果：

1. 不会打印一整行文本，只会取目标字符前后一段距离的字符串片段 (如前后各 20 个字符)，然后在其片段两边加入省略号。
2. 引入日志着色包 `chalk`，这样就可以为日志上色。
3. 把小尖叫符号同一行之前的空格用相同的字符串片段在此字符之前截断的部分替代，并同时设置背景色和文本色为同一个颜色 (黑色)。

所以最终看到的效果，如果把特别的着色去掉的话，看到的效果是：

```
自动在中文和English之间加入空格
自动在中文和^
```

但实际效果中第二行的“自动在中文和”是看不到的，只会看到一条黑色矩形。运气好的话，如果你的命令行背景也是黑色的，那么就完全看不出差别了。

![](https://github.com/Jinjiang/zhlint/raw/master/screenshot-cli.png)

另外一个测试的时候的小技巧，如果你不希望日志打印把测试报告搞得乱七八糟，可以结合 Jest 的环境变量判断 + 自定义 Console 对象把日志打印到别的流，然后做二次处理或直接抛掉，代码类似：

```js
let stdout = process.stdout
let stderr = process.stderr
let defaultLogger = console

// Jest env
if (global.__DEV__) {
  const fs = require('fs')
  const { Console } = require('console')
  stdout = fs.createWriteStream('./stdout.log', { encoding: 'utf-8' })
  stderr = fs.createWriteStream('./stderr.log', { encoding: 'utf-8' })
  defaultLogger = new Console({ stdout, stderr })
}

// usage
defaultLogger.log(...)
```

最后推荐几个我用到的 npm 包，如果大家想做类似的事情，可以做个参考 (当然如果你有更好的推荐也可以)：

- [chalk](https://www.npmjs.com/package/chalk)：着色打印日志
- [glob](https://www.npmjs.com/package/glob)：批量匹配文件，支持简单的通配符语法，用于批量 lint 文本文件
- [minimist](https://www.npmjs.com/package/minimist)：自动解析 CLI 的命令参数

### zhlint 的使用情况

目前 zhlint 已经集成到了 Vue 的中文文档项目中。通过[简单的 CI 配置](https://github.com/vuejs/cn.vuejs.org/pull/1079)，就可以轻松做到为每个 PR 自动 lint 并返回处理结果。

有了这个工具之后，我们就可以比较没有心智负担地批量替换文本了，替换之后运行一遍类似 `zhlint src/*.md --fix` 的命令，即可把因批量替换产生的格式问题全部修复。

然后，我就立刻完成了[对 attribute 和 property 的替换](https://github.com/vuejs/cn.vuejs.org/pull/1081)……

所以“为了批量替换两个单词的译法，我花了差不多一年的时间” (这原本是我设想的这篇文章标题党版本的标题)

之后我们在 Vue 文档中又陆续遇到了讨论 [mutation](https://github.com/vuejs/cn.vuejs.org/issues/1049)、[ref](https://github.com/vuejs/cn.vuejs.org/issues/1084) 译法的问题。产生的相应改动也都可以基于 zhlint 很容易的得以实现。

有趣的是，在我在[微博](https://www.weibo.com/1712131295/IDJsakzFq)和 [Twitter](https://twitter.com/zhaojinjiang/status/1250828817112825856) 简单分享了这个小工具之后，也有人留言说其实写博客的时候这个工具也非常有用。或许这是 zhlint 可能的更多用途吧😉！

### 最后的回顾

最后，关于心得体会和收获，我觉得有这么几个：

- 首先觉得写 parser 和 linter 是个蛮有趣的事情，有很多不一样的体验，尤其对于前端工程师来说，既熟悉 (处理字符串) 又陌生 (没有 UI，生吃字符串)。未来对 ast 相关的技术会持续自我投资。
- 测试驱动 FTW。
- 越来越少有机会真正自己从 0 到 1 做些东西出来了，很珍惜这次机会和类似的工作。
- 如果发现不对劲，及时停下来或调头。不必也不能太过纠结。在功能成型之前，永远只为最终的理想形态而努力。
- 要耐得住性子，这次做这个小工具很考验自己的性格。虽然业余时间已经很有限了，但是持之以恒，就是胜利。

另外 zhlint 其实还没有做完，我已经想到了更多的 feature 和改进点，其实也已知了不少不理想不完美不够好的地方。所以会继续做下去。

以上
