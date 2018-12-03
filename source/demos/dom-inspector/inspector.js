/**
    @fileOverview
    用来通过鼠标点击查看元素的坐标和尺寸
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

    console.log(left, top, width, height);
    return [left, top, width, height];
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

    layer.style.background = 'rgba(0, 0, 255, 0.6)';
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
    绑定鼠标单击事件，为点中的dom结点创建浮动层，并显示在相同的位置
    @event
 */
function click(event) {
    var target = event.target || event.srcElement;
    var inLayer;

    if (window.testtLayer && target == window.testtLayer) {
        document.body.removeChild(window.testtLayer);
        window.testtLayer = null;
        return false;
    }

    createLayer(target);
    return false;
}


// 绑定事件
document.body.onclick = click;



