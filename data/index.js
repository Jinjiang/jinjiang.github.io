const fs = require('fs')
const posts = require('./posts.json')
const moment = require('moment')

// todo: tags

const output = {}

Object.keys(posts).forEach(cid => {
  const post = posts[cid]
  const title = post.title
  const date = moment(post.created * 1000).format('YYYY/MM/DD hh:mm:ss')
  const updated = moment(post.modified * 1000).format('YYYY/MM/DD hh:mm:ss')
  const filename = post.slug
  const text = post.text
  const content = `
---
title: '${title}'
date: ${date}
updated: ${updated}
---

${text}
`
  output[filename] = content.trim()
})

for (const filename in output) {
  fs.writeFileSync(`_posts/${filename}.md`, output[filename])
}
