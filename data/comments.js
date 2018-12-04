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
    indent: 0,
    created: moment(created * 1000).format('YYYY/MM/DD hh:mm:ss'),
    text
  })
})


fs.writeFileSync(`slug-comments.json`, JSON.stringify(output, null, 2))
