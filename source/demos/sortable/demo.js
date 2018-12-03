var dataVertical = $('#container-vertical .item').sortable({
    flow: 'vertical',
    wrapPadding: [10, 10, 0, 0],
    elMargin: [0, 0, 10, 10],
    elWidth: 200
});
$('#btn-vertical').click(function (e) {
    $('#result-vertical').text('Order: ' + dataVertical.getOrder());
});


var dataHorizontal = $('#container-horizontal .item').sortable({
    wrapPadding: [10, 10, 0, 0],
    elMargin: [0, 0, 10, 10],
    filter: function (index) {return index !== 2;},
    elHeight: 'auto',
    flow: 'horizontal',
    timeout: 1000
});
$('#btn-horizontal').click(function (e) {
    $('#result-horizontal').text('Order: ' + dataHorizontal.getOrder());
});


var dataVFlow = $('#container-v-flow .item').sortable({
    wrapPadding: [10, 10, 0, 0],
    elMargin: [0, 0, 10, 10],
    flow: 'v-flow'
});
$('#btn-v-flow').click(function (e) {
    $('#result-v-flow').text('Order: ' + dataVFlow.getOrder());
});


var dataHFlow = $('#container-h-flow .item').sortable({
    wrapPadding: [10, 10, 0, 0],
    elMargin: [0, 0, 10, 10],
    flow: 'h-flow',
    elWidth: 80,
    elHeight: 80
});
$('#btn-h-flow').click(function (e) {
    $('#result-h-flow').text('Order: ' + dataHFlow.getOrder());
});