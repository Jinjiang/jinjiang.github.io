const slugComments = require('../data/slug-comments.json')

hexo.extend.helper.register('comments', function (slug) {
  const result = []
  flatten(slugComments[slug], 0, result)
  return result
});

function flatten(comments = [], indent, result) {
  // for each comment
  comments.forEach(({
    id,
    parent,
    author,
    url,
    created,
    text,
    children
  }) => {
    // push comment ifself
    result.push({
      id,
      parent,
      author,
      url,
      created,
      text: text.replace(/\n/ig, '<br/>\n'),
      indent
    })
    // for each child of the comment
    // flatten(child, indent + 1, result)
    flatten(children, indent + 1, result)
  })
}
