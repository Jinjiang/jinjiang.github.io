---
title: 'Git 分支的最佳实践'
date: 2014/01/01 11:59:23
updated: 2014/10/15 05:40:07
---

译自：[A successful Git branching model &raquo; nvie.com](http://nvie.com/posts/a-successful-git-branching-model/)

----

本文将展示我一年前在自己的项目中成功运用的开发模型。我一直打算把这些东西写出来，但总是没有抽出时间，现在终于写好了。这里介绍的不是任何项目的细节，而是有关分支的策略以及对发布的管理。

![](http://nvie.com/img/git-model@2x.png)

在我的演示中，所有的操作都是通过 git 完成的。

<!--more-->

### 为什么选择 git ？

为了了断 git 和中心源代码控制系统的比较和争论，请移步这里看看 [链接1](http://whygitisbetterthanx.com/) [链接2](https://git.wiki.kernel.org/index.php/GitSvnComparsion)。作为一个开发者，我喜欢 git 超过其它任何现有的工具。Git 真正改变了开发者对于合并和分支的认识。在传统的 CVS/SVN 里，合并/分支总是有点令人害怕的(“注意合并冲突，它们会搞死你的”)。

但是 git 中的这些操作是如此的简单有效，它们真正作为你每天工作流程的一部分。比如，在 CVS/SVN 的书籍里，分支和合并总是最后一个章节的讨论重点(对于高级用户)，而在每一本 git 的书里 [链接1](http://book.git-scm.com/) [链接2](http://pragprog.com/titles/tsgit/pragmatic-version-control-using-git) [链接3](http://github.com/progit/progit)，这些内容已经被包含在第三章(基础)里了。

因为它的简单直接和重复性，分支和合并不再令人害怕。版本控制工具比其它任何东西都支持分支/合并。

有关工具就介绍到这里，我们现在进入开发模型这个正题。我要展现的模型本质上无外乎是一个流程的集合，每个团队成员都有必要遵守这些流程，来达到管理软件开发流程的目的。


### 分散但也集中

我们的分支模型中使用良好的代码库的设置方式，是围绕一个真实的中心代码库的。注意，这里的代码库仅仅被看做是一个中心代码库(因为 git 是 DVCS，即分散版本控制系统，从技术层面看，是没有所谓的中心代码库的)。我们习惯于把这个中心代码库命名为 `origin`，这同时也是所有 git 用户的习惯。

![](http://nvie.com/img/centr-decentr@2x.png)

每一位开发者都向 `origin` 这个中心结点 pull 和 push。但是除此之外，每一位开发者也可以向其它结点 pull 改变形成子团队。比如，对于两个以上开发者同时开发一项大的新特性来说，为了不必过早向 `origin` 推送开发进度，这就非常有用。在上面的这个例子中，Alice 和 Bob、Alice 和 David、Clair 和 David 都是这样的子团队。

从技术角度，这无非意味着 Alice 定义一个名为 `Bob` 的 git remote，指向 Bob 的代码库，反之亦然。


### 主分支

![](http://nvie.com/img/main-branches@2x.png)

该开发模型的核心基本和现有的模型是一样的。中心代码库永远维持着两个主要的分支：

* `master`
* `develop`

在 `origin` 上的 `master` 分支和每个 git 用户的保持一致。而和 `master` 分支并行的另一个分支叫做 `develop`。

我们认为 `origin/master` 是其 `HEAD` 源代码总是代表了*生产环境准备就绪*的状态的主分支。

我们认为 `origin/develop` 是其 `HEAD` 源代码总是代表了最后一次交付的可以赶上下一次发布的状态的主分支。有人也把它叫做“集成分支”。该源代码还被作为了 nightly build 自动化任务的来源。

每当 `develop` 分支到达一个稳定的阶段，可以对外发布时，所有的改变都会被合并到 `master` 分支，并打一个发布版本的 tag。具体操作方法我们稍后讨论。

因此，每次改动被合并到 `master` 的时候，这就是一个*真正的*新的发布产品。我们建议对此进行严格的控制，因此理论上我们可以为每次 `master` 分支的提交都挂一个钩子脚本，向生产环境自动化构建并发布我们的软件。


### 支持型分支

我们的开发模型里，紧接着 `master` 和 `develop` 主分支的，是多种多样的支持型分支。它们的目的是帮助团队成员并行处理每次追踪特性、准备发布、快速修复线上问题等开发任务。和之前的主分支不同，这些分支的生命周期都是有限的，它们最终都会被删除掉。

我们可能会用到的不同类型的分支有：

* feature 分支
* release 分支
* hotfix 分支

每一种分支都有一个特别的目的，并且有严格的规则，诸如哪些分支是它们的起始分支、哪些分支必须是它们合并的目标等。我们快速把它们过一遍。

这些“特殊”的分支在技术上是没有任何特殊的。分支的类型取决于我们如何*运用*它们。它们完完全全都是普通而又平凡的 git 分支。


#### feature 分支

![](http://nvie.com/img/fb@2x.png)

* 可能派发自：`develop`
* 必须合并回：`develop`
* 分支命名规范：除了 `master`、`develop`、`release-*` 或 `hotfix-*` 的任何名字

Feature 分支(有时也被称作 topic 分支)用来开发包括即将发布或远期发布的新的特性。当我们开始开发一个特性的时候，发布合并的目标可能还不太确定。Feature 分支的生命周期会和新特性的开发周期保持同步，但是最终会合并回 `develop` (恩，下次发布的时候把这个新特性带上)或被抛弃(真是一次杯具的尝试啊)。

Feature 分支通常仅存在于开发者的代码库中，并不出现在 `origin` 里。


##### 创建一个 feature 分支

当开始一个新特性的时候，从 `develop` 分支派发出一个分支

    $ git checkout -b myfeature develop
    Switched to a new branch "myfeature"


##### 把完成的特性合并回 develop

完成的特性可以合并回 `develop` 分支并赶上下一次发布：

    $ git checkout develop
    Switched to a new branch "develop"
    $ git merge --no-ff myfeature
    Updating ea1b82a..05e9557
    (Summary of changes)
    $ git branch -d myfeature
    Deleted branch myfeature (was 05e9557)
    $ git push origin develop

`-no-ff` 标记使得合并操作总是产生一次新的提交，哪怕合并操作可以快速完成。这个标记避免将 feature 分支和团队协作的所有提交的历史信息混在主分支的其它提交之后。比较一下：

![](http://nvie.com/img/merge-without-ff@2x.png)

在右边的例子里，我们不可能从 git 的历史记录中看出来哪些提交实现了这一特性——你可能不得不查看每一笔提交日志。恢复一个完整的特性(比如通过一组提交)在右边变成了一个头疼事情，而如果使用了 `--no-ff` 之后，就变得简单了。

是的，这会创造一些没有必要的(空的)提交记录，但是得到的是大量的好处。

不幸的是，我还没有找到一个在 `git merge` 时默认就把 `--no-ff` 标记打上的办法，但这很重要。


#### release 分支

* 可能派发自：`develop`
* 必须合并回：`develop` 和 `master`
* 分支命名规范：`release-*`

Release 分支用来支持新的生产环境发布的准备工作。允许在最后阶段产生提交点(dotting i's)和交汇点(crossing t's)。而且允许小幅度的问题修复以及准备发布时的meta数据(比如版本号、发布日期等)。在 `release` 分支做了上述这些工作之后，`develop` 分支会被“翻篇儿”，开始接收下一次发布的新特性。

我们选择(几近)完成所有预期的开发的时候，作为从 `develop` 派发出 `release` 分支的时机。最起码所有准备构建发布的功能都已经及时合并到了 `develop` 分支。而往后才会发布的功能则不应该合并到 `develop` 分支——他们必须等到 `release` 分支派发出去之后再做合并。

在一个 `release` 分支的开始，我们就赋予其一个明确的版本号。直到该分支创建之前，`develop` 分支上的描述都是“下一次”release 的改动，但这个“下一次”release 其实也没说清楚是 0.3 release 还是 1.0 release。而在一个 release 分支的开始时这一点就会确定。这将成为有关项目版本号晋升的一个守则。


##### 创建一个 release 分支

Release 分支派发自 `develop` 分支。比如，我们当前的生产环境发布的版本是 1.1.5，马上有一个 release 要发布了。`develop` 分支已经为“下一次”release 做好了准备，并且我们已经决定把新的版本号定为 1.2 (而不是 1.1.6 或 2.0)。所以我们派发一个 release 分支并以新的版本号为其命名：

    $ git checkout -b release-1.2 develop
    Switched to a new branch "release-1.2"
    $ ./bump-version.sh 1.2
    Files modified successfully, version bumped to 1.2.
    $ git commit -a -m "Bumped version number to 1.2"
    [release-1.2 74d9424] Bumped version number to 1.2
    1 files changed, 1 insertions(+), 1 deletions(-)

创建好并切换到新的分支之后，我们完成对版本号的晋升。这里的 `bump-version.sh` 是一个虚构的用来改变代码库中某些文件以反映新版本的 shell 脚本。(当然你也可以手动完成这些改变——重点是*有些*文件发生了改变)然后，晋升了的版本号会被提交。

这个新的分支会存在一段时间，直到它确实发布出去了为止。期间可能会有 bug 修复(这比在 `develop` 做更合理)。但我们严格禁止在此开发庞大的新特性，它们应该合并到 `develop` 分支，并放入下次发布。


##### 完成一个 release 分支

当 release 分支真正发布成功之后，还有些事情需要收尾。首先，release 分支会被合并到 `master` (别忘了，`master` 上的每一次提交都代表一个真正的新的发布)；然后，为 `master` 上的这次提交打一个 tag，以便作为版本历史的重要参考；最后，还要把 release 分支产生的改动合并回 `develop`，以便后续的发布同样包含对这些 bug 的修复。

前两部在 git 下是这样操作的：

    $ git checkout master
    Switched to branch 'master'
    $ git merge --no-ff release-1.2
    Merge made by recursive
    (Summary of changes)
    $ git tag -a 1.2

现在发布工作已经完成了，同时 tag 也打好了，用在未来做参考。

**补充**：你也可以通过 `-s` 或 `-u <key>` 标记打 tag。

为了保留 release 分支里的改动记录，我们需要把这些改动合并回 `develop`。git 操作如下：

    $ git checkout develop
    Switched to branch 'develop'
    $ git merge --no-ff release-1.2
    Merge made by recursive.
    (Summary of changes)

这一步有可能导致冲突的发生(只是有理论上的可能性，因为我们已经改变了版本号)，一旦发现，解决冲突然后提交就好了。

现在我们真正完成了一个 release 分支，该把它删掉了，因为它的使命已经完成了：

    $ git branch -d release-1.2
    Deleted branch release-1.2 (was ff452fe).


#### hotfix 分支

![](http://nvie.com/img/hotfix-branches@2x.png)

* 可能派发自：`master`
* 必须合并回：`develop` 和 `master`
* 分支命名规范：`hotfix-*`

Hotfix 分支和 release 分支非常类似，因为他们都意味着会产生一个新的生产环境的发布，尽管 hotfix 分支不是先前就计划好的。他们在实时的生产环境版本出现意外需要快速响应时，从 `master` 分支相应的 tag 被派发。

我们这样做的根本原因，是为了让团队其中一个人来快速修复生产环境的问题，其他成员可以按工作计划继续工作下去而不受太大影响。


##### 创建一个 hotfix 分支

Hotfix 分支创建自 `master` 分支。例如，假设 1.2 版本是目前的生产环境且出现了一个严重的 bug，但是目前的 `develop` 并不足够稳定。那么我们可以派发出一个 hotfix 分支来开始我们的修复工作：

    $ git checkout -b hotfix-1.2.1 master
    Switched to a new branch "hotfix-1.2.1"
    $ ./bump-version.sh 1.2.1
    Files modified successfully, version bumped to 1.2.1.
    $ git commit -a -m "Bumped version number to 1.2.1"
    [hotfix-1.2.1 41e61bb] Bumped version number to 1.2.1
    1 files changed, 1 insertions(+), 1 deletions(-)

别忘了在派发出分支之后晋升版本号！

然后，修复 bug，提交改动。通过一个或多个提交都可以。

    $ git commit -m "Fixed severe production problem"
    [hotfix-1.2.1 abbe5d6] Fixed severe production problem
    5 files changed, 32 insertions(+), 17 deletions(-)


##### 完成一个 hotfix 分支

当我们完成之后，对 bug 的修复需要合并回 `master`，同时也需要合并回 `develop`，以保证接下来的发布也都已经解决了这个 bug。这和 release 分支的完成方式是完全一样的。

首先，更新 `master` 并为本次发布打一个 tag：

    $ git checkout master
    Switched to branch 'master'
    $ git merge --no-ff hotfix-1.2.1
    Merge made by recursive
    (Summary of changes)
    $ git tag -a 1.2.1

**补充**：你也可以通过 `-s` 或 `-u <key>` 标记打 tag。

然后，把已修复的 bug 合并到 `develop`：

    $ git checkout develop
    Switched to branch 'develop'
    $ git merge --no-ff hotfix-1.2.1
    Merge made by recursive
    (Summary of changes)

这个规矩的一个额外之处是：*如果此时已经存在了一个 release 分支，那么 hotfix 的改变需要合并到这个 release 分支，而不是 `develop` 分支*。因为把对 bug 的修复合并回 release 分支之后，release 分支最终还是会合并回 `develop` 分支的。(如果在 `develop` 分支中立刻需要对这个 bug 的修复，且等不及 release 分支合并回来，则你还是可以直接合并回 `develop` 分支的，这是绝对没问题的)

最后，删掉这个临时的分支：

    $ git branch -d hotfix-1.2.1
    Deleted branch hotfix-1.2.1 (was abbe5d6).



### 摘要

其实这个分支模型里没有什么新奇的东西。文章开头的那张大图对我们的项目来说非常有用。它非常易于团队成员理解这个优雅有效的模型，并在团队内部达成共识。

这里还有一份那张大图的 [高清PDF版本](http://nvie.com/files/Git-branching-model.pdf)，你可以把它当做手册放在手边快速浏览。

**补充**：还有，如果你们需要的话，这里还有一份 [Keynote 版本](http://github.com/downloads/nvie/gitflow/Git-branching-model-src.key.zip)