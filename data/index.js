const fs = require('fs')
const pages = require('./pages.json')
const moment = require('moment')

// todo: tags

const output = {}

Object.keys(pages).forEach(cid => {
  const page = pages[cid]
  const title = page.title
  const date = moment(page.created * 1000).format('YYYY/MM/DD hh:mm:ss')
  const updated = moment(page.modified * 1000).format('YYYY/MM/DD hh:mm:ss')
  const filename = page.slug
  const text = page.text
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
