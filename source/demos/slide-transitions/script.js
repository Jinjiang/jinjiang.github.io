var root = $('#container');

var slides = root.find('.slide');
var btns = $('#changes button');
var length = slides.length;
var keyLength = btns.length;

var currentPage;
var currentSlide;
var nextSlide;
var prevSlide;

var keys = [];
var keyIndex;
var keyBtn;

function loseSlide() {
    currentSlide.removeClass('current');
    nextSlide.removeClass('next');
    prevSlide.removeClass('prev');
}
function findSlide(page) {
    currentSlide = $(slides[page]).addClass('current');
    nextSlide = $(slides[(page + 1) % length]).addClass('next');
    prevSlide = $(slides[(page + length - 1) % length]).addClass('prev');
}

function next() {
    currentPage = (currentPage + 1) % length;
    loseSlide();
    findSlide(currentPage);
}
function prev() {
    currentPage = (currentPage + length - 1) % length;
    loseSlide();
    findSlide(currentPage);
}

function change(key) {
    keyIndex = keys.indexOf(key);
    root.attr('data-key', key);
    keyBtn.removeClass('active');
    keyBtn = $(btns[keyIndex]).addClass('active');
}
function tab() {
    keyIndex = (keyIndex + 1) % keyLength;
    change(keys[keyIndex]);
}
function untab() {
    keyIndex = (keyIndex + keyLength - 1) % keyLength;
    change(keys[keyIndex]);
}

function init() {
    currentPage = 0;
    findSlide(currentPage);

    keyBtn = $('');
    btns.each(function () {
        keys.push($(this).attr('data-key'));
    });
    change(keys[0]);
}

init();

window.onkeydown = function (e) {
    if (e.keyCode === 13) {
        next();
    }
    else if (e.keyCode === 37) {
        prev();
    }
    else if (e.keyCode === 39) {
        next();
    }
    else if (e.keyCode === 9) {
        e.preventDefault();
        if (e.shiftKey) {
            untab();
        }
        else {
            tab();
        }
    }
    else if (e.keyCode === 32) {
        root.toggleClass('test');
    }
    else {
        console.log(e.keyCode);
    }
};