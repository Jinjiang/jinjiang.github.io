const fs = require('fs')
const posts = require('./posts.json')
const metas = require('./metas.json')
const relationships = require('./relationships.json')
const moment = require('moment')

function getTags(cid) {
  const mid = relationships[cid]
  if (mid && metas[mid]) {
    return metas[mid]
  }
}

const output = {}

Object.keys(posts).forEach(cid => {
  const post = posts[cid]
  const title = post.title
  const date = moment(post.created * 1000).format('YYYY/MM/DD hh:mm:ss')
  const updated = moment(post.modified * 1000).format('YYYY/MM/DD hh:mm:ss')
  const filename = post.slug
  const text = post.text
  const tag = getTags(cid)
  const tags = tag ? `tags:\n- ${tag}\n` : ''
  const content = `
---
title: '${title}'
date: ${date}
updated: ${updated}
${tags}---

${text}
`
  output[filename] = content.trim()
})

for (const filename in output) {
  fs.writeFileSync(`_posts/${filename}.md`, output[filename])
}
