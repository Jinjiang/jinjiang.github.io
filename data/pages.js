const fs = require('fs')
const pages = require('./pages.json')
const moment = require('moment')

const output = {}

Object.keys(pages).forEach(cid => {
  const post = pages[cid]
  const title = post.title
  const date = moment(post.created * 1000).format('YYYY/MM/DD hh:mm:ss')
  const updated = moment(post.modified * 1000).format('YYYY/MM/DD hh:mm:ss')
  const filename = post.slug
  const text = post.text
  const content = `
---
layout: page
title: '${title}'
date: ${date}
updated: ${updated}
---

${text}
`
  output[filename] = content.trim()
})

for (const filename in output) {
  fs.writeFileSync(`pages/${filename}.md`, output[filename])
}
