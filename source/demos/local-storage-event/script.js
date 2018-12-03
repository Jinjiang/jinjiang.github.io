$('button').click(function () {
    var value = prompt();
    if (value) {
        localStorage.setItem('test', value);
    }
});
window.onstorage = function (e) {
    var page = e.url.replace(/^.+\//, '');
    var li = $('<li></li>').text(
        e.key + ': "' + e.newValue + '" - "' + e.oldValue + '" from: ' + (page || 'index'));
    li.appendTo($('ul'));
    console.log(li.text());
};
