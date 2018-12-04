const fs = require('fs')
const posts = require('./posts.json')
const pages = require('./pages.json')
const comments = require('./comments.json')
const moment = require('moment')

function getSlug(cid) {
  const content = posts[cid] || pages[cid] || {}
  return content.slug || ''
}

const output = {}

Object.keys(comments).forEach(id => {
  const {
    cid,
    created,
    author,
    authorId,
    mail,
    url,
    text,
    type,
    parent
  } = comments[id]

  const slug = getSlug(cid)
  if (!slug) {
    console.log(id, cid, author, text)
    return
  }
  if (!output[slug]) {
    output[slug] = []
  }
  output[slug].push({
    id,
    parent,
    author,
    url,
    created: moment(created * 1000).format('YYYY/MM/DD hh:mm:ss'),
    text
  })
})

Object.keys(output).forEach(slug => {
  const comments = output[slug]
  const ids = comments.map(({ id }) => id)
  const refs = {}
  comments.forEach(comment => refs[comment.id] = comment)

  ids.forEach(id => {
    const comment = refs[id]
    const parent = refs[comment.parent]
    if (!parent) { return }
    parent.children = parent.children || []
    parent.children.push(comment)
  })

  output[slug] = comments.filter(({ parent }) => !parent)
})

fs.writeFileSync(`slug-comments.json`, JSON.stringify(output, null, 2))
