(function () {
  var title = document.querySelector('#header h1 a');
  var text = title.innerText;
  var firstLetter = document.createElement('span');
  firstLetter.className = 'first-letter';
  firstLetter.innerText = text.substr(0, 1);
  var otherLetters = document.createTextNode(text.substr(1));
  title.innerHTML = '';
  title.appendChild(firstLetter);
  title.appendChild(otherLetters);
})();

(function () {
  var pages = document.querySelectorAll('.page-navigator > *');
  pages = [].slice.call(pages);
  pages.forEach(function (page) {
    page.classList.add('pure-button');
    if (page.classList.contains('current')) {
      page.classList.add('pure-button-disabled');
    }
  });
})();

(function () {
  var header = document.querySelector('#header');
  if (header) {
    var bgImage = '/images/bg_' + Math.ceil(Math.random() * 45) + '.jpg';
    if (window.innerWidth <= 640) {
      bgImage = bgImage.replace('.jpg', '_m.jpg');
    }
    header.classList.add('has-bg')
    header.style.backgroundImage = 'linear-gradient(to bottom, var(--header-bg-color-top), var(--header-bg-color-bottom)), url(' + bgImage + ')';
  }
})();

(function () {
  var footer = document.querySelector('#footer');
  if (footer) {
    var bgImage = '/images/bg_' + Math.ceil(Math.random() * 45) + '.jpg';
    if (window.innerWidth <= 640) {
      bgImage = bgImage.replace('.jpg', '_m.jpg');
    }
    footer.classList.add('has-bg')
    footer.style.backgroundImage = 'linear-gradient(to bottom, var(--footer-bg-color-top), var(--footer-bg-color-bottom)), url(' + bgImage + ')';
  }
})();

