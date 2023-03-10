/**
 * 重写 map.json 的 archives 字段
 * 重写 README.md
 * 将 ./archives 目录下的 同年文件放在同一文件下
 * 将 ./docs/archives 目录下的 同年文件放在同一文件下
 * 重写 ./docs/.vitepress/sidebar.ts
 * 修改 index.ts，添加年份目录
 */
import fs from 'fs'
import { dirname } from 'path'

function writeJSONMapArchives() {
  fs.readFile('./map.json', (err, data) => {
    if (err) {
      console.log(err)
    }

    const stringData = data.toString()
    const JSONData = JSON.parse(stringData) as JSONMap
    const archives = JSONData.archives
    // {
    //   date: '2023-03',
    //   mapPath: './archives/2023-03/2023-03.json', => './archives/2023/2023-03/2023-03.json'
    //   previewPath: './archives/2023-03/2023-03.md'
    // }
    archives.forEach(item => {
      const year = item.date.split('-')[0]
      item.mapPath = item.mapPath.replace('archives/', `archives/${year}/`)
      item.previewPath = item.previewPath.replace(
        'archives/',
        `archives/${year}/`
      )
    })

    fs.writeFile('./map.json', JSON.stringify(JSONData), err => {
      if (err) {
        console.log(err)
        throw err
      }
      console.log(`Done: rewrite map.json's archives completed!`)
    })
  })
}
// writeJSONMapArchives()

function classifyArchives() {
  fs.readdir('./archives', {}, (err, files) => {
    if (err) {
      console.log(err)
    }
    // 2018-09
    files.forEach(item => {
      if (typeof item === 'string') {
        const year = item.split('-')[0]
        const path = `./archives/${item}`
        const newPath = `./archives/${year}/${item}`
        if (!fs.existsSync(dirname(newPath))) {
          fs.mkdirSync(dirname(newPath))
        }
        fs.rename(path, newPath, err => {
          if (err) {
            console.log(err)
            throw err
          }
          console.log(`Done: ${path} => ${newPath} completed!`)
        })
      }
    })
  })
}
// classifyArchives()

function classifyDocsArchives() {
  fs.readdir('./docs/archives', {}, (err, files) => {
    if (err) {
      console.log(err)
    }
    // 2018-09
    files.forEach(item => {
      if (typeof item === 'string') {
        const year = item.split('-')[0]
        const path = `./docs/archives/${item}`
        const newPath = `./docs/archives/${year}/${item}`

        if (!fs.existsSync(dirname(newPath))) {
          fs.mkdirSync(dirname(newPath))
        }
        fs.rename(path, newPath, err => {
          if (err) {
            console.log(err)
            throw err
          }
          console.log(`Done: ${path} => ${newPath} completed!`)
        })
      }
    })
  })
}
// classifyDocsArchives()

const sidebarPresent = [
  { text: '2023-03', link: '/archives/2023-03.md' },
  { text: '2023-02', link: '/archives/2023-02.md' },
  { text: '2023-01', link: '/archives/2023-01.md' },
  { text: '2022-12', link: '/archives/2022-12.md' },
  { text: '2022-11', link: '/archives/2022-11.md' },
  { text: '2022-10', link: '/archives/2022-10.md' },
  { text: '2022-09', link: '/archives/2022-09.md' },
  { text: '2022-08', link: '/archives/2022-08.md' },
  { text: '2022-07', link: '/archives/2022-07.md' },
  { text: '2022-06', link: '/archives/2022-06.md' },
  { text: '2022-05', link: '/archives/2022-05.md' },
  { text: '2022-04', link: '/archives/2022-04.md' },
  { text: '2022-03', link: '/archives/2022-03.md' },
  { text: '2022-02', link: '/archives/2022-02.md' },
  { text: '2022-01', link: '/archives/2022-01.md' },
  { text: '2021-12', link: '/archives/2021-12.md' },
  { text: '2021-11', link: '/archives/2021-11.md' },
  { text: '2021-10', link: '/archives/2021-10.md' },
  { text: '2021-09', link: '/archives/2021-09.md' },
  { text: '2021-08', link: '/archives/2021-08.md' },
  { text: '2021-07', link: '/archives/2021-07.md' },
  { text: '2021-06', link: '/archives/2021-06.md' },
  { text: '2021-05', link: '/archives/2021-05.md' },
  { text: '2021-04', link: '/archives/2021-04.md' },
  { text: '2021-03', link: '/archives/2021-03.md' },
  { text: '2021-02', link: '/archives/2021-02.md' },
  { text: '2021-01', link: '/archives/2021-01.md' },
  { text: '2020-12', link: '/archives/2020-12.md' },
  { text: '2020-11', link: '/archives/2020-11.md' },
  { text: '2020-10', link: '/archives/2020-10.md' },
  { text: '2020-09', link: '/archives/2020-09.md' },
  { text: '2020-08', link: '/archives/2020-08.md' },
  { text: '2020-07', link: '/archives/2020-07.md' },
  { text: '2020-06', link: '/archives/2020-06.md' },
  { text: '2020-05', link: '/archives/2020-05.md' },
  { text: '2020-04', link: '/archives/2020-04.md' },
  { text: '2020-03', link: '/archives/2020-03.md' },
  { text: '2020-02', link: '/archives/2020-02.md' },
  { text: '2020-01', link: '/archives/2020-01.md' },
  { text: '2019-12', link: '/archives/2019-12.md' },
  { text: '2019-11', link: '/archives/2019-11.md' },
  { text: '2019-10', link: '/archives/2019-10.md' },
  { text: '2019-09', link: '/archives/2019-09.md' },
  { text: '2019-08', link: '/archives/2019-08.md' },
  { text: '2019-07', link: '/archives/2019-07.md' },
  { text: '2019-06', link: '/archives/2019-06.md' },
  { text: '2019-05', link: '/archives/2019-05.md' },
  { text: '2019-04', link: '/archives/2019-04.md' },
  { text: '2019-03', link: '/archives/2019-03.md' },
  { text: '2019-02', link: '/archives/2019-02.md' },
  { text: '2019-01', link: '/archives/2019-01.md' },
  { text: '2018-12', link: '/archives/2018-12.md' },
  { text: '2018-11', link: '/archives/2018-11.md' },
  { text: '2018-10', link: '/archives/2018-10.md' },
  { text: '2018-09', link: '/archives/2018-09.md' }
]
function writeDocsSidebar() {
  const sidebar = [{ text: 'The latest 31', link: '/index.md' }] as any
  const map: Record<string, any[]> = {}
  sidebarPresent.forEach(item => {
    const year = item.text.split('-')[0]
    sidebarPresent.forEach(v => {
      if (v.text.includes(year)) {
        if (map[year]) {
          if (!map[year].some(a => a.text === v.text))
          map[year].push(v)
        } else {
          map[year] = [v]
        }
      }
    })
  })
  // console.log(map)
  Object.keys(map).forEach(k => {
    // /archives/2023-03.md => /archives/2023/2023-03.md
    map[k].forEach(item => {
      const year = item.text.split('-')[0]
      item.link = `/archives/${year}/${item.text}.md`
    })
    sidebar.push({
      text: k,
      collapsed: false,
      items: map[k]
    })
  })
  sidebar.sort((a: any, b: any) => {
    if (a.text === 'The latest 31') {
      return -1
    }
    return +b.text - (+a.text)
  })
  fs.writeFile('./docs/.vitepress/sidebar.ts', 'export default' + JSON.stringify(sidebar), err => {
    if (err) {
      console.log(err)
      throw err
    }
    console.log(`Done: write ./docs/.vitepress/sidebar.ts completed!`)
  })
}
// writeDocsSidebar()

function rewriteReadme() {
  const buffer = fs.readFileSync('./map.json')
  const stringData = buffer.toString()
  const {archives, images} = JSON.parse(stringData) as JSONMap
  // 展示最新的31条
  const imageList = images.slice(0, 31)
  const today = imageList.shift()

  const { date, title, url_4k } = today!
  const writeDataList = [
    `# Bing Daily Wallpaper\n\n`,
    `### ${date} ${title}\n\n`,
    `![](${url_4k})\n\n`,
    `|      |      |      |\n`,
    `|:----:|:----:|:----:|\n`
  ]

  imageList.forEach((v, i) => {
    const cell = `![](${v.url_preview})<br> ${v.date} [4K 版本](${v.url_4k}) <br> ${v.title}`
    if ((i + 1) % 3 === 0) {
      // 一行3个
      writeDataList.push(`| ${cell} |\n`)
    } else {
      writeDataList.push(`| ${cell}`)
    }
  })

  writeDataList.push('\n\n### 历史归档\n\n')
  const archivesStr = archives
    .map(v => `[${v.date}](${v.previewPath})`)
    .join(' | ')
  writeDataList.push(archivesStr)

  fs.writeFileSync('./README.md', writeDataList.join(''))
  console.log('Done: Write README.md completed!')
}
// rewriteReadme()