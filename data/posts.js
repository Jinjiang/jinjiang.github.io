const fs = require('fs')
const posts = require('./posts.json')
const metas = require('./metas.json')
const relationships = require('./relationships.json')
const moment = require('moment')

function getTags(cid) {
  const list = (relationships[cid] || []).map(mid => {
    return `- ${metas[mid]}`
  }).join('\n')
  return list ? `tags:\n${list}\n` : ''
}

const output = {}

Object.keys(posts).forEach(cid => {
  const post = posts[cid]
  const title = post.title
  const date = moment(post.created * 1000).format('YYYY/MM/DD hh:mm:ss')
  const updated = moment(post.modified * 1000).format('YYYY/MM/DD hh:mm:ss')
  const filename = post.slug
  const text = post.text
  const tags = getTags(cid)
  const content = `
---
title: '${title}'
date: ${date}
updated: ${updated}
${tags}---

${text.replace(/http\:\/\/jiongks\-typecho\.stor\.sinaapp\.com\/usr\/uploads/g, '/uploads')}
`
  output[filename] = content.trim()
})

for (const filename in output) {
  fs.writeFileSync(`_posts/${filename}.md`, output[filename])
}
