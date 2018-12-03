---
title: '撰写可测试的 JavaScript'
date: 2013/12/11 11:28:58
updated: 2016/06/15 10:45:48
---

译自：[Writing Testable JavaScript - A List Apart](http://alistapart.com/article/writing-testable-javascript)

这篇文章算是 A List Apart 系列文章中，包括滑动门在内，令我印象最深刻的文章之一。最近有时间翻译了一下，分享给更多人，希望对大家有所帮助！

----

__我们已经面对到了这一窘境：一开始我们写的 JavaScript 只有区区几行代码，但是它的代码量一直在增长，我们不断的加参数、加条件。最后，粗 bug 了…… 我们才不得不收拾这个烂摊子。__

如上所述，今天的客户端代码确实承载了更多的责任，浏览器里的整个应用都越变越复杂。我们发现两个明显的趋势：1、我们没法通过单纯的鼠标定位和点击来检验代码是否正常工作，自动化的测试才会真正让我们放心；2、我们也许应该在撰写代码的时候就考虑到，让它变得可测试。

神马？我们需要改变自己的编码方式？是的。因为即使我们意识到自动化测试的好，大部分人可能只是写写集成测试(integration tests)罢了。集成测试的侧重点是让整个系统的每一部分和谐共存，但是这并没有告诉我们每个独立的*功能单元*运转起来是否都和我们预期的一样。

这就是为什么我们要引入单元测试。我们已经准备好经历一段痛苦的*撰写单元测试*的过程了，但最终我们能够*撰写可测试的 JavaScript*。

<!--more-->

### 单元与集成：有什么不同？

撰写集成测试通常是相当直接的：我们单纯的撰写代码，描述用户如何和这个应用进行交互、会得到怎样的结果就好。[Selenium](http://docs.seleniumhq.org/) 是这类浏览器自动化工具中的佼佼者。而 [Capybara](https://github.com/jnicklas/capybara) 可以便于 Ruby 和 Selenium 取得联系。在其它语言中，这类工具也举不胜举。

下面就是搜索应用的一部分集成测试：

    def test_search
        fill_in('q', :with => 'cat')
        find('.btn').click
        assert( find('#results li').has_content?('cat'), 'Search results are shown' )
        assert( page.has_no_selector?('#results li.no-results'), 'No results is not shown' )
    end

集成测试对用户的交互行为感兴趣，而单元测试往往仅专注于一小段代码：

> 当我伴随特定的输入调用一个函数的时候，我是否收到了我预期中的结果？

我们按照传统思路撰写的程序是很难进行单元测试的，同时也很难维护、调试和扩展。但是如果我们在撰写代码的时候就考虑到我将来要做单元测试，那么这样的思路不仅会让我们发现测试代码写起来很直接，也会让我们真正写出更优质的代码。

我们通过一个简单的搜索应用的例子来做个示范：

![](http://alistapart.com/d/375/app.png)

当用户搜索时，该应用会向服务器发送一个 XHR (Ajax 请求) 取得相应的搜索结果。并当服务器以 JSON 格式返回数据之后，通过前端模板把结果显示在页面中。用户在搜索结果中点“赞”，这个人的名字就会出现在右侧的点“赞”列表里。

一个“传统”的 JavaScript 实现大概是这个样子的：

    // 模板缓存，缓存的内容均为 jqXHR 对象
    var tmplCache = {};
    
    /**
     * 载入模板
     * 从 '/templates/{name}' 载入模板，存入 tmplCache
     * @param  {string} name 模板名称
     * @return {object}      模板请求的 jqXHR 对象
     */
    function loadTemplate (name) {
      if (!tmplCache[name]) {
        tmplCache[name] = $.get('/templates/' + name);
      }
      return tmplCache[name];
    }
    
    /**
     * 页面主要逻辑
     * 1. 支持搜索行为并展示结果
     * 2. 支持点“赞”，被赞过的人会出现在点“赞”列表里
     */
    $(function () {
    
      var resultsList = $('#results');
      var liked = $('#liked');
      var pending = false; // 用来标识之前的搜索是否尚未结束
    
      // 用户搜索行为，表单提交事件
      $('#searchForm').on('submit', function (e) {
        // 屏蔽默认表单事件
        e.preventDefault();
    
        // 如果之前的搜索尚未结束，则不开始新的搜索
        if (pending) { return; }
    
        // 得到要搜索的关键字
        var form = $(this);
        var query = $.trim( form.find('input[name="q"]').val() );
    
        // 如果搜索关键字为空则不进行搜索
        if (!query) { return; }
    
        // 开始新的搜索
        pending = true;
    
        // 发送 XHR
        $.ajax('/data/search.json', {
          data : { q: query },
          dataType : 'json',
          success : function (data) {
            // 得到 people-detailed 模板
            loadTemplate('people-detailed.tmpl').then(function (t) {
              var tmpl = _.template(t);

              // 通过模板渲染搜索结果
              resultsList.html( tmpl({ people : data.results }) );

              // 结束本次搜索
              pending = false;
            });
          }
        });
    
        // 在得到服务器响应之前，清空搜索结果，并出现等待提示
        $('<li>', {
          'class' : 'pending',
          html : 'Searching &hellip;'
        }).appendTo( resultsList.empty() );
      });
    
      // 绑定点“赞”的行为，鼠标点击事件
      resultsList.on('click', '.like', function (e) {
        // 屏蔽默认点击事件
        e.preventDefault();
    
        // 找到当前人的名字
        var name = $(this).closest('li').find('h2').text();
    
        // 清除点“赞”列表的占位元素
        liked.find('.no-results').remove();
    
        // 在点“赞”列表加入新的项目
        $('<li>', { text: name }).appendTo(liked);
      });
    
    });

我的朋友 Adam Sontag 称之为*“自己给自己挖坑”*的代码：展现、数据、用户交互、应用状态全部分散在了每一行代码里。这种代码是很容易进行集成测试的，但几乎不可能针对*功能单元*进行单独的测试。

单元测试为什么这么难？有四大罪魁祸首：

* 没有清晰的结构。几乎所有的工作都是在 `$(document).ready()` 回调里进行的，而这一切在一个匿名函数里，它在测试中无法暴露出任何接口。
* 函数太复杂。如果一个函数超过了 10 行，比如提交表单的那个函数，估计大家都觉得它太忙了，一口气做了很多事。
* 隐藏状态还是共享状态。比如，因为 `pending` 在一个闭包里，所以我们没有办法测试在每个步骤中这个状态是否正确。
* 强耦合。比如这里 `$.ajax` 成功的回调函数不应该依赖 DOM 操作。

### 组织我们的代码

首当其冲的是把我们代码的逻辑缕一缕，根据职责的不同把整段代码分为几个方面：

* 展现和交互
* 数据管理和保存
* 应用的状态
* 把上述代码建立并串连起来

在之前的“传统”实现里，这四类代码是混在一起的，前一行我们还在处理界面展现，后两行就在和服务器通信了。

![](http://alistapart.com/d/375/code-lines.png)

我们绝对可以写出集成测试的代码，但我们应该很难写出单元测试了。在功能测试里，我们可以做出诸如“当用户搜索东西的时候，他会看到相应的搜索结果”的断言，但是无法再具体下去了。如果里面出了什么问题，我们还是得追踪进去，找到确切的出错位置。这样的话功能测试其实也没帮上什么忙。

如果我们反思自己的代码，那不妨从单元测试写起，通过单元测试这个角度，更好的观察，是哪里出了问题。这进而会帮助我们改进代码，让代码变得更易于重用、易于维护、易于扩展。

我们的新版代码遵循下面几个原则：

* 根据上述四类职责，列出每个互不相干的行为，并分别用一个对象来表示。对象之前互不依赖，以避免不同的代码混在一起。
* 用可配置的内容代替写死的内容，以避免我们为了测试而复刻整个 HTML 环境。
* 保持对象方法的简单明了。这会把测试工作变得简单易懂。
* 通过构造函数创建对象实例。这让我们可以根据测试的需要复刻每一段代码的内容。

作为起步，我们有必要搞清楚，该如何把应用分解成不同的部分。我们有三块展现和交互的内容：搜索框、搜索结果和点“赞”列表。

![](http://alistapart.com/d/375/app-views.png)

我们还有一块内容是从服务器获取数据的、一块内容是把所有的内容粘合在一起的。

我们从整个应用最简单的一部分开始吧：点“赞”列表。在原版应用中，这部分代码的职责就是更新点“赞”列表：

    var liked = $('#liked');
    var resultsList = $('#results');
    
    // ...
    
    resultsList.on('click', '.like', function (e) {
      e.preventDefault();
      var name = $(this).closest('li').find('h2').text();
      liked.find( '.no-results' ).remove();
      $('<li>', { text: name }).appendTo(liked);
    });

搜索结果这部分是完全和点“赞”列表搅在一起的，并且需要很多 DOM 处理。更好的易于测试的写法是创建一个点“赞”列表的对象，它的职责就是封装点“赞”列表的 DOM 操作。

    var Likes = function (el) {
      this.el = $(el);
      return this;
    };
    
    Likes.prototype.add = function (name) {
      this.el.find('.no-results').remove();
      $('<li>', { text: name }).appendTo(this.el);
    };

这段代码提供了创建一个点“赞”列表对象的构造函数。它有 `.add()` 方法，可以在产生新的赞的时候使用。这样我们就可以写很多测试代码来保障它的正常工作了：

    var ul;
    
    // 设置测试的初始状态：生成一个搜索结果列表
    setup(function(){
      ul = $('<ul><li class="no-results"></li></ul>');
    });
    
    test('测试构造函数', function () {
      var l = new Likes(ul);
      // 断言对象存在
      assert(l);
    });
    
    test('点一个“赞”', function () {
      var l = new Likes(ul);
      l.add('Brendan Eich');
    
      // 断言列表长度为1
      assert.equal(ul.find('li').length, 1);
      // 断言列表第一个元素的 HTML 代码是 'Brendan Eich'
      assert.equal(ul.find('li').first().html(), 'Brendan Eich');
      // 断言占位元素已经不存在了
      assert.equal(ul.find('li.no-results').length, 0);
    });

怎么样？并不难吧 :-) 我们这里用到了名为 [Mocha](http://visionmedia.github.io/mocha/) 的*测试框架*，以及名为 [Chai](http://chaijs.com/) 的*断言库*。Mocha 提供了 `test` 和 `setup` 函数；而 Chai 提供了 `assert`。测试框架和断言库的选择还有很多，我们出于介绍的目的给大家展示这两款。你可以找到属于适合自己的项目——除了 Mocha 之外，[QUnit](http://qunitjs.com/) 也比较流行。另外 [Intern](http://theintern.io/) 也是一个测试框架，它运用了大量的 promise 方式。

我们的测试代码是从点“赞”列表这一容器开始的。然后它运行了两个测试：一个是确定点“赞”列表是存在的；另一个是确保 `.add()` 方法达到了我们预期的效果。有这些测试做后盾，我们就可以放心重构点“赞”列表这部分的代码了，即使代码被破坏了，我们也有信心把它修复好。

我们新应用的代码现在看起来是这样的：

    var liked = new Likes('#liked'); // 新的点“赞”列表对象
    var resultsList = $('#results');
    
    // ...
    
    resultsList.on('click', '.like', function (e) {
      e.preventDefault();
      var name = $(this).closest('li').find('h2').text();
      liked.add(name); // 新的点“赞”操作的封装
    });

搜索结果这部分比点“赞”列表更复杂一些，不过我们也该拿它开刀了。和我们为点“赞”列表创建一个 `.add()` 方法一样，我们要创建一个与搜索结果有交互的方法。我们需要一个点“赞”的入口，向整个应用“广播”自己发生了什么变化——比如有人点了个“赞”。

    // 为每一条搜索结果的点“赞”按钮绑定点击事件
    var SearchResults = function (el) {
      this.el = $(el);
      this.el.on( 'click', '.btn.like', _.bind(this._handleClick, this) );
    };
    
    // 展示搜索结果，获取模板，然后渲染
    SearchResults.prototype.setResults = function (results) {
      var templateRequest = $.get('people-detailed.tmpl');
      templateRequest.then( _.bind(this._populate, this, results) );
    };
    
    // 处理点“赞”
    SearchResults.prototype._handleClick = function (evt) {
      var name = $(evt.target).closest('li.result').attr('data-name');
      $(document).trigger('like', [ name ]);
    };
    
    // 对模板渲染数据的封装
    SearchResults.prototype._populate = function (results, tmpl) {
      var html = _.template(tmpl, { people: results });
      this.el.html(html);
    };

现在我们旧版应用中管理搜索结果和点“赞”列表之间交互的代码如下：

    var liked = new Likes('#liked');
    var resultsList = new SearchResults('#results');
    
    // ...
    
    $(document).on('like', function (evt, name) {
      liked.add(name);
    })

这就更简单更清晰了，因为我们通过 `document` 在各个独立的组件之间进行消息传递，而组件之间是互不依赖的。(值得注意的是，在真正的应用当中，我们会使用一些诸如 [Backbone](http://backbonejs.org/) 或 [RSVP](https://github.com/tildeio/rsvp.js) 库来管理事件。我们出于让例子尽量简单的考虑，使用了 `document` 来触发事件) 我们同时隐藏了很多脏活累活：比如在搜索结果对象里寻找被点“赞”的人，要比放在整个应用的代码里更好。更重要的是，我们现在可以写出保障搜索结果对象正常工作的测试代码了：

    var ul;
    var data = [ /* 填入假数据 */ ];
    
    // 确保点“赞”列表存在
    setup(function () {
      ul = $('<ul><li class="no-results"></li></ul>');
    });
    
    test('测试构造函数', function () {
      var sr = new SearchResults(ul);
      // 断言对象存在
      assert(sr);
    });
    
    test('测试收到的搜索结果', function () {
      var sr = new SearchResults(ul);
      sr.setResults(data);
    
      // 断言搜索结果占位元素已经不存在
      assert.equal(ul.find('.no-results').length, 0);
      // 断言搜索结果的子元素个数和搜索结果的个数相同
      assert.equal(ul.find('li.result').length, data.length);
      // 断言搜索结果的第一个子元素的 'data-name' 的值和第一个搜索结果相同
      assert.equal(
        ul.find('li.result').first().attr('data-name'),
        data[0].name
      );
    });
    
    test('测试点“赞”按钮', function() {
      var sr = new SearchResults(ul);
      var flag;
      var spy = function () {
        flag = [].slice.call(arguments);
      };
    
      sr.setResults(data);
      $(document).on('like', spy);
    
      ul.find('li').first().find('.like.btn').click();
    
      // 断言 `document` 收到了点“赞”的消息
      assert(flag, '事件被收到了');
      // 断言 `document` 收到的点“赞”消息，其中的名字是第一个搜索结果
      assert.equal(flag[1], data[0].name, '事件里的数据被收到了' );
    });

和服务器直接的交互是另外一个有趣的话题。原版的代码包括一个 `$.ajax()` 的请求，以及一个直接操作 DOM 的回调函数：

    $.ajax('/data/search.json', {
      data : { q: query },
      dataType : 'json',
      success : function( data ) {
        loadTemplate('people-detailed.tmpl').then(function(t) {
          var tmpl = _.template( t );
          resultsList.html( tmpl({ people : data.results }) );
          pending = false;
        });
      }
    });

同样，我们很难为这样的代码撰写测试。因为很多不同的工作同时发生在这一小段代码中。我们可以重新组织一下数据处理的部分：

    var SearchData = function () { };
    
    SearchData.prototype.fetch = function (query) {
      var dfd;
    
      // 如果搜索关键字为空，则不做任何事，立刻 `promise()`
      if (!query) {
        dfd = $.Deferred();
        dfd.resolve([]);
        return dfd.promise();
      }
    
      // 否则，向服务器请求搜索结果并把在得到结果之后对其数据进行包装
      return $.ajax( '/data/search.json', {
        data : { q: query },
        dataType : 'json'
      }).pipe(function( resp ) {
        return resp.results;
      });
    };

现在我们改变了获得搜索结果这部分的代码：

    var resultList = new SearchResults('#results');
    var searchData = new SearchData();
    
    // ...
    
    searchData.fetch(query).then(resultList.setResults);

我们再一次简化了代码，并通过 `SearchData` 对象抛弃了之前应用程序主函数里杂乱的代码。同时我们已经让搜索接口变得可测试了，尽管现在和服务器通信这里还有事情要做。

首先我们不是真的要跟服务器通信——不然这又变成集成测试了：诸如我们是有责任感的开发者，我们已经确保服务器一定不会犯错等等，是这样吗？为了替代这些东西，我们应该“mock”(伪造) 与服务器之间的通信。[Sinon](http://sinonjs.org/) 这个库就可以做这件事。第二个障碍是我们的测试应该覆盖非理想环境，比如关键字为空。

    test('测试构造函数', function () {
      var sd = new SearchData();
      assert(sd);
    });
    
    suite('取数据', function () {
      var xhr, requests;
    
      setup(function () {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = function (req) {
          requests.push(req);
        };
      });
    
      teardown(function () {
        xhr.restore();
      });
    
      test('通过正确的 URL 获取数据', function () {
        var sd = new SearchData();
        sd.fetch('cat');
    
        assert.equal(requests[0].url, '/data/search.json?q=cat');
      });
    
      test('返回一个 promise', function () {
        var sd = new SearchData();
        var req = sd.fetch('cat');
    
        assert.isFunction(req.then);
      });
    
      test('如果关键字为空则不查询', function () {
        var sd = new SearchData();
        var req = sd.fetch();
        assert.equal(requests.length, 0);
      });
    
      test('如果关键字为空也会有 promise', function () {
        var sd = new SearchData();
        var req = sd.fetch();
    
        assert.isFunction( req.then );
      });
    
      test('关键字为空的 promise 会返回一个空数组', function () {
        var sd = new SearchData();
        var req = sd.fetch();
        var spy = sinon.spy();
    
        req.then(spy);
    
        assert.deepEqual(spy.args[0][0], []);
      });
    
      test('返回与搜索结果相对应的对象', function () {
        var sd = new SearchData();
        var req = sd.fetch('cat');
        var spy = sinon.spy();

        requests[0].respond(
          200, { 'Content-type': 'text/json' },
          JSON.stringify({ results: [ 1, 2, 3 ] })
        );
    
        req.then(spy);
    
        assert.deepEqual(spy.args[0][0], [ 1, 2, 3 ]);
      });
    });

出于篇幅的考虑，这里对搜索框的重构及其相关的单元测试就不一一介绍了。完整的代码可以[移步至此](https://github.com/rmurphey/testable-javascript)查阅。

当我们按照可测试的 JavaScript 的思路重构代码之后，我们最后用下面这段代码开启程序：

    $(function() {
      var pending = false;
    
      var searchForm = new SearchForm('#searchForm');
      var searchResults = new SearchResults('#results');
      var likes = new Likes('#liked');
      var searchData = new SearchData();
    
      $(document).on('search', function (event, query) {
        if (pending) { return; }
    
        pending = true;
    
        searchData.fetch(query).then(function (results) {
          searchResults.setResults(results);
          pending = false;
        });
    
        searchResults.pending();
      });
    
      $(document).on('like', function (evt, name) {
        likes.add(name);
      });
    });

比干净整洁的代码更重要的，是我们的代码拥有了更健壮的测试基础作为后盾。这也意味着我们可以放心的重构任意部分的代码而不必担心程序遭到破坏。我们还可以继续为新功能撰写新的测试代码，并确保新的程序可以通过所有的测试。

### 测试会在宏观上让你变轻松

看完这些的长篇大论你一定会说：“纳尼？我多写了这么多代码，结果还是做了这么一点事情？”

关键在于，你做的东西早晚要放到网上的。同样是花时间解决问题，你会选择在浏览器里点来点去？还是自动化测试？还是直接在线上让你的用户做你的小白鼠？无论你写了多少测试，你写好代码，别人一用，多少会发现点 bug。

至于测试，它可能会花掉你一些额外的时间，但是它到最后真的是为你省下了时间。写测试代码测出一个问题，总比你发布到线上之后才发现有问题要好。如果有一个系统能让你意识到它真的能避免一个 bug 的流出，你一定会心存感激。

### 额外的资源

这篇文章只能算是 JavaScript 测试的一点皮毛，但是如果你对此抱有兴趣，那么可以继续移步至：

* [幻灯演示](http://lanyrd.com/2012/full-frontal/sztqh/) 2012 Full Frontal conference in Brighton, UK
* [Grunt](http://gruntjs.com/) 一个可以进行自动化测试等诸多事情的工具
* [测试驱动的 JavaScript 开发](http://www.amazon.com/dp/0321683919/) 及其 [中文版](http://www.amazon.cn/dp/B0077KA3J4/)