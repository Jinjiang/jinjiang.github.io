/**
 * @fileOverview
 * 图片墙js排布方案
 * 为了减少阅读障碍，函数和变量都放在全局了
 * 实际使用时应做适当的封装
 * 该脚本依赖jQuery
 * @author 勾三股四
 * @link http://jiongks.name
 */


// 用来记录视口尺寸发生改变时，延时重拍版的定时器
var resizeTimer;

// 页面加载完毕之后重拍版
// 视口尺寸改变时，延时重拍版
$(window).load(function () {
    initLayout();
}).resize(function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initLayout, 500);
});


/**
 * 重拍版主程序
 * 1.默认照片的长宽比都是1比1的，且有一个基本的参照尺寸
 * 2.由这个基本的尺寸可以得出每行大概会放几张照片
 * 3.通过这一尺寸去比对每一张照片，得出宽高比
 * 4.每一行的照片高度是相同的，因此根据宽高比适配不同照片的宽度即可
 * 5.每行的宽度排满后，开始排下一行
 * 6.最后一行如果照片太少，则从前几行“匀”一些照片下来
 */
function initLayout() {
    var DEFAULT_ITEM_SIZE = 150; // 默认照片大小
    var GUTTER_SIZE = 2; // 图片间隙的尺寸

    // 假设所有照片的宽高比是1比1，得出每行能排几张照片(简称理论行长)
    // 张数是个理论值，因此可以是小数
    var root = $('#wall').css('width', '');
    var imgList = root.find('img');
    var containerWidth = root.width(); // 页面可利用的总宽度
    var rowLength = containerWidth / DEFAULT_ITEM_SIZE;
    // 调试信息：
    // console.log('containerWidth', containerWidth);
    // console.log('rowLength', rowLength);

    // 得到每张照片的尺寸数据及其宽高比
    // 并得出：如果所有的照片练成一排后总的宽高比(简称总宽高比)
    var rects = getAllRects(imgList);
    var totalRatios = sumRatios(rects);
    // console.log('rects', rects);
    // console.log('totalRatios', totalRatios);

    // 根据总宽高比和行长得到大概会有几行照片(简称行数)
    // 此数据不参与后续运算，仅作预示用
    var rowCount = getRowCount(totalRatios, rowLength);
    // 调试信息：
    // console.log('rowCount', rowCount);

    // 根据每张照片的数据和理论行长，将照片初步划分成多行
    var rows = splitRects(rects, rowLength);
    // 调试信息：
    // console.log('rows');
    // $.each(rows, function (i, row) {
    //     console.log(i, ':', row.length);
    // });

    // 微调每行的照片数量，得出最终的计算结果
    // 主要是迁就最后一行
    adjustSize(rows, rowLength);
    // 调试信息：
    // console.log('after adjustSize');
    // $.each(rows, function (i, row) {
    //     console.log(i, ':', row.length);
    // });

    // 按照最终的计算结果修改照片的尺寸
    root.css('width', containerWidth);
    resizePhotos(imgList, rows, containerWidth, GUTTER_SIZE);
}


/**
 * 得到每张照片的尺寸数据及其宽高比
 * @param  {jQuery} imgList 所有图片集合的jQuery对象
 * @return {array}          所有图片的数据，包含的字段有width、height、ratio
 */
function getAllRects(imgList) {
    var rects = [];
    imgList.each(function (i, element) {
        var rect = {
            width: element.naturalWidth,
            height: element.naturalHeight
        };
        rect.ratio = rect.width / rect.height;
        rects.push(rect);
    });
    return rects;
}

/**
 * 得出所有照片排成一排的总宽高比
 * @param  {array}  rects 照片数据列表
 * @return {number}       总宽高比
 */
function sumRatios(rects) {
    var sum = 0;
    $.each(rects, function (i, rect) {
        sum += rect.ratio;
    });
    return sum;
}

/**
 * 根据总宽高比和行长得到大概会有几行照片
 * @param  {number} totalRatios 总宽高比
 * @param  {number} rowLength   行长
 * @return {number}             行数
 */
function getRowCount(totalRatios, rowLength) {
    var count = Math.round(totalRatios / rowLength);
    return count;
}

/**
 * 根据每张照片的数据和理论行长，将照片初步划分成多行
 * 一旦一行的宽高比超过了理论行长的1.25倍，则换行
 * @param  {array}  rects     照片数据列表
 * @param  {number} rowLength 行长
 * @return {array}            行列表数据，包含的字段有：index、length、photoList、photoIndexList
 */
function splitRects(rects, rowLength) {
    var maxLength = rowLength * 1.25;
    var rows = [];

    var currentRow;
    var nextRowIndex = 0;

    $.each(rects, function (i, rect) {
        var ratio = rect.ratio;

        // 判断是否需要创建新的一行
        if (!currentRow) {
            currentRow = {
                index: nextRowIndex,
                length: 0,
                photoList: [],
                photoIndexList: []
            };
            rows.push(currentRow);
            nextRowIndex++;
        }

        // 更新行信息
        currentRow.length += ratio;
        currentRow.photoList.push(rect);
        currentRow.photoIndexList.push(i);

        // 一旦一行的宽高比超过了理论行长的1.25倍，则换行
        if (currentRow.length > rowLength) {
            currentRow.zoom = currentRow.length / rowLength;
            currentRow = null;
        }
    });

    return rows;
}

/**
 * 微调每行的照片数量，主要是迁就最后一行
 * @param  {array}  rows      行列表数据
 * @param  {number} rowLength 行长
 */
function adjustSize(rows, rowLength) {
    var minLength = rowLength * 0.8;
    var rowCount = rows.length;
    var currentRowIndex = rowCount - 1;
    var currentRow;
    var previousRow;
    var tempPhoto;
    var tempPhotoIndex;

    // 从最后一行往回找
    while (currentRowIndex >= 0) {
        currentRow = rows[currentRowIndex];
        previousRow = rows[currentRowIndex - 1];

        // 如果行长不足理论行长的80%，则从上一行的最后面取下一张照片补在最前面，并反复确认
        // 由于之前每行的最大宽高比是1.25倍理论行长，和0.8相差近50%，因此很大程度保证了每行的灵活性
        while (currentRow.length < minLength && previousRow) {
            tempPhoto = previousRow.photoList.pop();
            tempPhotoIndex = previousRow.photoIndexList.pop();
            previousRow.length -= tempPhoto.ratio;
            currentRow.photoList.unshift(tempPhoto);
            currentRow.photoIndexList.unshift(tempPhotoIndex);
            currentRow.length += tempPhoto.ratio;
        }

        currentRowIndex--;
    }
}

/**
 * 根据计算结果修改页面上照片的尺寸
 * @param  {jQuery} imgList        所有图片集合的jQuery对象
 * @param  {array}  rows           行列表数据
 * @param  {number} containerWidth 页面可利用的总宽度
 * @param  {number} gutterSize     图片间隙的尺寸
 */
function resizePhotos(imgList, rows, containerWidth, gutterSize) {
    $.each(rows, function (i, row) {
        var height = Math.floor(containerWidth - row.length * gutterSize) / row.length;
        $.each(row.photoIndexList, function (i, index) {
            var img = imgList[index];
            img.height = height;
        });
    });
}