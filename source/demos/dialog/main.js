require.config({
    paths: {
        'jquery': '/s/js/jquery'
    }
});
require(['dialog'], function (dialog) {
    $('#btn-alert').click(function () {
        dialog.alert('Hello!');
    });
    $('#btn-confirm').click(function () {
        dialog.confirm('你确定吗？', function () {
            alert('你选择了确定');
        }, function () {
            alert('你选择了取消');
        });
    });
    $('#btn-login').click(function () {
        dialog.show('登录', '<p>用户名：<br><input type="text"></p>' +
            '<p>密码：<br><input type="password"></p>' +
            '<p><button>登录</button></p>', {
            oncreate: function (d) {
                var body = d.element.find('.dialog-body');
                body.find('button').click(function () {
                    var nickname = body.find('input[type="text"]').val();
                    var password = body.find('input[type="password"]').val();
                    if (nickname == 'jinjiang' && password == 'maxthon') {
                        dialog.forceHide();
                    }
                    else {
                        alert('邮箱或密码错误！');
                    }
                });
            },
            afterCreate: function (d) {
                d.element.find('input[type="text"]').focus();
            },
            onclose: function (closeLater) {
                if (confirm('放弃登录吗？')) {
                    closeLater(true);
                }
                return false;
            }
        });
    });
    $('#btn-steps').click(function () {
        dialog.show('斯台普斯', '<p>请输入你的姓名<br><input type="text"></p><p><button>下一步</button></p>', {
            oncreate: function (d) {
                var body = d.element.find('.dialog-body');
                body.find('button').click(function () {
                    var name = body.find('input[type="text"]').val();
                    if (name) {
                        d.config.name = name;
                        dialog.update('', '<p>请选择您的性别<br>' +
                            '<label><input type="radio" name="sex" value="male" checked> 男</label>' +
                            '<label><input type="radio" name="sex" value="female"> 女</label>' +
                            '</p><p><button>完成</button></p>', {
                                afterUpdate: function (d) {
                                    var body = d.element.find('.dialog-body');
                                    body.find('button').click(function () {
                                        var isMale = body.find('input')[0].checked;
                                        var output = '您好，' + d.config.name + (isMale ? '先生' : '女士');
                                        alert(output);
                                        dialog.forceHide();
                                    });
                                }
                            });
                    }
                    else {
                        alert('对不起，您的姓名不能为空！');
                    }
                });
            },
            afterCreate: function (d) {
                d.element.find('input[type="text"]').focus();
            },
            onclose: function (closeLater) {
                if (confirm('不继续了吗？')) {
                    closeLater(true);
                }
                return false;
            }
        });
    });
});