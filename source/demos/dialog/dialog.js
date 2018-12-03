define(['jquery'], function ($) {
    var DIALOG_TEMPLATE = '<div class="dialog">' +
        '<div class="dialog-head"><div class="dialog-title">{title}</div>' +
        '<div class="dialog-ctrl">X</div></div>' +
        '<div class="dialog-body">{content}</div></div>';

    var status = {};
    var currentDialog;
    var mask = $('<div class="mask"></div>').appendTo($('body'));

    function Dialog(title, contentHtml, config) {
        var element = $(this.TEMPLATE);
        element.find('.dialog-title').text(title);
        element.find('.dialog-body').html(contentHtml);
        this.element = element;
        this.config = config;
        this.init();
    }
    Dialog.prototype.TEMPLATE = DIALOG_TEMPLATE;
    Dialog.prototype.init = function () {
        var that = this;
        var element = that.element;
        var config = that.config;

        config.css && element.css(config.css);
        config.oncreate && config.oncreate(that);

        element.find('.dialog-ctrl').click(function () {
            that.close && that.close();
        });
        element.appendTo($('body'));
    };
    Dialog.prototype.setTitle = function (title) {
        var that = this;
        var element = that.element;
        element.find('.dialog-title').text(title);
    };
    Dialog.prototype.setContent = function (contentHtml) {
        var that = this;
        var element = that.element;
        element.find('.dialog-body').html(contentHtml);
    };

    function showMask() {mask.show();}
    function hideMask() {mask.hide();}

    function showDialog() {
        var dialog = currentDialog;
        dialog.element.show();
        var windowWidth = $(window).width();
        var dialogWidth = dialog.element.width();
        var offsetLeft = Math.round((windowWidth - dialogWidth) / 2);
        var offsetTop = (window.scrollY || window.pageYOffset || 0) + 100;
        dialog.element.css('left', offsetLeft + 'px');
        dialog.element.css('top', offsetTop + 'px');
    }
    function hideDialog() {
        var dialog = currentDialog;
        dialog.element.hide();
        dialog.element.css({left: '', top: ''});
    }

    function createDialog(title, contentHtml, config) {
        if (currentDialog) {
            currentDialog.element.remove();
            delete currentDialog;
        }

        currentDialog = new Dialog(title, contentHtml, config);
        currentDialog.close = removeDialog;
        currentDialog.forceClose = forceCloseDialog;

        showMask();
        showDialog();

        config.afterCreate && config.afterCreate(currentDialog);
    }

    function updateDialog(title, contentHtml, config) {
        var dialog = currentDialog;
        var element = dialog.element;
        var beforeUpdate = config.beforeUpdate;
        var afterUpdate = config.afterUpdate;

        delete config.beforeUpdate;
        delete config.afterUpdate;

        beforeUpdate && beforeUpdate(dialog);

        title && element.find('.dialog-title').text(title);
        contentHtml && element.find('.dialog-body').html(contentHtml);

        afterUpdate && afterUpdate(dialog);

        for (var i in config) {
            dialog.config[i] = config[i];
        }
    }

    function forceCloseDialog() {
        hideDialog();
        hideMask();
        currentDialog.element.remove();
        delete currentDialog;
    }

    function removeDialog() {
        var dialog = currentDialog;
        var handler = dialog.config.onclose;
        var handlerResult;
        if (handler) {
            handlerResult = handler(forceCloseDialog);
            if (handlerResult === false) {
                return;
            }
        }
        forceCloseDialog();
    }

    function setDialogTemplate(t) {
        Dialog.prototype.TEMPLATE = t;
    }

    function resetDialogTemplate() {
        Dialog.prototype.TEMPLATE = DIALOG_TEMPLATE;
    }

    return {
        alert: function (text) {
            createDialog('提示',
                '<p class="alert-text"></p><p>' +
                '<button class="btn-ok">确定</button></p>',
                {
                    oncreate: function (dialog) {
                        var element = dialog.element;
                        element.find('.dialog-body').css('text-align', 'center');
                        element.find('.alert-text').text(text);
                        element.find('.btn-ok').click(function () {
                            dialog.forceClose();
                        });
                    },
                    css: {
                        'width': '240px'
                    }
                }
            );
        },
        confirm: function (text, doYes, doNo) {
            createDialog('提示',
                '<p class="confirm-text"></p><p>' +
                '<button class="btn-yes">确认</button> ' +
                '<button class="btn-no">取消</button></p>',
                {
                    oncreate: function (dialog) {
                        var element = dialog.element;
                        element.find('.dialog-body').css('text-align', 'center');
                        element.find('.confirm-text').text(text);
                        element.find('.btn-yes').click(function () {
                            dialog.forceClose();
                            doYes && doYes();
                        });
                        element.find('.btn-no').click(function () {
                            dialog.forceClose();
                            doNo && doNo();
                        });
                    },
                    onclose: function (closeLater) {
                        doNo && doNo();
                    },
                    css: {
                        'width': '240px'
                    }
                }
            );
        },
        show: createDialog,
        hide: removeDialog,
        forceHide: forceCloseDialog,
        update: updateDialog,
        TEMPLATE: DIALOG_TEMPLATE,
        setTemplate: setDialogTemplate,
        resetTemplate: resetDialogTemplate
    };
});