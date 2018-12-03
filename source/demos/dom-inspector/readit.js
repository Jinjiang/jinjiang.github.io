/**
    @fileOverview
    手动阅读模式
    用户可以用鼠标点选一个区域，然后回车进行阅读
    才操作不具备可逆性，还原页面需要通过刷新操作来实现
    @author Jinjiang<zhaojinjiang@yahoo.com.cn>
 */




/**
    得到dom结点的坐标和宽高
    @returns {array} 共4项，分别表示横纵坐标和宽高
 */
function getOffset(dom) {
    var left = 0;
    var top = 0;
    var width = dom.offsetWidth;
    var height = dom.offsetHeight;

    while (dom) {
        left += dom.offsetLeft;
        top += dom.offsetTop;
        dom = dom.offsetParent;
    }

    return [left, top, width, height];
}

/**
    判断dom结点是否为container的子结点
    @returns {boolean}
 */
function contains(dom, container) {
    while (dom) {
        if (dom == container) {
            return true;
        }
        dom = dom.parentNode;
    }
    return false;
}




/**
    创建一个浮层，盖在dom结点上
 */
function createLayer(dom) {
    var offset = getOffset(dom);
    var layer = document.createElement('div');

    if (window.testtLayer) {
        document.body.removeChild(testtLayer);
    }

    layer.style.background = 'rgba(192, 192, 255, 0.5)';
    layer.style.position = 'absolute';
    layer.style.left = offset[0] + 'px';
    layer.style.top = offset[1] + 'px';
    layer.style.width = offset[2] + 'px';
    layer.style.height = offset[3] + 'px';
    layer.style.zIndex = 100;

    document.body.appendChild(layer);
    window.testtLayer = layer;
}

/**
    绑定鼠标单击事件，为点中的dom结点创建浮动层，并显示在相同的位置
    @event
 */
function click(event) {
    var target = event.target || event.srcElement;
    var inLayer;

    if (window.testtLayer && target == window.testtLayer) {
        document.body.removeChild(window.testtLayer);
        window.testtLayer = null;
        window.currentDom = null;
        return false;
    }

    createLayer(target);
    window.currentDom = target;
    return false;
}




/**
    清除body内除选中的dom之外的所有内容
    只保留dom结点、dom内结点和dom父级结点
    @param {HTMLElement} dom
 */
function clear(dom) {
    var parent = dom.parentNode;
    var nodes;

    if (!parent || dom == document.body) {
        return;
    }

    nodes = [];
    for (var i = 0; i < parent.childNodes.length; i++) {
        nodes[i] = parent.childNodes[i];
    }

    nodes.forEach(function (node) {
        if (node != dom) {
            parent.removeChild(node);
        }
    });

    clear(parent);
}

/**
    判断用户是否键入回车
    @event
 */
function keydown(event) {
    var links, link;

    function slice(collection) {
        return Array.prototype.slice.call(collection);
    }

    if (event.keyCode == 13 && window.currentDom) {
        links = slice(document.querySelectorAll('link, style'));

        links.forEach(function (l) {
            l.parentNode.removeChild(l);
        });

        // 加入阅读器的样式
        link = document.createElement('link');
        link.rel='stylesheet';
        link.href='http://jiongks.sinaapp.com/s/css/style.css?' + Math.random();
        link.charset='utf-8';
        document.head.appendChild(link);
        document.body.style.cssText = '';
        document.body.style.maxWidth = '720px';
        document.body.style.margin = '0 auto';
        document.body.style.padding = '40px';

        // 生成阅读器的内容，去掉多余的dom结点
        document.body.removeChild(window.testtLayer);
        clear(currentDom);

        // 清除事件和临时变量
        document.body.onclick = null;
        document.body.onkeydown = null;
        window.testtLayer = null;
        window.currentDom = null;
    }
}




// 绑定事件
document.body.onclick = click;
document.body.onkeydown = keydown;


alert('"ReadIt" Loaded!\nIf you want to read a block content that doesn\'t looks quite confortable, just click the bookmark first, then CLICK the block conetnt and press ENTER.');



