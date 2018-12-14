const fs = require('fs')
const data = require('./res.json')

const tags = {}

const separater = /、|，|,/

const newTagMap = {
  'node.js': 'node',
  '团队': 'culture',
  '教养': 'cultrue',
  '框架': 'framework',
  '库': 'lib',
  '工具': 'tool',
  '设计': 'design',
  '观点': 'opinion',
  '小技巧': 'skills',
  '入门': 'guide',
  '书': 'book',
  '文化': 'culture',
  '响应式': 'responsive',
  '趣味': 'fun',
  '动效': 'animation',
  '周边': 'fun',
  '手册': 'cheatsheet',
  '图片': 'image',
  '教程': 'guide',
  '性能': 'performance',
  '配色': 'design',
  '表单': 'form',
  '组件': 'component',
  'cultrue': 'culture',
  '命令行': 'cli',
  '排版': 'design',
  '视频': 'video',
  '调查': 'survey',
  '交互': 'design',
  '规范': 'spec',
  '邮件': 'email',
  '创业': 'culture',
  '组件库': 'component libs',
  '手势': 'touch',
  '代码审查': 'culture',
  '精益': 'culture',
  '纹理': 'design',
  '创新': 'culture',
  '声音': 'audio',
  '深度学习': 'ai',
  '机器学习': 'ai',
  '动画': 'animation',
  '布局': 'design',
  '管理': 'culture',
  'shader': '3d',
  'webgl': '3d',
  'vr': '3d',
  'gpu': '3d',
  '音乐': 'music',
  '工程': 'culture',
  'ar': '3d'
}

const output = []

data.forEach(item => {
  // console.log(item.url)
  // console.log(item.title)
  // output.push(
  //   `		<DT><A HREF="${item.url}">${item.title.replace(/</g, '&lt;').replace(/>/g, '&gt;') }</A>`
  // )
  // console.log(item.keywords.split(separater))
  // item.keywords.split(separater).map(tag => tag.trim().toLowerCase()).filter(Boolean).forEach(tag => {
  //   tag = newTagMap[tag] || tag
  //   if (tags[tag]) {
  //     tags[tag]++
  //   } else {
  //     tags[tag] = 1
  //   }
  // })
})

// fs.writeFileSync('./res.html', output.join('\n'))

// Object.keys(tags)
//   .sort((a, b) => tags[b] - tags[a])
//   // .sort((a, b) => b > a)
//   .forEach(tag => console.log(tag, tags[tag]))
