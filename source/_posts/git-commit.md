---
title: '[译]如何撰写 Git 提交信息'
date: 2017/03/20 03:28:05
updated: 2017/08/18 03:42:17
---

<mark>译自：[https://chris.beams.io/posts/git-commit/](https://chris.beams.io/posts/git-commit/)</mark>

----

![](https://imgs.xkcd.com/comics/git_commit.png)

### 介绍：为什么好的提交信息非常重要

如果你浏览任何 Git 仓库的日志，你可能会发现那些提交信息多少有些[混乱][mess]。比如，看看这些我早年提交给 Spring 的[精品](https://github.com/spring-projects/spring-framework/commits/e5f4b49?author=cbeams)：

    $ git log --oneline -5 --author cbeams --before "Fri Mar 26 2009"
    
    e5f4b49 Re-adding ConfigurationPostProcessorTests after its brief removal in r814. @Ignore-ing the testCglibClassesAreLoadedJustInTimeForEnhancement() method as it turns out this was one of the culprits in the recent build breakage. The classloader hacking causes subtle downstream effects, breaking unrelated tests. The test method is still useful, but should only be run on a manual basis to ensure CGLIB is not prematurely classloaded, and should not be run as part of the automated build.
    2db0f12 fixed two build-breaking issues: + reverted ClassMetadataReadingVisitor to revision 794 + eliminated ConfigurationPostProcessorTests until further investigation determines why it causes downstream tests to fail (such as the seemingly unrelated ClassPathXmlApplicationContextTests)
    147709f Tweaks to package-info.java files
    22b25e0 Consolidated Util and MutableAnnotationUtils classes into existing AsmUtils
    7f96f57 polishing

[呀][Yikes]，比较一下这个仓库[最近的提交](https://github.com/spring-projects/spring-framework/commits/5ba3db?author=philwebb)：

    $ git log --oneline -5 --author pwebb --before "Sat Aug 30 2014"
    
    5ba3db6 Fix failing CompositePropertySourceTests
    84564a0 Rework @PropertySource early parsing logic
    e142fd1 Add tests for ImportSelector meta-data
    887815f Update docbook dependency and generate epub
    ac8326d Polish mockito usage

你更喜欢读哪个呢？

<!--more-->

过去的信息从长度到形式都很多样；最近的信息比较简洁且一致。过去的信息是一般情况下会发生的；最近的信息绝不是[偶然][by-accident]发生。

虽然很多仓库的日志看起来像是过去的，但也有例外。Linux 内核和 Git 自身就是伟大的例子。再比如 Spring Boot 或其它由 Tim Pope 管理的仓库。

这些仓库的贡献者知道，对于一个开发同事来说 (其实对未来的[自己][selves]也是一样)，一条用心撰写的 Git 提交信息是用来沟通这则改动最好的上下文。一个 diff 会告诉你*什么*改变了，但是只有提交信息能[正确的][properly]告诉你*为什么*。Peter Hutterer 阐述得非常好：

> 重建一段代码的上下文是非常费时费力的，这是无法完全避免的。所以我们应该努力尽可能的[减少它](http://www.osnews.com/story/19266/WTFs_m)。提交信息可以帮上这个忙，也正因为此，一个提交信息反应了一名开发者是不是个好的协作者。

如果你对于创建一个伟大的提交信息还没有想过太多，那说明你可能还没有在 `git log` 及相关的工具上花费太多的时间。这里有一个[恶性][vicious]循环：因为提交历史不成体系且不一致，我们就不会花更多的时间使用和关心它。因为它得不到使用和关注，所以它就一直不成体系且不一致。

但是用心写出来的日志是美丽且实用的。`git blame`、`revert`、`rebase`、`log`、`shortlog` 以及其它子命令就是生命的一部分。回顾其他人的提交和 pull requests 变成了值得去做的事情，并且可以快速独立完成。理解最近几个月或几年为什么发生了这些事情不止是可能的并且是[高效的][efficient]。

一个项目的长期成功[靠的是][rests-on]其可维护性，以及一个拥有比项目的日志更强大的工具的维护者。这里值得花时间学习一下如何[正确的][properly]考虑它。一开始可能是个[麻烦][hassle]的东西很快会变成习惯，并且最终变成一切[投入][involved]的自豪和[产能][productivity]的源泉。

在这篇文章中，我只会[致力于][addressing]保障一个健康的提交历史的最基本要素：如何撰写一份个人提交信息。这里还有其它重要的实践比如[压缩][squashing]提交 (commit squashing) 就不是我在这里想说的。可能会为此[再][subsequent]写一篇吧。

大多数编程语言都建立了良好的编码规约，以[形成][constitutes][惯用][idiomatic]的风格，比如命名、格式化等。当然在这些编码规约中有一些[差异][variations]，但是大多数开发者赞同取其一并养成习惯好过每个人都选择自己的风格而[发生][ensues]混乱。

一个团队的提交日志方法应该是一致的。为了建立一个有用的[修订][revision]历史，团队应该首先约定一个提交信息的规约，该规约至少定义以下三方面：

**样式。**标记[句法][syntax]、缠绕边距、[语法][grammar]、[大小写][capitalization]、[标点符号][punctuation]。把这些东西都找出来，去除猜测，把规则定的尽量简单可行。最终的产出将会是[不同寻常的][remarkably]一致的日志，不只是乐于阅读，实际上也让阅读变成了一种[习惯][on-a-regular-basis]。

**内容。**提交信息的正文 (body) (如有) 应该包含什么样的信息？不应该包含什么？

**元数据。**Issue 追踪 ID、pull request 号等信息如何放进来？

幸运的是，这里有一些已经被良好建立的规约，用来创建[惯用的][idiomatic] Git 提交信息。[事实上][indeed]，有些规约中很多都是以某种 Git 命令的方式工作的。不需要你重新发明任何东西。只需遵循下面七大法则，你就可以像专家一样进行提交：

### 伟大的 Git 提交信息七大法则

> 注意：[这些](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) [法则](https://www.git-scm.com/book/en/Distributed-Git-Contributing-to-a-Project#Commit-Guidelines) [之前](https://github.com/torvalds/subsurface/blob/master/README#L82-109) [在别的地方](http://who-t.blogspot.co.at/2009/12/on-commit-messages.html) [也](https://github.com/erlang/otp/wiki/writing-good-commit-messages) [提到过](https://github.com/spring-projects/spring-framework/blob/30bce7/CONTRIBUTING.md#format-commit-messages)。

1. 用一个空行把主题和主题隔离开
2. 把主题行限制在 50 个字符以内
3. 主题行大写开头
4. 主题行不必以句号结尾
5. 在主题行中使用[祈使句][imperative]
6. 正文在 72 个字符处折行
7. 使用正文解释*是什么*和*为什么*而不是*怎么样*

比如：

    Summarize changes in around 50 characters or less
    
    More detailed explanatory text, if necessary. Wrap it to about 72
    characters or so. In some contexts, the first line is treated as the
    subject of the commit and the rest of the text as the body. The
    blank line separating the summary from the body is critical (unless
    you omit the body entirely); various tools like `log`, `shortlog`
    and `rebase` can get confused if you run the two together.
    
    Explain the problem that this commit is solving. Focus on why you
    are making this change as opposed to how (the code explains that).
    Are there side effects or other unintuitive consequences of this
    change? Here's the place to explain them.
    
    Further paragraphs come after blank lines.
    
     - Bullet points are okay, too
    
     - Typically a hyphen or asterisk is used for the bullet, preceded
       by a single space, with blank lines in between, but conventions
       vary here
    
    If you use an issue tracker, put references to them at the bottom,
    like this:
    
    Resolves: #123
    See also: #456, #789

#### 1. 用一个空行把主题和正文隔离开

在 `git commit` 的 manpage 手册中写到：

> 虽然不是必须的，但是你最好以一句少于 50 个字符的话简短概括你的改动，然后空一行，再深入描述。提交信息中空行之上的文本会被当作提交的标题，该标题在 Git 中到处都会用到。比如 Git-format-patch(1) 会把一个提交转换为一封电子邮件，它会把这个标题作为邮件的主题，其余的部分会作为邮件的正文。

首先，不是每一次提交都同时需要一个主题和一段正文。有的时候单独一行就可以了，尤其是当改动很简单没有更多必要的上下文的时候。比如：

    Fix typo in introduction to user guide

无需说更多；如果读者好奇到底修复了什么 typo，她可以通过诸如 `git show` 或 `git diff` 或 `git log -p` 简单看看改动的内容就可以了。

如果你是在命令行中提交，则很容易使用 `git commit` 的 `-m` 选项：

    $ git commit -m"Fix typo in introduction to user guide"

然而，当一个提交[值得][merits]一些解释和上下文的时候，你需要撰写正文。比如：


    Derezz the master control program
    
    MCP turned out to be evil and had become intent on world domination.
    This commit throws Tron's disc into MCP (causing its deresolution)
    and turns it back into a chess game.

带正文的提交信息并不便于通过 `-m` 选项来撰写。你最好找一个合适的文本编辑器撰写信息。如果你并没有在命令行中为 Git 设置过编辑器，那么请移步阅读 [Pro Git 的这个章节](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration)。

当你在任何情况下浏览日志的时候，都会觉得把主题从正文中分离出来是[值得的][pays-off]。这里有一整段日志：

    $ git log
    commit 42e769bdf4894310333942ffc5a15151222a87be
    Author: Kevin Flynn <kevin@flynnsarcade.com>
    Date:   Fri Jan 01 00:00:00 1982 -0200
    
     Derezz the master control program
    
     MCP turned out to be evil and had become intent on world domination.
     This commit throws Tron's disc into MCP (causing its deresolution)
     and turns it back into a chess game.

现在运行 `git log --oneline`，这个命令只会打印主题行：

    $ git log --oneline
    42e769 Derezz the master control program

或者，`git shortlog`，这个命令会把提交按照用户分组，同样出于[简洁][concision]的考虑只会打印主题行：

    $ git shortlog
    Kevin Flynn (1):
          Derezz the master control program
    
    Alan Bradley (1):
          Introduce security program "Tron"
    
    Ed Dillinger (3):
          Rename chess program to "MCP"
          Modify chess program
          Upgrade chess program
    
    Walter Gibbs (1):
          Introduce protoype chess program

在 Git 里还有一些其它的情况下，会[区分][distinction]主题行和正文——但是如果没有它们中间的空行的话是不会[正常][properly]工作的。

#### 2. 把主题行限制在 50 个字符以内

50 个字符并不是一个严格的限制，只是个[经验之谈][rule-of-thumb]。保持主题行的长度以确保它可读且促使作者考虑一下最[简略][concise]的表达方式足矣。

> 提示：如果你做总结很艰难，你可能是一次性提交太多东西了。把原子提交从中剥离出来吧 (每个主题是一个独立的提交)。

GitHub 的 UI 都会提醒这些规约。如果你输入超过 50 个字符的限制，它会警告：

![gh1](https://i.imgur.com/zyBU2l6.png)

而且会主题行超过 75 个字符的部分会被截断，留下一个省略号：

![gh2](https://i.imgur.com/27n9O8y.png)

所以奔着 50 个字符去写，但是 72 个字符是底线。

#### 3. 主题行大写开头

如题。比如：

* Accelerate to 88 miles per hour

而不是：

* accelerate to 88 miles per hour

#### 4. 主题行不必以句号结尾

主题行结尾的标点[符号用法][punctuation]不是必要的。而且，当你打算控制在 50 个字符以内时，连空格都是[很宝贵的][precious]。比如：

* Open the pod bay doors

而不是：

* Open the pod bay doors.

#### 5. 在主题行中使用[祈使句][imperative]

*[祈使句][imperative]*就是指“说起来或写起来像是在发号施令”。举几个例子：

* Clean your room
* Close the door
* Take out the trash

其实这七大法则的每一条读起来都是[祈使句][imperative]的 (“正文在 72 个字符处折行”等)。

[祈使句][imperative]听起来有一点粗鲁；这也是我们为什么不常用它的原因。但是这非常适合写在 Git 提交的主题行中。其中一个的原因就是 **Git 本身就是根据你的意志[命令式][imperative]的创建一个提交的**。

例如，使用 `git merge` 的默认信息读起来是这样的：

    Merge branch 'myfeature'

而用 `git revert` 的时候是：

    Revert "Add the thing with the stuff"
    
    This reverts commit cc87791524aedd593cff5a74532befe7ab69ce9d.

再或者在一个 GitHub pull request 上点击“Merge”按钮时：

    Merge pull request #123 from someuser/somebranch

所以当你以[祈使句][imperative]撰写你的提交信息时，你遵循了 Git 自己内建的规约。比如：

* Refactor subsystem X for readability
* Update getting started documentation
* Remove deprecated methods
* Release version 1.0.0

这样撰写一开始会觉得有点[怪怪的][awkward]。我们更多的在说话的时候使用[陈述句][indicative]来陈述事实。这是为什么提交信息经常读起来像：

* Fixed bug with Y
* Changing behavior of X

有的时候提交信息写起来像是对于其内容的描述：

* More fixes for broken stuff
* Sweet new API methods

为了避免混淆，这里有一个简单原则，可以用在每一个地方。

**一个 Git 提交的主题行的准确的格式应该始终完全遵循下面的句式：**

* If applied, this commit will *这里是你的主题行*

比如：

* If applied, this commit will *refactor subsystem X for readability*
* If applied, this commit will *update getting started documentation*
* If applied, this commit will *remove deprecated methods*
* If applied, this commit will *release version 1.0.0*
* If applied, this commit will *merge pull request #123 from user/branch*

注意[非祈使句][non-imperative]在这里别扭的地方：

* If applied, this commit will *fixed bug with Y*
* If applied, this commit will *changing behavior of X*
* If applied, this commit will *more fixes for broken stuff*
* If applied, this commit will *sweet new API methods*

> 注意：使用祈使句只在主题行中至关重要。当你撰写正文的时候就可以放下这些限制了。

#### 6. 正文在 72 个字符处折行

Git 不会自动给文本折行。当你为一个提交撰写消息正文的时候，你必须意识到它正确的边距，并且手动折行。

这里推荐在 72 个字符处折行，这样 Git 有足够的空间，即便缩进文本也可以保证所有东西在 80 个字符以内。

一个好的文本编辑器是可以帮上忙的。比如在 Vim 中配置在 Git 提交的 72 个字符处折行非常容易。然而传统的 IDE 在给提交信息文本折行方面提供的智能支持[很糟糕][terrible] (尽管 IntelliJ IDEA 在最近的版本中终于在这方面做得好一些了)。

#### 7. 使用正文解释是什么和为什么而不是怎么样

这个[来自比特币核心的提交](https://github.com/bitcoin/bitcoin/commit/eb0b56b19017ab5c16c745e6da39c53126924ed6)是一个非常好的解释改动是什么和为什么的例子：

    commit eb0b56b19017ab5c16c745e6da39c53126924ed6
    Author: Pieter Wuille <pieter.wuille@gmail.com>
    Date:   Fri Aug 1 22:57:55 2014 +0200
    
       Simplify serialize.h's exception handling
    
       Remove the 'state' and 'exceptmask' from serialize.h's stream
       implementations, as well as related methods.
    
       As exceptmask always included 'failbit', and setstate was always
       called with bits = failbit, all it did was immediately raise an
       exception. Get rid of those variables, and replace the setstate
       with direct exception throwing (which also removes some dead
       code).
    
       As a result, good() is never reached after a failure (there are
       only 2 calls, one of which is in tests), and can just be replaced
       by !eof().
    
       fail(), clear(n) and exceptions() are just never called. Delete
       them.

看一眼[完整的 diff](https://github.com/bitcoin/bitcoin/commit/eb0b56b19017ab5c16c745e6da39c53126924ed6)，想一下作者此时此刻通过提供这样的上下文为同事以及未来的提交者节省了多少时间。如果他不这样做，这些信息可能永远找不回来了。

在很多情况下，你可以[忽略][leave-out]这个改动发生时的各种细节。从这个角度看，代码自己会说话 (如果代码很复杂以至于需要长篇大论的解释，那也是代码注释该做的事情)。请首先专注于弄清你产生这个改动的理由——改动前的工作方式，改动后的工作方式 (以及这样做哪里不对)，以及为什么你决定以这样的方式解决问题。

你将来某一天维护它的时候也许会感激今天的你！

### 提示

#### 学着爱上命令行。远离 IDE。

[和 Git 子命令同样多的原因][For-as-many-reasons-at-there-are-Git-subcommands]，拥抱命令行是[明智][wise]的。Git 是[超级][insanely]强大的；IDE 也一样，但是套路不同。我每天都使用 IDE (IntelliJ IDEA) 也用过[很多][extensively]其它的 (Eclipse)，但是我从未见到 IDE 对 Git 的集成能够配得上命令行的易用和强大 (一旦你意识到这一点)。

某些 Git 相关的 IDE 功能是[非常宝贵的][invaluable]，比如当你删除一个文件时调用 `git rm`、当你重命名一个文件时完成相应的 `git` 命令。但是当你尝试提交、合并、rebase、或通过 IDE 做[复杂的][sophisticated]历史分析时，事情就[分崩离析][falls-apart]了。

当你想[发挥出][wielding] Git 全部的能量的时候，命令行始终是不二之选。

记住不论你是用的是 Bash 还是 Z shell，都有 [tab 补全脚本](http://git-scm.com/book/en/Git-Basics-Tips-and-Tricks)减轻忘记子命令和开关的痛苦。

#### 阅读 Pro Git

[Pro Git](http://git-scm.com/book) 这本书已经可以免费在线阅读，这本书非常棒。[用好它吧][take-advantage]！

[mess]: http://dict.cn/mess
[Yikes]: http://dict.cn/Yikes
[by-accident]: http://dict.cn/by%20accident
[selves]: http://dict.cn/selves
[properly]: http://dict.cn/properly
[vicious]: http://dict.cn/vicious
[efficient]: http://dict.cn/efficient
[rests-on]: http://dict.cn/rest%20on
[hassle]: http://dict.cn/hassle
[involved]: http://dict.cn/involved
[productivity]: http://dict.cn/productivity
[addressing]: http://dict.cn/addressing
[squashing]: http://dict.cn/squashing
[subsequent]: http://dict.cn/subsequent
[constitutes]: http://dict.cn/constitutes
[idiomatic]: http://dict.cn/idiomatic
[variations]: http://dict.cn/variations
[ensues]: http://dict.cn/ensues
[revision]: http://dict.cn/revision
[syntax]: http://dict.cn/syntax
[grammar]: http://dict.cn/grammar
[capitalization]: http://dict.cn/capitalization
[punctuation]: http://dict.cn/punctuation
[remarkably]: http://dict.cn/remarkably
[on-a-regular-basis]: http://dict.cn/on%20a%20regular%20basis
[idiomatic]: http://dict.cn/idiomatic
[indeed]: http://dict.cn/indeed
[imperative]: http://dict.cn/imperative
[merits]: http://dict.cn/merits
[pays-off]: http://dict.cn/pay%20off
[concision]: http://dict.cn/concision
[distinction]: http://dict.cn/distinction
[properly]: http://dict.cn/properly
[rule-of-thumb]: http://dict.cn/rule%20of%20thumb
[concise]: http://dict.cn/concise
[punctuation]: http://dict.cn/punctuation
[precious]: http://dict.cn/precious
[imperative]: http://dict.cn/imperative
[awkward]: http://dict.cn/awkward
[indicative]: http://dict.cn/indicative
[non-imperative]: http://dict.cn/imperative
[terrible]: http://dict.cn/terrible
[leave-out]: http://dict.cn/leave%20out
[wise]: http://dict.cn/wise
[insanely]: http://dict.cn/insanely
[extensively]: http://dict.cn/extensively
[invaluable]: http://dict.cn/invaluable
[sophisticated]: http://dict.cn/sophisticated
[falls-apart]: http://dict.cn/fall%20apart
[wielding]: http://dict.cn/wielding
[take-advantage]: http://dict.cn/take%20advantage
[For-as-many-reasons-as-there-are-Git-subcommands]: https://translate.google.com/#en/zh-CN/For%20as%20many%20reasons%20as%20there%20are%20Git%20subcommands
