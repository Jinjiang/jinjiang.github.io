---
title: '[翻译] JSLint 文档'
date: 2013/02/17 03:04:46
updated: 2013/02/17 03:07:14
tags:
- jslint
- 翻译
---

原文地址：[http://www.jslint.com/lint.html](http://www.jslint.com/lint.html)

### 什么是`JSLint`？

`JSLint` 是一个用来查找各种 JavaScript 程序中的问题的 JavaScript 程序。它是一个代码之类工具。

在[早些年](http://cm.bell-labs.com/cm/cs/who/dmr/chist.html)的 [C 语言](http://en.wikipedia.org/wiki/C_programming_language)中，有些程序的常见错误是主流的编译器无法抓住的。所以出现了一个名叫 [`lint`](http://en.wikipedia.org/wiki/Lint_programming_tool) 的附带程序，可以通过搜索源文件寻找错误。

随着语言的成熟，其定义的健壮性足以消除一些不安因素，编译器也在问题警告方面越做越好，`lint` 也不再需要了。

[JavaScript](http://javascript.crockford.com/) 是一个年轻的语言。它原本只是用在网页上完成一些无需劳驾 Java 的小任务。但 JavaScript 是一个强大得惊人的语言，现在它已经在大项目中派上用场了。当项目变得复杂之后，之前从易用角度出发的语言特性就带来了一些麻烦。这是一个为 JavaScript 而生的 `lint` 呼之欲出：它就是 `JSLint`，一个检查 JavaScript 语法、判断 JavaScript 语法有效性的工具。

`JSLint` 会拿来一段 JavaScript 源代码并对其进行检索。一旦发现问题，它就会返回一则消息，用来描述这个问题以及源代码中的大概位置。发现的问题不一定是，但通常是语法上的错误。`JSLint` 通过一些代码规范来杜绝结构性的问题。这并不证明你的程序是正确的，只是提供另一种发现问题的眼光。

`JSLint` 定义了一个专业的 JavaScript 的子集，它比 [ECMAScript 标准第三版](http://www.ecma-international.org/publications/standards/Ecma-262.htm)的定义更严格，和 [JavaScript 编码规范](http://javascript.crockford.com/code.html)中的建议相对应。

JavaScript 是一个粗中有细的语言，它比你想象中的更好。`JSLint` 帮助你回避很多问题，在这个更好的语言中撰写程序。`JSLint` 会拒绝一些浏览器支持的程序，因为浏览器并不关心代码的质量。你应该接受 `JSLint` 的所有建议。

`JSLint` 在 JavaScript 源代码、HTML 源代码、CSS 源代码或 [JSON](http://www.json.org/) 文本中都可以运行。<!--more-->

### 全局变量

JavaScript 的最大问题就是其依赖的全局变量，特别隐含的全局变量。如果一个变量没有被显性的声明 (通常是通过 `var` 语句)，则 JavaScript 会假定这个变量是全局变量。这会掩盖拼写错误等其它问题。

`JSLint` 希望所有的变量和函数都要在使用或调用之前被声明。这样我们就可以探测隐含着的全局变量。同时，这也让程序的可读性增强了。

有的时候一个文件会依赖于在别处定义好的全局变量或全局函数。这时你可以通过一个 `var` 语句让 `JSLint` 识别该程序依赖的这些全局函数和对象。

一个全局声明大概如下所示：

    var getElementByAttribute, breakCycles, hanoi;

该声明应该出现在靠近文件最上方的位置，且必须出现在使用这些变量之前。

同时，我们有必要在一个变量被赋值之前通过 `var` 语句对其进行声明。

`JSLint` 同样可以识别一段 `/*global*/` 指令，该指令可以为 `JSLint` 注明在该文件中使用但在其它文件中定义好的变量。该指令可以包含一串变量名，用逗号隔开。每个名字可以跟随一个可选的冒号以及 `true` 或 `false`，`true` 表示该变量可以被该文件赋值，而 `false` 则表示该变量不能被赋值 (这是默认行为)。在函数作用域也是如此。

有些全局变量可以被你预定义。选择*假设为浏览器* (`browser`) 选项可以预定义浏览器提供的标准的全局属性，比如 `document` 和 `addEventListener`。它等同于：

    /*global clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false */

选择*假设为 Node.js* (`node`) 选项可以预定义 Node.js 环境下的全局变量。它等同于：

    /*global Buffer: false, clearInterval: false, clearTimeout: false, console: false, exports: false, global: false, module: false, process: false, querystring: false, require: false, setInterval: false, setTimeout: false, __filename: false, __dirname: false */

选择*假设为 Rhino* (`rhino`) 选项可以预定义 Rhino 环境下的全局属性。它等同于：

    /*global defineClass: false, deserialize: false, gc: false, help: false, load: false, loadClass: false, print: false, quit: false, readFile: false, readUrl: false, runCommand: false, seal: false, serialize: false, spawn: false, sync: false, toint32: false, version: false */

选择*假设为 Windows* (`windows`) 选项可以预定义 Microsoft Windows 提供的全局属性。它等同于：

    /*global ActiveXObject: false, CScript: false, Debug: false, Enumerator: false, System: false, VBArray: false, WScript: false, WSH: false */

### 分号

JavaScript 使用近似于 C 语言的语法，它要求使用分号来分割确定的语句。JavaScript 试图通过一个自动插入分号的机制让这些分号变得可有可无。这是比较危险的，因为它可以掩盖你的错误。

和 C 一样，JavaScript 有 `++` 和 `--` 和 `(` 操作符，这些操作符可以作为前缀或后缀。分号可以用来消除这里的二义性。

在 JavaScript 中，一个折行可以是一个空格，也可以当做分号使用，两者容易产生混淆。

`JSLint` 希望除了 `for`、`function`、`if`、`switch`、`try`和`while`，每个语句都以 `;` 结尾。同时 `JSLint` 不希望看到没有必要的分号或空白语句。

### 逗号

我们可以用逗号操作符写出极度巧妙的表达式。同时也可以掩盖一些程序上的错误。

`JSLint` 希望逗号只用来当做分隔符，而不是操作符 (`for` 语句中的初始化部分和自增部分除外)。数组直接量里不希望有被省略的元素，多余的逗号不应该被使用，逗号不应该出现在数组直接量或对象直接量的最后一个元素的后面，因为一些浏览器无法正常识别。

### 作用域

在很多语言中，每个块都产生一个作用域，块内产生的变量在块外是看不到的。

在 JavaScript 中，块并不产生新的作用域，只有函数作用域。在一个函数中任意位置声明的变量都在整个函数中可见。JavaScript 的块混淆了有经验的程序员，并导致了错误的出现，因为用相似的语法做了一个错误的承诺。

`JSLint` 希望 `function`、`if`、`switch`、`while`、`for`、`do` 和 `try` 语句之外不要产生其它块。

在有块级作用域的语言里，通常都推荐变量声明在第一次使用的地方。但是因为 JavaScript 没有块级作用域，所以明智的选择就是在函数的最顶端声明所有的函数变量。这里推荐每个函数用单一的一个 `var` 语句完成变量声明。这个要求可以通过 `vars` 选项取消掉。

### 必要的块

`JSLint` 希望 `if`、`while`、`do` 和 `for` 语句都由块生成，`{` 也就是说，语句是被大括号包住的 `}`。

JavaScript 允许一个 `if` 语句这样书写：

<pre>if (<i>condition</i>) <i>statement</i>;</pre>

这个格式是公认的：当很多程序员都基于相同的代码工作时，会给整个项目带来很多错误。这也是为什么 `JSLint` 希望如下使用块：

<pre>if (<i>condition</i>) { <i>statement</i>; }</pre>

经验告诉我们这个格式更保险一些。

### 表达式语句

我们希望一个表达式语句是一个赋值或一个函数/方法调用或 `delete`。其它表达式语句都可能导致错误。

### `for` `in`

`for` `in` 语句允许在一个对象的所有属性名内进行循环。[不幸的是，这样的循环也会覆盖到其原型链中所有被继承而来的属性。](http://yuiblog.com/blog/2006/09/26/for-in-intrigue/)其副作用就是当我们只关心数据的时候，它连方法函数也会处理一遍。如果此时该程序没有任何预防措施，那么就会导致失败。

每个 `for` `in` 语句的主体部分都应该包裹一个起过滤效果的 `if` 语句。该语句可以选择特殊类型或范围的值、或排除函数类型的属性、或排除原型的属性。比如：

    for (name in object) { if (object.hasOwnProperty(name)) { .... } }

### `switch`

一个 `switch` 语句中[常见的错误](http://yuiblog.com/blog/2007/04/25/id-rather-switch-than-fight/)就是忘记在每个条件的结尾写上 `break` 语句，导致程序没有及时跳走。`JSLint` 希望语句的下一个 `case` 之前或 `default` 之前必须有下面三个当中的一个：`break`、`return`、`throw`。

### `var`

JavaScript 允许 `var` 在一个函数内的任何位置完成定义。`JSLint` 的要求则会更严格一些。

`JSLint` 希望一个 `var` 只被声明一次，并且是在使用之前被声明。

`JSLint` 希望一个 `function` 在使用之前被声明。

`JSLint` 希望函数的参数不要被声明为变量。

`JSLint` 不希望 `arguments` 数组被声明为 `var`。

`JSLint` 不希望一个变量被定义在块中。这是因为 JavaScript 的块并不具有块级作用域。这会造成意料之外的结果。把所有的变量都定义在函数的最顶部。

### `with`

`with` 语句的初衷是提供一个访问对象嵌套属性的简写方式。不幸的是，当我们设置新属性时这个行为[非常糟糕](http://yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/)。永远不要使用 `with` 语句。请用一个 `var` 替代之。

### `=`

`JSLint` 不希望看到 `if`、`for`、`while` 或 `do` 语句的条件判断中出现赋值语句。这是因为似乎：

    if (a = b) { ... }

的本意是：

    if (a == b) { ... }

当我们难以从常用语句中察觉出明显的错误时，是很难把程序写对的。

### `==` 和 `!=`

`==` 和 `!=` 操作会在比较之前做类型转换。这是不提倡的，因为它导致 `' \t\r\n' == 0` 的结果是 `true`。这会掩盖一些类型错误。`JSLint` 无法依赖 `==` 进行判断，所以最好别再使用  `==` 和 `!=` 了，以后都用更可靠的 `===` 和 `!==` 操作替代之。

如果你只是在乎一个值是*真的*还是*假的*，那么可以使用简写方式，比如把：

    (foo != 0)

替换为：

    (foo)

而将：

    (foo == 0)

替换为：

    (!foo)

我们有一个 `eqeq` 选项，允许使用 `==` 和 `!=`。

### 标签 (labels)

JavaScript 允许任何语句拥有标签，标签拥有各自的命名空间。`JSLint` 的要求会更严格。

`JSLint` 希望标签只出现在响应 `break`、`swtich`、`while`、`do` 和 `for` 的语句上。`JSLint` 希望标签可以同变量和参数区分开来。

### 无法到达的代码

`JSLint` 希望一个 `return`、`break`、`continue` 或 `throw` 语句后面都会跟着一个 `}` 或 `case` 或 `default`。

### 混乱的加号减号

`JSLint` 希望 `+` 不会紧跟着 `+` 或 `++`，而 `-` 不会紧跟着 `-` 或 `--`。少写一个空格就会把 `+ +` 变成 `++`，这种错误是很难被发现的。为了避免混乱，请善用括号。

### `++` 和 `--`

自增操作符 `++` 和自减操作符 `--` 是公认的会鼓励过度使用技巧而导致糟糕的代码。它们是导致病毒和安全威胁的错误构建。同样的，乱用前自增和后自增会产生 off-by-one 的错误，排查这样的错误是极为困难的。我们有一个 `plusplus` 选项来允许使用这些操作符。

### 位操作符

JavaScript 没有整数类型 (*)，但是其具备位操作符。位操作符会先把操作对象由浮点数转换回整数，所以这样的位操作效率远不及 C 或其它语言。位操作符极少用在浏览器应用里。与逻辑操作符的相似性也会掩盖一些程序的错误。`bitwise` 选项允许使用 `<<`、`>>`、`>>>`、`~`、`&`、`|` 这些操作符。

### `eval` 是魔鬼

`eval` 函数 (及其相似的 `Function`、`setTimeout` 和 `setInterval`) 提供了 JavaScript 编译器的访问形式。这在一些情况下是有必要的，但是在大多数情况下它代表了相当糟糕的代码。`eval` 函数是 JavaScript 最不应该被使用的特性。

### `void`

在大多数近似于 C 的语言中，`void` 是一个类型。在 JavaScript 中，`void` 是一个前缀操作符，它总是返回 `undefined`。`JSLint` 不希望看到 `void` 因为它具有迷惑性且没有实质的用处。

### 正则表达式

正则表达式写起来既简洁又神秘。`JSLint` 会检测一些可能导致可移植性问题的问题。同时会推荐把具有视觉混淆性质的字符全部转义。

JavaScript 语法中，正则表达式直接量会多写一对 `/` 字符。为了避免混淆，`JSLint` 希望一个正则表达式字面量的开头是一个 `(` 或 `=` 或 `:` 或 `,` 字符。

### 构造函数和 `new`

构造函数是设计为通过 `new` 前缀使用的函数。`new` 前缀基于函数的 `prototype` 创建一个新的对象，并把函数隐性提供的 `this` 参数绑定到那个对象。如果你忽略了 `new` 前缀的使用，则不会有新的对象被创建，而 `this` 则会绑定到全局对象上。这是[非常严重的错误](http://yuiblog.com/blog/2006/11/13/javascript-we-hardly-new-ya/)。

`JSLint` 强制规范构造函数的函数名大写开头。`JSLint`不希望看到一个函数调用的函数名是大写开头但没有 `new` 前缀。`JSLint` 也不希望看到 `new` 前缀用在一个函数名不是大写开头的函数上。这一要求可以通过 `newcap` 选项关掉。

`JSLint` 不希望看到 `new Number`、`new String`、`new Boolean` 的包裹形式。

`JSLint` 不希望看到 `new Object`，用 `{}` 替换之。

`JSLint` 不希望看到 `new Array`，用 `[]` 替换之。

### 属性

因为 JavaScript 是个弱类型动态对象语言，所以不太可能在编译的时候判定一个属性名是否拼写正确。`JSLint` 在这方面提供了一些帮助。

在其报告的最底端，`JSLint` 显示了一个 `/*properties*/` 指令。它包含了一些名称和字符串直接量，它们是所有使用过的点标记、下标标记和对象直接量中用来命名对象属性的。你可以查阅这个列表来找到拼错的词。这是个比较简单的办法。

你还可以复制 `/*properties*/` 指令到你的脚本文件的顶端。`JSLint` 会根据这个列表检查所有的属性名。这样，你就可以使用 `JSLint` 检查拼写错误了。

比如：

    /*properties charAt, slice */

### 不安全字符

有一些字符是不同的浏览器显示起来不一致的，在放入字符串之前必须先转义。

    \u0000-\u001f \u007f-\u009f \u00ad \u0600-\u0604 \u070f \u17b4 \u17b5 \u200c-\u200f \u2028-\u202f \u2060-\u206f \ufeff \ufff0-\uffff

### 不检查的内容

`JSLint` 不会做流程分析，也不会判断变量在使用之前是否已经被赋值。这是因为变量都有默认值 (`undefined`)，很多应用本身就是这样处理的。

`JSLint` 不会做任何类型的全局分析，不会尝试判断伴随 `new` 使用的函数是真正的构造函数 (只是遵循大小写规范)，不会检查属性名拼写是否正确 (只是针对 `/*properties*/` 指令进行匹配)。

### HTML

`JSLint` 可以处理 HTML 文本。它可以找到包含在 `<script>` ... `</script>` 标签中的 JavaScript 内容。也可以通过 JavaScript 找到 HTML 内容中公认的问题：

* 所有的标签必须小写。
* 所有的标签必须闭合 (比如 `</p>`)。
* 所有的标签必须正确的嵌套
* 必须用实体 `&lt;` 表示字面量 `>`。

`JSLint` 比 XHTML 的要求要低，但是比主流浏览器的要求要严格。

`JSLint` 也会检查 `'</'` 在字符串字面量的出现情况，你应该用 `'<\/'` 替换之。额外的反斜杠会被 JavaScript 编译器忽略掉，但 HTML 解析器不会。类似的技巧都不是必要的，但就是这样。

这里有一个 `fragment` 选项，用来检查一个合格的 HTML 片段。如果 `adsafe` 选项也选用，则片段必须是一个遵守 [ADSafe](http://www.adsafe.org/) widget 规则的 `<div>`。

### CSS

`JSLint` 可以检查 CSS 文件。它检查 CSS 文件的第一行是不是：

    @charset "UTF-8";

这个特性是试验性的。请把任何问题或束缚报告出来。这里有一个 `css` 选项，可以容忍一些非标准的使用习惯。

### 选项

`JSLint` 提供了很多选项，它们控制了其操作和敏感度。在网页版中，选项是可以通过复选框进行勾选的。

我们还提供了通过构造 `/*jslint*/` 指令和 `/*properties*/` 指令的方式进行辅助。

当 `JSLint` 被当做函数调用时，它接受一个 `option` 对象参数，这个参数允许你判定你可接受的 JavaScript 子集。网页版的 `JSLint` 在 [http://www.JSLint.com](http://www.jslint.com)，就是这样工作的。

选项还可以在 `/*jslint*/` 指令中被定义：

    /*jslint nomen: true, debug: true, evil: false, vars: true*/

选项指令起始于 '/*jslint'。注意 `j` 前面没有空格。本规范包含了一系列的键值对，这些键是 `JSLint` 的选项，值是 `true` 或 `false`。`indent` 选项可以取一个数字。一个 `/*jslint*/` 指令优先于 `option` 对象。指令遵照函数作用域。

(表格略，详见：[http://www.jslint.com/lint.html#options](http://www.jslint.com/lint.html#options))

### 报告

如果 `JSLint` 可以完成检查，那么它会生成一个函数报告。其列出下面每个函数：

* 起始行号。
* 名称。如果是匿名函数，`JSLint` 会“猜”出这个名称。
* 参数。
* *Closure*：被声明的变量和参数之中，被子函数使用的部分。
* *Variables*：被声明并只在该函数中使用的变量。
* *Exceptions*：被 try 语句声明的变量。
* *Unused*：被声明但从未在该函数中使用的变量。这可能意味着一个错误。
* *Outer*：被其它函数声明且在该函数中使用的变量。
* *Global*：在该函数中使用的全局变量。把这个用量降到最少。
* *Label*：该函数中使用的语句标记。

报告还会包含一个使用过的属性名列表。这里是[`JSLint`的消息列表](http://www.jslint.com/msgs.html)。