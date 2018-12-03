---
title: 'Connect中间件使用手册'
date: 2013/06/02 06:45:30
updated: 2013/06/02 09:01:47
---

以下内容大多译自[Connect官网](http://www.senchalabs.org/connect/) 2013-06-02

Connect是基于Node的中间件框架(middleware framework)，提供超过18种官方中间件以及更多的第三方中间件。

示例：

    var app = connect()
      .use(connect.logger('dev'))
      .use(connect.static('public'))
      .use(function(req, res){
        res.end('hello world\n');
      })
     .listen(3000);

安装方式：

    $ npm install connect

依次介绍官方中间件

<!--more-->

### 1. 日志 logger

服务器请求日志，支持自定义格式，支持传入 `options` 选项对象或 `format` 字符串。

#### 选项

* `format` 表示日志格式的字符串，由各种记号(token)组合而成
* `stream` 表示输出到哪里。默认是 `stdout`
* `buffer` 表示缓冲的时间间隔，默认为 1000ms
* `immediate` 是否在请求(request)的时候立即写日志，而不是在回应(response)的时候

#### 记号(Tokens)

* :req[header] (如 :req[Accept])
* :res[header] (如 :res[Content-Length])
* :http-version、:response-time、:remote-addr、:date、:method、:url、:referrer、:user-agent、:status

#### 默认的日志格式(Formats)

 `default` 、 `short` 、 `tiny`

其中 `default` 代表的格式是：

    :remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"

另外还有 `dev` 格式，可以着色输出响应状态，开发时适用。

#### 其它

记号和格式都是可以自定义更多的，通过

* `connect.logger.token(name, function (req, res) {...})` 和
* `connect.logger.format(name, stringOrFunction)`

更多细节请[移步至此](http://www.senchalabs.org/connect/logger.html)

### 2. 防止跨域伪造请求 csrf

默认情况下该中间件会生成一个名为“_csrf”的记号，该记号可以作为请求的状态、表单提交的隐藏属性值或查询字符串等等，并在服务器端与 `req.session._csrf` 属性进行核对。如果核对出错，则会出现403错误。

默认的 `value` 函数会以此核对 `bodyParser()` 中间件生成的 `req.body` 、 `query()` 生成的 `req.query` 以及名为“X-CSRF-Token”的头信息。

该中间件需要会话支持，因此必须出现在 `session()` 和 `cookieParse()` 中间件之后。

默认的 `defaultValue()` 实现如下：

    function defaultValue(req) {
      return (req.body && req.body._csrf)
        || (req.query && req.query._csrf)
        || (req.headers['x-csrf-token']);
    }

更多细节请[移步至此](http://www.senchalabs.org/connect/csrf.html)

### 3. 压缩 compress

Gzip压缩的中间件

支持的方法都在 `connect.compress.methods` 中，通过 `connect.compress.filter(req, res)` 方法判断文件是否需要压缩，默认压缩Content-Type含json、text或javascript的文件。

更高级的操作是可以将具体压缩方法的参数通过options参数传进去：

    connect.compress({
        chunkSize: ..., // default 16*1024
        windowBits: ...,
        level: ..., // 0-9
        memLevel: ..., // 1-9
        strategy: ...
    })

更多细节请[移步至此](http://www.senchalabs.org/connect/compress.html)

### 4. HTTP基础认证 basicAuth

* 提供回调函数 `connect.basicAuth(function (user, pass) {...})` ，如果这个回调函数返回 `true` ，则获得访问权限。
* 提供异步的调用方式 `connect.basicAuth(function (user, pass, callback))`
* 直接有效的单一用户名密码的方式 `connect.basicAuth('username', 'password')`

更多细节请[移步至此](http://www.senchalabs.org/connect/basicAuth.html)

### 5. 主体解析器 Body Parser

可扩展的解析器，对请求的body进行解析。支持_application/json_、_application/x-www-form-urlencoded_、_multipart/form-data_

其等同于：

    app.use(connect.json());
    app.use(connect.urlencoded());
    app.use(connect.multipart());

更多细节请[移步至此](http://www.senchalabs.org/connect/bodyParser.html)

### 5.1 json

_application/json_解析器，并将结果放至 `req.body`

#### 选项

* `strict` 是否严格解析，当值为 `false` 时，理论上 `JSON.parse()` 能解析的数据都是被允许的
* `reviver` 用作 `JSON.parse()` 方法的第二参数
* `limit` 字节数限制，默认不开启

更多细节请[移步至此](http://www.senchalabs.org/connect/json.html)

### 5.2 urlencoded

_application/x-www-form-urlencoded_解析器，并将结果放至 `req.body`

#### 选项

* `limit` 字节数限制，默认不开启

更多细节请[移步至此](http://www.senchalabs.org/connect/urlencoded.html)

### 5.3 multipart

_multipart/form-data_解析器，并将结果放至 `req.body` 和 `req.files`

#### 选项

* `limit` 字节数限制，默认不开启
* `defer` 延时处理并不等 `end` 事件触发就调用 `req.form.next()` 展示大表单。该选项在需要绑定 `progress` 事件时可用。

更多细节请[移步至此](http://www.senchalabs.org/connect/multipart.html)

### 6. 超时时间 timeout

用法： `connect.timeout(ms)` 。如果请求超时则指向408错误。

另， `req` 对象会多一个 `req.clearTimeout()` 方法，用来在必要的情况下取消计时。

更多细节请[移步至此](http://www.senchalabs.org/connect/timeout.html)

### 7. Cookie解析器 cookieParser

解析头中的_Cookie_并将结果放至 `req.cookies` 。你还可以通过 `connect.cookieParser(secret)` 中的 `secret` 参数对cookie进行加密。该密码可以通过 `req.secret` 进行取值。

更多细节请[移步至此](http://www.senchalabs.org/connect/cookieParser.html)

### 8. 会话 session

详情略。

更多细节请[移步至此](http://www.senchalabs.org/connect/session.html)

### 9. 基于cookie的会话支持 cookieSession

    connect.cookieSession({ secret: 'tobo!', cookie: { maxAge: 60 * 60 * 1000 }});

#### 选项

* `key` cookie名，默认是 `connect.sess`
* `secret` 密码
* `cookie` 会话cookie的设置，默认是 `{ path: '/', httpOnly: true, maxAge: null }`
* `proxy` 信任反向代理

#### 清除会话

    req.session = null;

更多细节请[移步至此](http://www.senchalabs.org/connect/cookieSession.html)

### 10. 支持伪造HTTP方法 methodOverride

当检查到方法重载的时候，把原方法存入 `req.originalMethod` ，检查的字段可以通过参数 `key` 设置，默认为 `_method`

    connect.methodOverride(key)

更多细节请[移步至此](http://www.senchalabs.org/connect/methodOverride.html)

### 11. 响应时间 responseTime

计算响应时间并展示为 `X-Response-Time` 头

更多细节请[移步至此](http://www.senchalabs.org/connect/responseTime.html)

### 12. 静态服务缓存 staticCache

在内存中建立static中间件的缓存。默认最大缓存对象为128个，每个对象的最大体积是256k，总共大约32mb。

#### 选项

* `maxObjects` 最大缓存对象个数，默认128个
* `maxLength` 最大缓存对象体积，默认256kb

更多细节请[移步至此](http://www.senchalabs.org/connect/staticCache.html)

### 12.1 静态文件服务 static

为给定的 `root` 路径提供静态文件服务，例如

    connect.static(__dirname + '/public', {maxAge: 86400000})

#### 选项

* `maxAge` 浏览器缓存时间，默认是 `0`
* `hidden` 是否允许访问隐藏文件，默认是 `false`
* `redirect` 路径是目录时是否在结尾自动加 `/` ，默认是 `true`

#### MIME表

展示MIME模块，可读写

    connect.static.mime

更多细节请[移步至此](http://www.senchalabs.org/connect/static.html)

### 13. 目录 directory

列出目录的文件列表

#### 选项

* `hidden` 是否显示点(.)开头的文件，默认是 `false`
* `icons` 是否显示文件图标，默认是 `false`
* `filter` 过滤文件的函数，默认是 `false`

图标文件在 `lib/public/icons/` 目录中

#### 其它

* `connect.directory.html()` 输出html格式的内容
* `connect.directory.json()` 输出json格式的内容
* `connect.directory.plain()` 输出文本格式的内容

更多细节请[移步至此](http://www.senchalabs.org/connect/directory.html)

### 14. 虚拟主机 vhost

例如：

    connect()
      .use(connect.vhost('foo.com', fooApp))
      .use(connect.vhost('bar.com', barApp))
      .use(connect.vhost('*.com', mainApp))

更多细节请[移步至此](http://www.senchalabs.org/connect/vhost.html)

### 15. 站点图标 favicon

默认图标为 `lib/public/favicon.ico` ，可更改，调用方式：

    connect.favicon('public/favicion.ico', {maxAge: 86400000})

#### 选项

* `maxAge` 过期时间，默认是1天(86400000)

更多细节请[移步至此](http://www.senchalabs.org/connect/favicon.html)

### 16. 请求大小限制 limit

限制请求的body字节数，可传入一个数字或代表容量大小的字符串，比如： `5mb` 、 `200kb` 、 `1gb`

    connect.limit('5.5mb')

更多细节请[移步至此](http://www.senchalabs.org/connect/limit.html)

### 17. 查询字符串 query

自动解析查询字符串，生成 `req.query`

更多细节请[移步至此](http://www.senchalabs.org/connect/query.html)

### 18. 错误处理 errorHandler

灵活的错误处理机制，开发环境下提供出错信息和栈追踪，回应信息支持纯文本、HTML和JSON

* 在_text/plain_的情况下回应文本格式的错误信息
* 在_application/json_情况下，回应 `{ "error": error }`
* 在允许的情况下回应HTML错误信息

更多细节请[移步至此](http://www.senchalabs.org/connect/errorHandler.html)

(完)