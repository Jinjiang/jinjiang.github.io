var cellList = $('.cell');
var appList = $('.app');
var currentCell;
var currentApp;
function click(e) {
    var index = $(this).attr("data-index") - 1;
    var cell = $(cellList[index]);
    var app = $(appList[index]);

    if (currentApp && currentCell) {
        currentApp.removeClass('active');
        currentCell.removeClass('active');
        currentCell = currentApp = null;
    }
    else {
        currentCell = cell;
        currentApp = app;
        currentCell.addClass('active');
        currentApp.addClass('active');
    }
}
cellList.click(click);
appList.click(click);
