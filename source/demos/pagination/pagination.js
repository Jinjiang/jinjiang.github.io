$.fn.pagination = function (total, current, opt) {
    var config = {
        goBtn: false,
        edgeBtn: false,
        currentBtn: true,
        edgeRange: 0,
        edgeMore: false,
        currentRange: 1
    };
    var self = this;

    function buildBtn(text, disabled) {
        var btn = $('<button></button>').text(text);
        if (disabled) {
            btn.attr('disabled', 'disabled');
        }
        return btn;
    }

    function buildLink(text, disabled) {
        var link = $('<a href="#"></a>').text(text);
        if (disabled) {
            link.addClass('disabled');
        }
        link.click(function (e) {
            e.preventDefault();
        });
        return link;
    }

    function buildGroup(type) {
        var group = $('<span></span>').attr('class', type + '-group');
        return group;
    }

    function buildItem(text, type, disabled) {
        var item;

        switch (type) {
            case 'btn':
            item = buildBtn(text, disabled);
            break;
            case 'link':
            item = buildLink(text, disabled);
            break;
            case 'group':
            item = buildGroup(type);
            break;
            default:
            ;
        }

        return item;
    }

    function initConfig(total, current, opt) {
        opt = opt || {};
        $.each(config, function (k, v) {
            if (opt.hasOwnProperty(k)) {
                config[k] = opt[k];
            }
        });
        config.edgeRange = parseInt(config.edgeRange) || 0;
        config.currentRange = parseInt(config.currentRange) || 0;
    }

    function build(total, current, config) {
        var linkMap = {};
        var linkList = [];

        var linkGroup;
        var goGroup;

        var lastPage;

        var edgeMore = !!config.edgeMore;
        var currentBtn = !!config.currentBtn;
        var edgeBtn = !!config.edgeBtn;
        var goBtn = !!config.goBtn;

        function regLink(i) {
            var link;

            if (i < 1 || i > total) {
                return;
            }
            if (!linkMap[i]) {
                link = buildLink(i, i === current);
                link.attr('data-page', i);
                linkMap[i] = link;
                linkList.push(i);
            }
        }

        for (var i = 0; i < config.currentRange; i++) {
            regLink(current + i);
            regLink(current - i);
        }

        for (var i = 0; i < config.edgeRange; i++) {
            regLink(1 + i);
            regLink(total - i);
        }

        linkList.sort(function (a, b) {return a - b;});

        linkGroup = buildGroup('link');

        lastPage = 0;
        linkList.forEach(function (page, i) {
            if (page - lastPage > 1 && edgeMore) {
                linkGroup.append(buildLink('...', true));
            }
            linkGroup.append(linkMap[page]);
            lastPage = page;
        });

        if (total - lastPage > 1 && edgeMore) {
            linkGroup.append(buildLink('...', true));
        }

        self.empty();
        self.append(linkGroup);

        if (currentBtn) {
            self.append(buildBtn('next', current === total));
            self.prepend(buildBtn('prev', current === 1));
        }

        if (edgeBtn) {
            self.prepend(buildBtn('first', current === 1));
            self.append(buildBtn('last', current === total));
        }

        if (goBtn) {
            goGroup = buildGroup('go').html('<input type="number" min="1"><button>GO</button>');
            goGroup.find('input').attr('max', total).val(current);
            self.append(goGroup);
        }
    }

    initConfig(total, current, opt);
    build(total, current, config);
};