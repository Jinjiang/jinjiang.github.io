/**
    @fileOverview
    this file is a js file for favorites bar demo
    it create a class named FavBar and init an object for the ul
    @author Jinjiang Zhao<zhaojinjiang@yahoo.com.cn>
    @date 2011-10-16
 */




var FAV_XML_CODE = '\
<root>\
    <link title="Link 1" url="#1" />\
    <folder title="Folder 2">\
        <link title="Link 21" url = "#21" />\
    </folder>\
    <link title="Link 3 Link 3 Link 3 Link 3" url = "#3" />\
    <link title="傲游今日" url = "#4" />\
    <link title="web-web-browser" url = "#5" />\
    <link title="Link 6" url = "#6" />\
    <link title="Link 7" url = "#7" />\
    <folder title="Folder 8">\
        <link title="Link 81" url = "#81" />\
        <link title="Link 82" url = "#82" />\
    </folder>\
    <link title="Link 9" url = "#9" />\
    <link title="Link 10" url = "#10" />\
    <link title="Link 11" url = "#11" />\
</root>';


function loadXml(xml) {

    var doc, parser;

    function trim(doc) {
        if (doc && doc.childNodes) {
            var firstChild = doc.childNodes[0];
            if (firstChild && firstChild.nodeType == 7) {
                doc.removeChild(firstChild);
            }
        }
        return doc.firstChild;
    }

    if (typeof ActiveXObject != 'undefined') {
        parser = new ActiveXObject ("MSXML2.DOMDocument");
        parser.async = false;
        var flag = parser.loadXML(xml);
        doc = parser.documentElement;
    }
    else {
        parser = new DOMParser();
        doc = parser.parseFromString(xml, "text/xml");
        doc = trim(doc);
    }

    return doc;
}


/**
    format fav data and return the xml root
    the process will remove all text node in root child nodes
 */
function getFavData() {
    var NODE_NAME_MAP = {
        'link': true,
        'folder': true
    }

    var root = loadXml(FAV_XML_CODE);
    var node = root.firstChild;
    var nextNode;

    while (node) {
        nextNode = node.nextSibling;
        if (!NODE_NAME_MAP[node.nodeName]) {
            root.removeChild(node);
        }
        node = nextNode;
    }

    return root;
}




/**
    @class FavBar
    @property data
    @property ul
    @property more
    @property lastVisibleNode
    @property lastVisibleItem
    @property mode
    @property minWidth
    @property totalWidth
    @property moreWidth
    @property appendWidth compared with totalWidth
    @property removeWidth compared with totalWidth
 */
function FavBar(data) {
    var ul = document.getElementById('fav-bar');
    var more = this.createMoreBtn();

    // set clear ul child nodes and append more button
    ul.style.height = ul.offsetHeight - 6 + 'px';
    ul.innerHTML = '';
    ul.appendChild(more);

    // init the properties
    this.ul = ul;
    this.more = more;
    this.data = data;

    this.totalWidth = ul.offsetWidth;
    this.moreWidth = more.offsetWidth + 4;
    this.minWidth = 240;
    this.appendWidth = this.moreWidth + 34;
    this.removeWidth = this.moreWidth + 34;

    // from first child to updateView
    var node = data.firstChild;
    var item = this.createItem(node);
    this.lastVisibleNode = node;
    this.lastVisibleItem = item;

    // check empty
    if (node) {
        ul.insertBefore(item, more);
        this.appendWidth += (item.offsetWidth + 4);
        this.updateView();
    }
    else {
        this.setMode('empty');
    }

    // bind resize events
    var that = this;
    window.onresize = function () {
        that.updateView();
    };
}


/**
    create item for the node if its node name is folder or link
    and return it, otherwise return null
    @param node
    @return new item or null
 */
FavBar.prototype.createItem = function (node) {
    if (!node) {
        return null;
    }

    switch (node.nodeName) {
    case 'folder':
        var item = document.createElement('div');
        item.innerHTML = node.getAttribute('title');
        item.className = 'folder';
        return item;
    case 'link':
        var item = document.createElement('div');
        item.innerHTML = node.getAttribute('title');
        // item.dataset['url'] = node.getAttribute('url');
        item.className = 'link';
        return item;
    default:
        return null;
    }
};


/**
    create and return "more" button element
    @return "more" button element
 */
FavBar.prototype.createMoreBtn = function () {
    var more = document.createElement('div');
    more.innerHTML = '&raquo;';
    more.className = 'more';
    return more;
};


/**
    change and set current mode
    set class name and the property
    @param node
 */
FavBar.prototype.setMode = function (mode) {
    var MODE_MAP = {
            'no-more': true,
            'has-more': true,
            'empty': true
        };

    if (MODE_MAP[mode]) {
        this.mode = mode;
        this.ul.className = mode;
    }
};


/**
    assuming that view has more. and than check whether the list
    need append more item or remove unnecessary item. at last
    adjust the width of the last item
 */
FavBar.prototype.updateView = function () {
    var that = this;
    var ul = this.ul;
    var more = this.more;
    var totalWidth = ul.offsetWidth;
    var node = this.lastVisibleNode;
    var item = this.lastVisibleItem;

    /**
        check whether the item need append or remove more by
        comparing totalWidth and appendWidth/removeWidth. if the
        space is enough to show all items, set mode "no-more"
        @return whether the item need append or remove more
     */
    function checkChange() {
        if (totalWidth > that.appendWidth) {
            // revert the width to original to detect the
            // possiable width records adjust
            item.style.width = 'auto';

            // find next and check current mode
            node = node.nextSibling;
            if (!node) {
                that.setMode('no-more');
                return true;
            }

            // append another item and adjust width records
            item = that.createItem(node);
            that.lastVisibleNode = node;
            that.lastVisibleItem = item;
            ul.insertBefore(item, more);
            that.removeWidth = that.appendWidth;
            that.appendWidth += (item.offsetWidth + 4);
        }
        else if (totalWidth < that.removeWidth) {
            // find back one
            that.lastVisibleNode = node.previousSibling;
            that.lastVisibleItem = item.previousSibling;

            // remove last visible item
            ul.removeChild(item);
            node = that.lastVisibleNode;
            item = that.lastVisibleItem;

            // adjust width records
            that.appendWidth = that.removeWidth;
            that.removeWidth -= (item.offsetWidth + 4);
        }
        else {
            return false;
        }

        return true;
    }

    // assuming "has-more" and get new total width
    this.setMode('has-more');
    this.totalWidth = totalWidth;
    var needUpdateView = checkChange();

    // check and change view until updating finished
    while (needUpdateView && this.mode == 'has-more') {
        needUpdateView = checkChange();
    }

    // adjust width of the last visible item when "has-more"
    if (this.mode == 'has-more') {
        item.style.width = totalWidth - this.removeWidth + 'px';
    }
};




var favBar = new FavBar(getFavData());



