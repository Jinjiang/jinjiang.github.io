const slugComments = require('../data/slug-comments.json')
hexo.extend.helper.register('comments', function (slug) {
  return slugComments[slug] || []
});
