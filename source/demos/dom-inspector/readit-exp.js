/*jslint undef: true, nomen: true, eqeqeq: true, plusplus: true, newcap: true, immed: true, browser: true, devel: true, passfail: false */
/*global window: false, readConvertLinksToFootnotes: false, readStyle: false, readSize: false, readMargin: false, Typekit: false, ActiveXObject: false */

(function () {

var logs = []
var dbg = (typeof console !== 'undefined' && console.log) ? function() {
    var args = [].slice.apply(arguments)
    console.log("Readability: " + args.toString());
} : function() {
    var args = [].slice.apply(arguments)
    logs.push(args)
};

window.___logs = logs
window.___ = function (uid) {return document.querySelector('[data-reader-node-uid="' + uid + '"]')}

var STYLESHEET = '<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.0-rc1/css/bootstrap.min.css"><style>body {max-width: 800px; margin: 40px auto;}</style>'

/*
 * Readability. An Arc90 Lab Experiment.
 * Website: http://lab.arc90.com/experiments/readability
 * Source:  http://code.google.com/p/arc90labs-readability
 *
 * "Readability" is a trademark of Arc90 Inc and may not be used without explicit permission.
 *
 * Copyright (c) 2010 Arc90 Inc
 * Readability is licensed under the Apache License, Version 2.0.
**/
var readability = {
    bodyCache:               null,   /* Cache the body HTML in case we need to re-use it later */
    flags:                   0x1 | 0x2 | 0x4,   /* Start with all flags set. */

    /* constants */
    FLAG_STRIP_UNLIKELYS:     0x1,
    FLAG_WEIGHT_CLASSES:      0x2,
    FLAG_CLEAN_CONDITIONALLY: 0x4,

    parsedPages: {}, /* The list of pages we've parsed in this call of readability, for autopaging. As a key store for easier searching. */

    /**
     * All of the regular expressions in use within readability.
     * Defined up here so we don't instantiate them repeatedly in loops.
     **/
    regexps: {
        unlikelyCandidates:    /combx|comment|community|disqus|reply|extra|foot|header|menu|ctrl|control|action|vote|tiearea|remark|rss|shoutbox|sidebar|sponsor|ad-break|agegate|pagination|pager|popup|tweet|twitter/ig,
        okMaybeItsACandidate:  /and|article|body|column|main|shadow/ig,
        positive:              /article|body|content|entry|hentry|main|page|pagination|post|text|blog|story/i,
        negative:              /combx|comment|com-|contact|foot|footer|footnote|masthead|media|meta|outbrain|promo|related|scroll|shoutbox|sidebar|sponsor|shopping|tags|tool|widget/i,
        extraneous:            /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single/i,
        divToPElements:        /<(a|blockquote|dl|div|img|ol|p|pre|table|ul)/i,
        replaceBrs:            /(<br[^>]*>[ \n\r\t]*){2,}/gi,
        replaceFonts:          /<(\/?)font[^>]*>/gi,
        trim:                  /^\s+|\s+$/g,
        normalize:             /\s{2,}/g,
        killBreaks:            /(<br\s*\/?>(\s|&nbsp;?)*){1,}/g,
        nextLink:              /(下页|下一页|next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i, // Match: next, continue, >, >>, » but not >|, »| as those usually mean last.
        nextSectionLink:         /(下一章|下一篇|下一节|余下全文|剩余全文)/i,
        prevLink:              /(上页|上一页prev|earl|old|new|<|«)/i
    },
    // changelog:
        // ctrl, control, vote, action
        // tiearea for 163 comment system
        // find #content to avoid to be removed

    utils: {

        /**
         * Clean all "display: none" node
         *
         **/
        simplifyDom: function (parent) {
            var children = parent && parent.childNodes

            if (!children) {
                return
            }

            children = [].slice.apply(children)

            children.forEach(function (node) {
                if (!node) {
                    return
                }

                var type = node.nodeType,
                    tagName = (node.tagName || '').toLowerCase()

                if (type === document.TEXT_NODE) {
                    return
                }

                if (type === document.COMMENT_NODE || type === document.CDATA_SECTION_NODE) {
                    parent.removeChild(node)
                }

                if (type === document.ELEMENT_NODE) {
                    
                    if (tagName === 'style' || tagName === 'link') {
                        return
                    }

                    if (!node.getBoundingClientRect().height) {
                        parent.removeChild(node)
                    }

                    readability.utils.simplifyDom(node)
                }
            })
        },

        clearEmptyDom: function () {
            var alltags = document.getElementsByTagName('*')

            for (var i = alltags.length - 1; i >= 0; i--) {
                var node = alltags[i], parent = node.parentNode

                node.setAttribute('data-reader-node-uid', i)

                if (!parent) {
                    continue
                }
                if (!node.innerHTML || (!!node.innerHTML.match(/^\s*$/ig))) {
                    if (node.tagName.toLowerCase() === 'img' && node.src) {
                        continue
                    }
                    if (node.tagName.toLowerCase() === 'link' && node.rel === 'stylesheet') {
                        continue
                    }
                    if (node.tagName.toLowerCase() === 'style') {
                        continue
                    }
                    parent.removeChild(node)
                }   
            }
        },

        /**
         * Initialize a node with the readability object. Also checks the
         * className/id for special names to add to its score.
         *
         * @param Element
         * @return void
        **/
        initNode: function (node) {
            node.contentScore = 0;

            switch(node.tagName) {
                case 'DIV':
                    node.contentScore += 5;
                    break;

                case 'PRE':
                case 'TD':
                case 'BLOCKQUOTE':
                    node.contentScore += 3;
                    break;

                case 'ADDRESS':
                case 'OL':
                case 'UL':
                case 'DL':
                case 'DD':
                case 'DT':
                case 'LI':
                case 'FORM':
                    node.contentScore -= 3;
                    break;

                case 'H1':
                case 'H2':
                case 'H3':
                case 'H4':
                case 'H5':
                case 'H6':
                case 'TH':
                    node.contentScore -= 5;
                    break;
            }

            node.contentScore += readability.utils.getClassWeight(node);
        },

        /**
         * Removes script tags from the document.
         *
         * @param Element
        **/
        removeScripts: function (doc) {
            var scripts = doc.getElementsByTagName('script');
            for(var i = scripts.length-1; i >= 0; i-=1)
            {
                if(typeof(scripts[i].src) === "undefined" || (scripts[i].src.indexOf('readability') === -1 && scripts[i].src.indexOf('typekit') === -1))
                {
                    scripts[i].nodeValue="";
                    scripts[i].removeAttribute('src');
                    if (scripts[i].parentNode) {
                            scripts[i].parentNode.removeChild(scripts[i]);
                    }
                }
            }
        },

        /**
         * Get the inner text of a node - cross browser compatibly.
         * This also strips out any excess whitespace to be found.
         *
         * @param Element
         * @return string
        **/
        getInnerText: function (e, normalizeSpaces) {
            var textContent    = "";

            if(typeof(e.textContent) === "undefined" && typeof(e.innerText) === "undefined") {
                return "";
            }

            normalizeSpaces = (typeof normalizeSpaces === 'undefined') ? true : normalizeSpaces;

            if (navigator.appName === "Microsoft Internet Explorer") {
                textContent = e.innerText.replace( readability.regexps.trim, "" ); }
            else {
                textContent = e.textContent.replace( readability.regexps.trim, "" ); }

            if(normalizeSpaces) {
                return textContent.replace( readability.regexps.normalize, " "); }
            else {
                return textContent; }
        },

        /**
         * Get the number of times a string s appears in the node e.
         *
         * @param Element
         * @param string - what to split on. Default is ","
         * @return number (integer)
        **/
        getCharCount: function (e,s) {
            s = s || ",";
            return readability.utils.getInnerText(e).split(s).length-1;
        },

        /**
         * Get the density of links as a percentage of the content
         * This is the amount of text that is inside a link divided by the total text in the node.
         *
         * @param Element
         * @return number (float)
        **/
        getLinkDensity: function (e) {
            var links      = e.getElementsByTagName("a");
            var textLength = readability.utils.getInnerText(e).length;
            var linkLength = 0;
            for(var i=0, il=links.length; i<il;i+=1)
            {
                linkLength += readability.utils.getInnerText(links[i]).length;
            }

            return linkLength / textLength;
        },

        /**
         * Remove the style attribute on every e and under.
         * TODO: Test if getElementsByTagName(*) is faster.
         *
         * @param Element
         * @return void
        **/
        cleanStyles: function (e) {
            e = e || document;
            var cur = e.firstChild;

            if (!e) {
                return;
            }

            // Remove any root styles, if we're able.
            if (typeof e.removeAttribute === 'function') {
                e.removeAttribute('style');
            }

            // Go until there are no more child nodes
            while ( cur !== null ) {
                if ( cur.nodeType === 1 ) {
                    // Remove style attribute(s) :
                    cur.removeAttribute("style");
                    readability.utils.cleanStyles( cur );
                }
                cur = cur.nextSibling;
            }
        },

        /**
         * Get an elements class/id weight. Uses regular expressions to tell if this
         * element looks good or bad.
         *
         * @param Element
         * @return number (Integer)
        **/
        getClassWeight: function (e) {
            var weight = 0;

            /* Look for a special classname */
            if (typeof(e.className) === 'string' && e.className !== '')
            {
                if(e.className.search(readability.regexps.negative) !== -1) {
                    weight -= 25; }

                if(e.className.search(readability.regexps.positive) !== -1) {
                    weight += 25; }
            }

            /* Look for a special ID */
            if (typeof(e.id) === 'string' && e.id !== '')
            {
                if(e.id.search(readability.regexps.negative) !== -1) {
                    weight -= 25; }

                if(e.id.search(readability.regexps.positive) !== -1) {
                    weight += 25; }
            }

            return weight;
        },

        /**
         * Remove extraneous break tags from a node.
         *
         * @param Element
         * @return void
         **/
        killBreaks: function (e) {
            try {
                e.innerHTML = e.innerHTML.replace(readability.regexps.killBreaks,'<br />');
            }
            catch (eBreaks) {
                dbg("KillBreaks failed - this is an IE bug. Ignoring.: " + eBreaks);
            }
        },

        /**
         * Clean a node of all elements of type "tag".
         * (Unless it's a youtube/vimeo video. People love movies.)
         *
         * @param Element
         * @param string tag to clean
         * @return void
         **/
        clean: function (e, tag) {
            var targetList = e.getElementsByTagName( tag );

            for (var y=targetList.length-1; y >= 0; y-=1) {
                targetList[y].parentNode.removeChild(targetList[y]);
            }
        },

        /**
         * Clean an element of all tags of type "tag" if they look fishy.
         * "Fishy" is an algorithm based on content length, classnames, link density, number of images & embeds, etc.
         *
         * @return void
         **/
        cleanConditionally: function (e, tag) {

            var tagsList      = e.getElementsByTagName(tag);
            var curTagsLength = tagsList.length;

            /**
             * Gather counts for other typical elements embedded within.
             * Traverse backwards so we can remove nodes at the same time without effecting the traversal.
             *
             * TODO: Consider taking into account original contentScore here.
            **/
            for (var i = curTagsLength - 1; i >= 0; i -= 1) {
                var tag = tagsList[i];
                var weight = readability.utils.getClassWeight(tag);

                var contentScore = tag.contentScore || 0;

                dbg("Cleaning Conditionally " + tag + " (" + tag.className + ":" + tag.id + ")" + ((typeof tag.contentScore !== 'undefined') ? (" with score " + tag.contentScore) : ''));

                if (weight + contentScore < 0) {
                    // dbg(21, tag.outerHTML)
                    tag.parentNode.removeChild(tag);
                }
                else if (readability.utils.getCharCount(tag, ',') < 10) {
                    /**
                     * If there are not very many commas, and the number of
                     * non-paragraph elements is more than paragraphs or other ominous signs, remove the element.
                    **/
                    var p      = tag.getElementsByTagName("p").length;
                    var img    = tag.getElementsByTagName("img").length;
                    var li     = tag.getElementsByTagName("li").length - 100;
                    var input  = tag.getElementsByTagName("input").length;

                    var linkDensity   = readability.utils.getLinkDensity(tag);
                    var contentLength = readability.utils.getInnerText(tag).length;
                    var toRemove      = false;

                    if (img === 1 && p === 0) {
                        tag.getElementsByTagName('img')[0].style.display = 'block'
                    }
                    else if (img > p) {
                        // dbg(22, tag.outerHTML)
                        toRemove = true;
                    }
                    else if (li > p && tag !== "ul" && tag !== "ol") {
                        // dbg(23, tag.outerHTML)
                        toRemove = true;
                    }
                    else if (input > Math.floor(p/3)) {
                        // dbg(24, tag.outerHTML)
                        toRemove = true;
                    }
                    else if (contentLength < 25 && (img === 0 || img > 2) ) {
                        // dbg(25, tag.outerHTML)
                        toRemove = true;
                    }
                    else if (weight < 25 && linkDensity > 0.2) {
                        // dbg(26, tag.outerHTML)
                        toRemove = true;
                    }
                    else if (weight >= 25 && linkDensity > 0.5) {
                        // dbg(27, tag.outerHTML)
                        toRemove = true;
                    }

                    if (toRemove) {
                        tag.parentNode.removeChild(tag);
                    }
                }
            }
        },

        /**
         * Clean out spurious headers from an Element. Checks things like classnames and link density.
         *
         * @param Element
         * @return void
        **/
        cleanHeaders: function (e, firstHeaderUid) {

            for (var headerIndex = 1; headerIndex <= 3; headerIndex+=1) {
                var headers = e.getElementsByTagName('h' + headerIndex);
                for (var i=headers.length-1; i >=0; i-=1) {
                    var header = headers[i]
                    var uid = header.getAttribute('data-reader-node-uid')

                    if (headerIndex < 3 &&
                            (readability.utils.getClassWeight(header) < 0 ||
                            readability.utils.getLinkDensity(header) > 0.33)) {

                        header.parentNode.removeChild(header);
                    }

                    if (uid > 0 && uid < firstHeaderUid) {
                        header.parentNode.removeChild(header);
                    }
                }
            }
        }

    },

    /**
     * Runs readability.
     *
     * Workflow:
     *  1. Prep the document by removing script tags, css, etc.
     *  2. Build readability's DOM tree.
     *  3. Grab the article content from the current dom tree.
     *  4. Replace the current DOM tree with the new one.
     *  5. Read peacefully.
     *
     * @return void
     **/
    init: function() {
        if(document.body && !readability.bodyCache) {
            readability.utils.simplifyDom(document.body)
            readability.utils.clearEmptyDom()

            readability.bodyCache = document.createDocumentFragment();
            readability.bodyCache = document.body.cloneNode(true);
            dbg(document.body, readability.bodyCache)
        }

        /* Make sure this document is added to the list of parsed pages first, so we don't double up on the first page */
        readability.parsedPages[window.location.href.replace(/\/$/, '')] = true;

        readability.prepDocument();

        /* Build readability's DOM tree */
        readability.nextPageLink = readability.findNextPageLink(readability.bodyCache);
        readability.articleTitle   = readability.getArticleTitle();
        readability.articleContent = readability.grabArticle();
    },


    /**
     * Get the article title as an H1.
     *
     * @return void
     **/
    getArticleTitle: function () {
        var curTitle = "",
            origTitle = "";

        try {
            curTitle = origTitle = document.title;

            if(typeof curTitle !== "string") { /* If they had an element with id "title" in their HTML */
                curTitle = origTitle = readability.utils.getInnerText(document.getElementsByTagName('title')[0]);
            }
        }
        catch(e) {}

        if(curTitle.match(/ [\|\-] /))
        {
            curTitle = origTitle.replace(/(.*)[\|\-] .*/gi,'$1');

            if(curTitle.split(' ').length < 3) {
                curTitle = origTitle.replace(/[^\|\-]*[\|\-](.*)/gi,'$1');
            }
        }
        else if(curTitle.indexOf(': ') !== -1)
        {
            curTitle = origTitle.replace(/.*:(.*)/gi, '$1');

            if(curTitle.split(' ').length < 3) {
                curTitle = origTitle.replace(/[^:]*[:](.*)/gi,'$1');
            }
        }
        else if(curTitle.length > 150 || curTitle.length < 15)
        {
            var hOnes = document.getElementsByTagName('h1');
            if(hOnes.length === 1)
            {
                curTitle = readability.utils.getInnerText(hOnes[0]);
            }
        }

        curTitle = curTitle.replace( readability.regexps.trim, "" );

        if(curTitle.split(' ').length <= 4) {
            curTitle = origTitle;
        }

        return curTitle;
    },

    /**
     * Prepare the HTML document for readability to scrape it.
     * This includes things like stripping javascript, CSS, and handling terrible markup.
     *
     * @return void
     **/
    prepDocument: function () {
        /* Remove all scripts that are not readability. */
        readability.utils.removeScripts(readability.bodyCache);

        /* Turn all double br's into p's */
        /* Note, this is pretty costly as far as processing goes. Maybe optimize later. */
        readability.bodyCache.innerHTML = readability.bodyCache.innerHTML.replace(readability.regexps.replaceBrs, '</p><p data-reader-node-uid="-1">').replace(readability.regexps.replaceFonts, '<$1span data-reader-node-uid="-2">');
    },

    /**
     * Prepare the article node for display. Clean out any inline styles,
     * iframes, forms, strip extraneous <p> tags, etc.
     *
     * @param Element
     * @return void
     **/
    prepArticle: function (articleContent) {
        var firstHeaderUid
        var firstHeader = readability.findFirstHeader(articleContent)

        if (firstHeader) {
            firstHeaderUid = firstHeader.getAttribute('data-reader-node-uid') || -1
        }

        readability.utils.cleanStyles(articleContent);
        readability.utils.clean(articleContent, "style");
        readability.utils.clean(articleContent, "link");
        readability.utils.killBreaks(articleContent);

        /* Clean out junk from the article content */
        readability.utils.cleanConditionally(articleContent, "form");
        readability.utils.clean(articleContent, "object");
        readability.utils.clean(articleContent, "h1");

        /**
         * If there is only one h2, they are probably using it
         * as a header and not a subheader, so remove it since we already have a header.
        ***/
        if(articleContent.getElementsByTagName('h2').length === 1) {
            readability.utils.clean(articleContent, "h2");
        }
        readability.utils.clean(articleContent, "iframe");

        readability.utils.cleanHeaders(articleContent, firstHeaderUid);

        /* Do these last as the previous stuff may have removed junk that will affect these */
        readability.utils.cleanConditionally(articleContent, "table");
        readability.utils.cleanConditionally(articleContent, "ul");
        readability.utils.cleanConditionally(articleContent, "div");

        /* Remove extra paragraphs */
        var articleParagraphs = articleContent.getElementsByTagName('p');
        for(var i = articleParagraphs.length-1; i >= 0; i-=1) {
            var p = articleParagraphs[i]
            var imgCount    = p.getElementsByTagName('img').length;
            var embedCount  = p.getElementsByTagName('embed').length;
            var objectCount = p.getElementsByTagName('object').length;

            if(imgCount === 0 && embedCount === 0 && objectCount === 0 &&
                    readability.utils.getInnerText(p, false) === '') {
                // dbg(11, p.outerHTML)
                articleParagraphs[i].parentNode.removeChild(p);
            }
        }

        try {
            articleContent.innerHTML = articleContent.innerHTML.replace(/<br[^>]*>\s*<p/gi, '<p');
        }
        catch (e) {
            dbg("Cleaning innerHTML of breaks failed. This is an IE strict-block-elements bug. Ignoring.: " + e);
        }
    },

    /**
     * Trash nodes that look cruddy (like ones with the class name "comment", etc).
     *
    **/
    cleanUnlikely: function (page) {
        page = page ? page : readability.bodyCache;

        dbg(1, page)
        var contentElement = page.querySelector('#content');
        var contentUidTree = []

        dbg(2, contentElement)
        while (contentElement) {
            contentUidTree.push(contentElement.getAttribute('data-reader-node-uid'))
            contentElement = contentElement.parentNode
        }

        dbg(3, contentUidTree)

        function matchContentTree(uid) {
            var match = false

            uid = parseInt(uid)

            contentUidTree.forEach(function (v) {
                v = parseInt(v)
                if (v > 0 && uid === v) {
                    match = true
                }
            })

            return match
        }

        var node = null, unlikelyMatchString;
        var allElements = page.getElementsByTagName('*');
        var matchUnlikely, matchLikely

        for(var nodeIndex = 0; (node = allElements[nodeIndex]); nodeIndex+=1) {
            keywords = node.className + node.id;
            matchUnlikely = keywords.match(readability.regexps.unlikelyCandidates)
            matchLikely = keywords.match(readability.regexps.okMaybeItsACandidate)

            if (matchUnlikely && node.tagName !== "BODY") {
                if (!matchLikely || matchUnlikely.length >= matchLikely.length) {
                    dbg("Removing unlikely candidate - " + keywords);
                    if (!matchContentTree(node.getAttribute('data-reader-node-uid'))) {
                        dbg(4, 'not match')
                        node.parentNode.removeChild(node);
                        nodeIndex-=1;
                    }
                    else {
                        dbg('matched', node)
                    }
                }
            }
        }
    },

    findFirstHeader: function (page) {
        page = page ? page : readability.bodyCache;

        var h1List, h2List

        h1List = page.getElementsByTagName('h1')
        h2List = page.getElementsByTagName('h2')

        if (h1List.length > 0) {
            return h1List[0]
        }

        if (h2List.length === 1) {
            return h2List[0]
        }

        return null
    },

    findFirstBigImage: function (page) {
        page = page ? page : readability.bodyCache;

        var allImages = page.getElementsByTagName('img')
        var length = allImages.length
        var topImg, topSize

        // size: 200000
        // ratio: 0.25 ~ 4
        // top: 400
        // 300, 350
        for (var i = 0; i < length; i++) {
            var img = allImages[i]
            var uid = img.getAttribute('data-reader-node-uid')
            img = document.querySelector('[data-reader-node-uid="' + uid + '"]')

            if (!img) {
                continue
            }

            var size = img.width * img.height
            var ratio = Math.min(img.width, img.height) / Math.max(img.width, img.height)
            var top = img.getBoundingClientRect().top

            size = size * Math.sin(Math.PI/2 * ratio) / 100
            top = Math.abs(top - 400)

            if (size < 300 || top > 350) {
                continue
            }

            if (!topImg) {
                topImg = img
                topSize = size
            }
            else {
                if (size > topSize) {
                    topImg = img
                    topSize = size
                }
            }
        }

        return topImg
    },

    /**
     * turn divs into P tags where they have been used inappropriately
     * (as in, where they contain no other block level elements.)
    **/
    findNodesToScore: function (page) {
        page = page ? page : readability.bodyCache;

        var allElements = page.getElementsByTagName('*');

        var node = null;
        var nodesToScore = [];
        var newNode, childNode, p

        dbg('all length', page, allElements.length)

        for (var nodeIndex = 0; (node = allElements[nodeIndex]); nodeIndex += 1) {

            if (node.tagName === "P" || node.tagName === "TD" || node.tagName === "PRE") {
                dbg(node)
                nodesToScore.push(node);
            }

            /* Turn all divs that don't have children block level elements into p's */
            if (node.tagName === "DIV") {

                if (node.innerHTML.search(readability.regexps.divToPElements) === -1) {

                    newNode = document.createElement('p');
                    newNode.innerHTML = node.innerHTML;
                    newNode.setAttribute('data-reader-node-uid', node.getAttribute('data-reader-node-uid'))
                    node.parentNode.replaceChild(newNode, node);
                    nodeIndex-=1;
                    nodesToScore.push(newNode);
                }
                else {
                    for(var i = 0, il = node.childNodes.length; i < il; i+=1) {
                        childNode = node.childNodes[i];

                        if (childNode.nodeType === 3) { // Node.TEXT_NODE
                            if (!childNode.textContent.match(/^\s*$/)) {
                                span = document.createElement('span');
                                span.innerHTML = childNode.nodeValue;
                                span.setAttribute('data-reader-node-uid', '-3')
                                childNode.parentNode.replaceChild(span, childNode);
                            }
                        }
                    }
                }
            }
        }

        return nodesToScore
    },

    /**
     * Loop through all paragraphs, and assign a score to them based on how content-y they look.
     * Then add their score to their parent node.
     *
     * A score is determined by things like number of commas, class names, etc. Maybe eventually link density.
    **/
    findCandidates: function (nodesToScore) {
        var candidates = [];

        var parentNode, grandParentNode, innerText, contentScore

        for (var pt=0; pt < nodesToScore.length; pt+=1) {
            parentNode      = nodesToScore[pt].parentNode;
            grandParentNode = parentNode ? parentNode.parentNode : null;
            innerText       = readability.utils.getInnerText(nodesToScore[pt]);

            if (!parentNode || (typeof parentNode.tagName === 'undefined')) {
                continue;
            }

            /* If this paragraph is less than 25 characters, don't even count it. */
            if (innerText.length < 25) {
                continue;
            }

            /* Initialize readability data for the parent. */
            if (typeof parentNode.contentScore === 'undefined') {
                readability.utils.initNode(parentNode);
                candidates.push(parentNode);
            }

            /* Initialize readability data for the grandparent. */
            if (grandParentNode &&
                    typeof(grandParentNode.contentScore) === 'undefined' &&
                    typeof(grandParentNode.tagName) !== 'undefined') {

                readability.utils.initNode(grandParentNode);
                candidates.push(grandParentNode);
            }

            contentScore = 1;

            /* Add points for any commas within this paragraph */
            contentScore += innerText.split(',').length;

            /* For every 100 characters in this paragraph, add another point. Up to 3 points. */
            contentScore += Math.min(Math.floor(innerText.length / 100), 3);

            /* Add the score to the parent. The grandparent gets half. */
            parentNode.contentScore += contentScore;

            if (grandParentNode) {
                grandParentNode.contentScore += contentScore / 2;
            }
        }

        return candidates
    },

    /**
     * After we've calculated scores, loop through all of the possible candidate nodes we found
     * and find the one with the highest score.
     *
     * Scale the final candidates score based on link density. Good content should have a
     * relatively small link density (5% or less) and be mostly unaffected by this operation.
    **/
    findTopCandidate: function (candidates) {
        var topCandidate = null;

        var candidate, density

        for(var c=0, cl=candidates.length; c < cl; c+=1) {
            candidate = candidates[c]
            density = readability.utils.getLinkDensity(candidate)

            candidate.contentScore = candidate.contentScore * (1 - density);

            dbg('Candidate: ' + candidate + " (" + candidate.className + ":" + candidate.id + ") with score " + candidate.contentScore);

            if (!topCandidate || candidate.contentScore > topCandidate.contentScore) {
                topCandidate = candidate;
            }
        }

        return topCandidate
    },

    /**
     * Now that we have the top candidate, look through its siblings for content that might also be related.
     * Things like preambles, content split by ads that we removed, etc.
    **/
    findAllContent: function (topCandidate) {
        var allContent = [];
        var siblingScoreThreshold = Math.max(10, topCandidate.contentScore * 0.2);
        var siblingNodes = topCandidate.parentNode.childNodes;

        var siblingNode, append, contentBonus, tagName,
            density, content, contentLength, nodeToAppend, contentScore

        for (var s = 0, sl = siblingNodes.length; s < sl; s += 1) {
            siblingNode  = siblingNodes[s];
            append       = false;
            contentBonus = 0;
            contentScore = siblingNode.contentScore

            /**
             * Fix for odd IE7 Crash where siblingNode does not exist even though this should be a live nodeList.
             * Example of error visible here: http://www.esquire.com/features/honesty0707
            **/
            if (!siblingNode) {
                continue;
            }

            dbg("Looking at sibling node: " + siblingNode + " (" + siblingNode.className + ":" + siblingNode.id + ")" + ((typeof siblingNode.contentScore !== 'undefined') ? (" with score " + siblingNode.contentScore) : ''));
            dbg("Sibling has score " + (siblingNode.contentScore ? siblingNode.contentScore : 'Unknown'));

            if (siblingNode === topCandidate) {
                append = true;
            }
            else {
                /* Give a bonus if sibling nodes and top candidates have the example same classname */
                if (topCandidate.className !== "" && siblingNode.className === topCandidate.className) {
                    contentBonus += topCandidate.contentScore * 0.2;
                }

                if (typeof contentScore !== 'undefined' && (contentScore + contentBonus) >= siblingScoreThreshold) {
                    append = true;
                }
                else {
                    if (siblingNode.nodeName === "P") {
                        density = readability.utils.getLinkDensity(siblingNode);
                        content = readability.utils.getInnerText(siblingNode);
                        contentLength  = content.length;

                        if (contentLength > 80 && density < 0.25) {
                            append = true;
                        }
                        else if (contentLength < 80 && density === 0 && content.search(/\.( |$)/) !== -1) {
                            append = true;
                        }
                    }
                }
            }

            if (!append) {
                continue
            }

            dbg("Appending node: " + siblingNode + siblingNode.className + siblingNode.id);

            tagName = siblingNode.nodeName
            /* We have a node that isn't a common block level element, like a form or td tag. Turn it into a div so it doesn't get filtered out later by accident. */
            if (tagName !== "DIV" && tagName !== "P") {
                dbg("Altering siblingNode of " + siblingNode.nodeName + ' to div.');
                tagName = 'DIV'
            }

            nodeToAppend = document.createElement(tagName);
            nodeToAppend.id = siblingNode.id;
            nodeToAppend.innerHTML = siblingNode.innerHTML;
            nodeToAppend.setAttribute('data-reader-node-uid', siblingNode.getAttribute('data-reader-node-uid'))

            /* Append sibling and subtract from our list because it removes the node when you append to another node */
            allContent.push(nodeToAppend);
        }

        return allContent
    },

    cleanFloatContent: function (articleContent) {
        var list = articleContent.getElementsByTagName('div')
        var length = list.length

        for (var i = 0; i < length; i++) {
            var node = list[i]

            if (!node) {
                continue
            }

            if (node.parentNode === articleContent) {
                continue
            }

            var uid = node.getAttribute('data-reader-node-uid')

            if (!uid) {
                continue
            }

            var oriNode = document.querySelector('[data-reader-node-uid="' + uid + '"]')

            if (!oriNode) {
                continue
            }

            var computedStyle = window.getComputedStyle(oriNode)

            if (!computedStyle) {
                continue
            }

            var cssFloat = computedStyle.float
            var cssPosition = computedStyle.position

            if (cssFloat && cssFloat !== 'none') {
                // dbg(31, node.outerHTML)
                node.innerHTML = ''
                node.style.display = 'none'
            }
            else if (cssPosition && (cssPosition !== 'relative' && cssPosition !== 'static')) {
                // dbg(32, node.outerHTML)
                node.innerHTML = ''
                node.style.display = 'none'
            }
        }
    },

    checkFirstBigImage: function (articleContent, img) {
        if (!img) {
            return
        }

        var uid = img.getAttribute('data-reader-node-uid')
        var newImg

        var allElements = articleContent.getElementsByTagName('*')
        var length = allElements.length

        for (var i = 0; i < length; i++) {
            var element = allElements[i]
            var tempUid = element.getAttribute('data-reader-node-uid')

            if (element.tagName === 'IMG' && tempUid === uid) {
                newImg = element
            }
        }

        if (uid && !newImg) {
            newImg = document.createElement('img')
            newImg.src = img.src
            newImg.id = img.id
            newImg.style.display = 'block'
            newImg.setAttribute('data-reader-node-uid', uid)
            articleContent.insertBefore(newImg, articleContent.firstChild)
        }
    },

    /***
     * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
     *               most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
     *
     * @param page a document to run upon. Needs to be a full document, complete with body.
     * @return Element
    **/
    grabArticle: function (page) {

        readability.cleanUnlikely(page)

        var firstBigImage = readability.findFirstBigImage(page)
        dbg(firstBigImage)

        var nodesToScore = readability.findNodesToScore(page)
        dbg('nodes to score', nodesToScore)

        var candidates = readability.findCandidates(nodesToScore)
        dbg('candidates', candidates)

        var topCandidate = readability.findTopCandidate(candidates)
        dbg('top candidate', topCandidate)

        /**
         * If we still have no top candidate, just use the body as a last resort.
         * We also have to copy the body node so it is something we can modify.
         **/
        if (topCandidate === null || topCandidate.tagName === "BODY") {
            dbg('no top candidate!')
            return null
        }

        var allContent = readability.findAllContent(topCandidate)
        dbg('all content', topCandidate)

        var articleContent = document.createElement('DIV')

        for (var i = 0; i < allContent.length; i++) {
            articleContent.appendChild(allContent[i])
        }

        /**
         * So we have all of the content that we need. Now we clean it up for presentation.
        **/
        readability.prepArticle(articleContent);

        readability.cleanFloatContent(articleContent);

        readability.checkFirstBigImage(articleContent, firstBigImage)

        if (readability.utils.getInnerText(articleContent, false).length < 250) {
            dbg('article content is too short!', articleContent)
            return null;
        }

        return articleContent.innerHTML;
    },

    /**
     * Find a cleaned up version of the current URL, to use for comparing links for possible next-pageyness.
     *
     * @author Dan Lacy
     * @return string the base url
    **/
    findBaseUrl: function () {
        var noUrlParams     = window.location.pathname.split("?")[0],
            urlSlashes      = noUrlParams.split("/").reverse(),
            cleanedSegments = [],
            possibleType    = "";

        for (var i = 0, slashLen = urlSlashes.length; i < slashLen; i+=1) {
            var segment = urlSlashes[i];

            // Split off and save anything that looks like a file type.
            if (segment.indexOf(".") !== -1) {
                possibleType = segment.split(".")[1];

                /* If the type isn't alpha-only, it's probably not actually a file extension. */
                if(!possibleType.match(/[^a-zA-Z]/)) {
                    segment = segment.split(".")[0];
                }
            }

            /**
             * EW-CMS specific segment replacement. Ugly.
             * Example: http://www.ew.com/ew/article/0,,20313460_20369436,00.html
            **/
            if(segment.indexOf(',00') !== -1) {
                segment = segment.replace(',00', '');
            }

            // If our first or second segment has anything looking like a page number, remove it.
            if (segment.match(/((_|-)?p[a-z]*|(_|-))[0-9]{1,2}$/i) && ((i === 1) || (i === 0))) {
                segment = segment.replace(/((_|-)?p[a-z]*|(_|-))[0-9]{1,2}$/i, "");
            }


            var del = false;

            /* If this is purely a number, and it's the first or second segment, it's probably a page number. Remove it. */
            if (i < 2 && segment.match(/^\d{1,2}$/)) {
                del = true;
            }

            /* If this is the first segment and it's just "index", remove it. */
            if(i === 0 && segment.toLowerCase() === "index") {
                del = true;
            }

            /* If our first or second segment is smaller than 3 characters, and the first segment was purely alphas, remove it. */
            if(i < 2 && segment.length < 3 && !urlSlashes[0].match(/[a-z]/i)) {
                del = true;
            }

            /* If it's not marked for deletion, push it to cleanedSegments. */
            if (!del) {
                cleanedSegments.push(segment);
            }
        }

        // This is our final, cleaned, base article URL.
        return window.location.protocol + "//" + window.location.host + cleanedSegments.reverse().join("/");
    },

    /**
     * Look for any paging links that may occur within the document.
     *
     * @param body
     * @return object (array)
    **/
    findNextPageLink: function (elem) {
        var possiblePages = {},
            allLinks = elem.getElementsByTagName('a'),
            articleBaseUrl = readability.findBaseUrl();

        /**
         * Loop through all links, looking for hints that they may be next-page links.
         * Things like having "page" in their textContent, className or id, or being a child
         * of a node with a page-y className or id.
         *
         * Also possible: levenshtein distance? longest common subsequence?
         *
         * After we do that, assign each page a score, and
        **/
        for(var i = 0, il = allLinks.length; i < il; i+=1) {
            var link     = allLinks[i],
                linkHref = allLinks[i].href.replace(/#.*$/, '').replace(/\/$/, '');

            /* If we've already seen this page, ignore it */
            if(linkHref === "" || linkHref === articleBaseUrl || linkHref === window.location.href || linkHref in readability.parsedPages) {
                continue;
            }

            /* If it's on a different domain, skip it. */
            if(window.location.host !== linkHref.split(/\/+/g)[1]) {
                continue;
            }

            var linkText = readability.utils.getInnerText(link);

            /* If the linkText looks like it's not the next page, skip it. */
            if(linkText.match(readability.regexps.extraneous) || linkText.length > 25) {
                continue;
            }

            /* If the leftovers of the URL after removing the base URL don't contain any digits, it's certainly not a next page link. */
            var linkHrefLeftover = linkHref.replace(articleBaseUrl, '');
            if(!linkHrefLeftover.match(/\d/)) {
                continue;
            }

            if(!(linkHref in possiblePages)) {
                possiblePages[linkHref] = {"score": 0, "linkText": linkText, "href": linkHref};
            } else {
                possiblePages[linkHref].linkText += ' | ' + linkText;
            }

            var linkObj = possiblePages[linkHref];

            /**
             * If the articleBaseUrl isn't part of this URL, penalize this link. It could still be the link, but the odds are lower.
             * Example: http://www.actionscript.org/resources/articles/745/1/JavaScript-and-VBScript-Injection-in-ActionScript-3/Page1.html
            **/
            if(linkHref.indexOf(articleBaseUrl) !== 0) {
                linkObj.score -= 25;
            }

            var linkData = linkText + ' ' + link.className + ' ' + link.id;
            if(linkData.match(readability.regexps.nextLink)) {
                linkObj.score += 50;
            }
            if(linkData.match(readability.regexps.nextSectionLink)) {
                linkObj.score += 25;
            }
            if(linkData.match(/pag(e|ing|inat)/i)) {
                linkObj.score += 25;
            }
            if(linkData.match(/(first|last)/i)) { // -65 is enough to negate any bonuses gotten from a > or » in the text,
                /* If we already matched on "next", last is probably fine. If we didn't, then it's bad. Penalize. */
                if(!linkObj.linkText.match(readability.regexps.nextLink)) {
                    linkObj.score -= 65;
                }
            }
            if(linkData.match(readability.regexps.negative) || linkData.match(readability.regexps.extraneous)) {
                linkObj.score -= 50;
            }
            if(linkData.match(readability.regexps.prevLink)) {
                linkObj.score -= 200;
            }

            /* If a parentNode contains page or paging or paginat */
            var parentNode = link.parentNode,
                positiveNodeMatch = false,
                negativeNodeMatch = false;
            var parentNodeText = readability.utils.getInnerText(parentNode);
            if(parentNodeText.match(readability.regexps.nextLink)) {
                linkObj.score += 35;
            }
            if(parentNodeText.match(readability.regexps.nextSectionLink)) {
                linkObj.score += 25;
            }
            while(parentNode) {
                var parentNodeClassAndId = parentNode.className + ' ' + parentNode.id;
                if(!positiveNodeMatch && parentNodeClassAndId && parentNodeClassAndId.match(/pag(e|ing|inat)/i)) {
                    positiveNodeMatch = true;
                    linkObj.score += 25;
                }
                if(!negativeNodeMatch && parentNodeClassAndId && parentNodeClassAndId.match(readability.regexps.negative)) {
                    /* If this is just something like "footer", give it a negative. If it's something like "body-and-footer", leave it be. */
                    if(!parentNodeClassAndId.match(readability.regexps.positive)) {
                        linkObj.score -= 25;
                        negativeNodeMatch = true;
                    }
                }

                parentNode = parentNode.parentNode;
            }

            /**
             * If the URL looks like it has paging in it, add to the score.
             * Things like /page/2/, /pagenum/2, ?p=3, ?page=11, ?pagination=34
            **/
            if (linkHref.match(/p(a|g|ag)?(e|ing|ination)?(=|\/)[0-9]{1,2}/i) || linkHref.match(/(page|paging)/i)) {
                linkObj.score += 25;
            }

            /* If the URL contains negative values, give a slight decrease. */
            if (linkHref.match(readability.regexps.extraneous)) {
                linkObj.score -= 15;
            }

            /**
             * Minor punishment to anything that doesn't match our current URL.
             * NOTE: I'm finding this to cause more harm than good where something is exactly 50 points.
             *       Dan, can you show me a counterexample where this is necessary?
             * if (linkHref.indexOf(window.location.href) !== 0) {
             *    linkObj.score -= 1;
             * }
            **/

            /**
             * If the link text can be parsed as a number, give it a minor bonus, with a slight
             * bias towards lower numbered pages. This is so that pages that might not have 'next'
             * in their text can still get scored, and sorted properly by score.
            **/
            var linkTextAsNumber = parseInt(linkText, 10);
            if(linkTextAsNumber) {
                // Punish 1 since we're either already there, or it's probably before what we want anyways.
                if (linkTextAsNumber === 1) {
                    linkObj.score -= 10;
                }
                else {
                    // Todo: Describe this better
                    linkObj.score += Math.max(0, 10 - linkTextAsNumber);
                }
            }
        }

        /**
         * Loop thrugh all of our possible pages from above and find our top candidate for the next page URL.
         * Require at least a score of 50, which is a relatively high confidence that this page is the next link.
        **/
        var topPage = null;
        for(var page in possiblePages) {
            if(possiblePages.hasOwnProperty(page)) {
                if(possiblePages[page].score >= 50 && (!topPage || topPage.score < possiblePages[page].score)) {
                    topPage = possiblePages[page];
                }
            }
        }

        if(topPage) {
            var nextHref = topPage.href.replace(/\/$/,'');

            dbg('NEXT PAGE IS ' + nextHref);
            readability.parsedPages[nextHref] = true;
            return nextHref;
        }
        else {
            return null;
        }
    },

};

readability.init();

var result = {
    next: readability.nextPageLink,
    title: readability.articleTitle,
    content: readability.articleContent
};

if (result.content) {
    var output = window.open()
    output.document.write(STYLESHEET || '')
    output.document.write(result.content)
}
else {
    alert('Sorry! No content found :-(')
}

if (result.next) {
    dbg('next', result.next)
}

return readability;

})();