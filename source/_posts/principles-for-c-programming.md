---
title: '[译]C 程序的原则'
date: 2017/03/19 04:48:07
updated: 2017/03/19 05:07:11
---

<mark>译自：[Principles for C programming](https://drewdevault.com/2017/03/15/How-I-learned-to-stop-worrying-and-love-C.html)</mark>

按照 Doug Gwyn 的话说：“Unix 不会阻止你做愚蠢的事情，因为那会同样阻止你做聪明的事情”。C 是一个非常强大的工具，但使用它的时候需要非常小心和[自律][discipline]。学习这些纪律是绝对值得的，因为 C 是所有程序语言中最优秀的。一个自律的 C 程序员将会……

**喜欢可维护性**。不要在不必要的地方自作聪明。取而代之的是，找出最简单最易懂的满足需求的方案。诸如性能之类考量是放在第二位的。你应该为你的代码做一个性能预算，并自在的支配它。

随着你对这门语言越来越[了解][proficient]，掌握了越来越多能够从中获益的特性，你也应该学会什么时候不能使用它们。相比用到了很多新奇的方式去解决问题，易于[新手][novice]理解是更重要的。最好是让一个新手理解你的代码并从中有所收获。像你[大概][circa]去年就在维护它一样去撰写代码。

**避免使用魔法**。不要使用宏 (macros)——尽管用它定义常量是没问题的。不要使用 typedef 来隐藏指针或回避撰写“结构”。避免撰写复杂的抽象。保持你的构建系统简单透明。不要因为一个愚蠢的 hacky 的[废物][crap]解决问题的方式酷炫就使用它。你的代码在行为[之下][underlying]应该是明显的，甚至不需要上下文。

C 最大的优势之一就是透明和简单。这应该被信奉，而不是被[颠覆][subverted]。但是 C 的优良传统是给你足够的空间施展自己，所以你可以为了一些魔术般的目的使用它。但最好还是不要这样，做个[麻瓜][muggle]挺好的。

**辨识并回避危险的模式**。不要使用固定尺寸的 buffers (有人指出这种说法并不是完全正确。我之前打草稿的时候提到了这些，但还是删掉了)——始终计算你需要分配的空间。阅读你使用的函数的 man 手册并掌握他的成功有出错模式。立刻把不安全的用户输入转换为[干净][sanitized]的 C 结构。如果你之后会把这些数据展现给用户，那么尽可能把 C 结构保持到最后。要学会在使用例如 strcat 的敏感函数时多加留意。

撰写 C 有的时候像握着一把枪。枪是很重要的工具，但是和枪有关的事故都是非常糟糕的。你对待枪要非常小心：不要用枪指着任何你喜爱的东西，要有好的用枪[纪律][discipline]，把它当作始终上膛一样谨慎。而就像枪善于拿来打孔一样，C 也善于用来撰写内核。

**用心组织代码。**永远不要把代码写到 header 里。永远不要使用 `inline` 关键字。把独立的东西分开写成不同的文件。[大量][liberally]使用静态方法组织你的逻辑。用一套编码规范让一切都有足够的[空间][breathing-room]且易于阅读。当目的[显而易见][self-evident]的情况下使用单字符变量名，反之则使用[描述性][descriptive]的变量名。

我喜欢把我的代码组织成目录，每个目录实现一组函数，每个函数有属于自己的文件。这些文件通常会包含很多静态函数，但是它们全部用于组织这个文件所要实现的行为。写一个 header 允许这个模块被外部访问。并使用 Linux 内核编码规范，[该死][god-dammit]。

**只使用标准的特性**。不要把平台假设为 Linux。不要把编译器假设为 gcc。不要把 libc 假设为 glibc。不要把架构假设为 x86 的。不要把核心工具假设为 GNU。不要定义 `_GNU_SOURCE`。

如果你一定要使用平台相关的特性，为这样的特性描述一个接口，然后撰写各自平台相关的支持代码。在任何[情况][circumstances]下都不要使用 gcc 扩展或 glibc 扩展。GNU 是[枯萎的][blight]，不要让它[传染][infect]到你的代码。

**使用[严谨][disciplined]的工作流**。也要有严谨的版本控制方法。撰写提交记录的时候要[用心][thoughtful]——在第一行简短解释变动，然后在扩展提交记录中加上改变它的[理由][justification]。在 feature 分支上工作要明确定义目标，不要包含和这个目标不相关的改动。不要害怕在 rebase 时编辑你的分支的历史，它会让你的改动展示得更清晰。

当你稍后不得不回退你的代码时，你将会感激你之前详尽撰写的提交记录。其他人和你的代码互动时也同样会心存感激。当你看到一些愚蠢的代码时，也可以知道这个[白痴][bastard]当时是怎么想的，尤其是当这个[白痴][bastard]是你自己的时候。

**严格测试和[回顾][review]**。找出你的改动可能会经过的代码路径。测试每条路径的行为是正确的。给它不正确的输入。给它“永远不可能发生”的输入。对[有错误倾向][error-prone]的模式格外小心。寻找可以简化代码的地方并让过程变得更清晰。

接下来，把你的改动交给另外一个人进行[回顾][review]。这个人应该运用相同的程序并签署你的改动。而且[回顾][review]要[严格][discipline]，标准始终如一。[回顾][review]的时候应该想着，如果由于这些代码出了问题，自己会[感到耻辱][be-your-ass-on-the-line]。

**从错误中学习**。首先，修复 bug。然后，修复实际的 bug：你的流程允许里这个错误的发生。拉[回顾][reviewer]你代码的人讨论——这是你们共同的过错。严格的检查撰写、[回顾][review]和部署这些代码的流程，找出[根源][root-cause]所在。

解决方案可以简单，比如把 strcat 加入到你的触发“认真回顾”[条件反射][reflex]的函数列表。它可以通过电脑进行静态分析，帮你检测到这个问题。可能这些代码需要[重构][refactored]，这样找出问题变得简单容易。疏于避免未来的[错误][fuck-up]才是真的[大错][fuck-up]。

----

重要的是记住规则就是用来打破的。可能有些情况下，不被鼓励的行为是有用的，被鼓励的行为是应该[被忽视的][disregarded]。你应该[力争][strive]把这些情况当作例外而不是[常态][norm]，并当它们发生时仔细的[证明][justify]它们。

C 是狗屎。我爱它，并希望更多的人可以学到我做事的方式。祝好运！

[bastard]: http://dict.cn/bastard
[be-your-ass-on-the-line]: http://dict.cn/be%20your%20ass%20on%20the%20line
[blight]: http://dict.cn/blight
[breathing-room]: http://dict.cn/breathing%20room
[circa]: http://dict.cn/circa
[circumstances]: http://dict.cn/circumstances
[crap]: http://dict.cn/crap
[descriptive]: http://dict.cn/descriptive
[discipline]: http://dict.cn/discipline
[disciplined]: http://dict.cn/discipline
[disregarded]: http://dict.cn/disregarded
[error-prone]: http://dict.cn/error-prone
[fuck-up]: http://dict.cn/fuck-up
[god-dammit]: http://dict.cn/god%20dammit
[infect]: http://dict.cn/infect
[justification]: http://dict.cn/justification
[justify]: http://dict.cn/justify
[liberally]: http://dict.cn/liberally
[muggle]: http://dict.cn/muggle
[norm]: http://dict.cn/norm
[novice]: http://dict.cn/novice
[proficient]: http://dict.cn/proficient
[refactored]: http://dict.cn/refactored
[reflex]: http://dict.cn/reflex
[review]: http://dict.cn/review
[reviewer]: http://dict.cn/review
[root-cause]: http://dict.cn/root%20cause
[sanitized]: http://dict.cn/sanitized
[self-evident]: http://dict.cn/self-evident
[strive]: http://dict.cn/strive
[subverted]: http://dict.cn/subverted
[thoughtful]: http://dict.cn/thoughtful
[underlying]: http://dict.cn/underlying
