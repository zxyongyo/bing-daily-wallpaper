import fetch from 'node-fetch'
import {
  existsSync,
  writeFileSync,
  writeFile,
  readFileSync,
  mkdirSync,
  rmSync
} from 'fs'
import { dirname } from 'path'

const option = {
  bingUrl: 'https://cn.bing.com',
  // http://www.bing.com/HPImageArchive.aspx?idx=0&n=1&format=js&mkt=zh-CN&uhd=1&uhdwidth=1920&uhdheight=1080
  pictureURL: 'http://www.bing.com/HPImageArchive.aspx',
  queries: {
    idx: 0,
    n: 1,
    format: 'js',
    mkt: 'zh-CN'
  }
}

main()
// rewrite()

/** 根据已有的 map.json，重写所有文件 */
function rewrite() {
  try {
    const buffer = readFileSync('./map.json')
    const stringData = buffer.toString()
    const JSONData = JSON.parse(stringData) as JSONMap
    const images = JSONData.images

    rmSync('./map.json', { recursive: true, force: true })
    rmSync('./README.md', { recursive: true, force: true })
    rmSync('./archives', { recursive: true, force: true })
    rmSync('./docs/archives', { recursive: true, force: true })
    rmSync('./docs/index.md', { recursive: true, force: true })
    rmSync('./docs/.vitepress/sidebar.ts', { recursive: true, force: true })

    images.forEach(item => {
      writeMap(item)
    })
  } catch (e) {
    console.log(e)
    throw e
  }
}

async function main() {
  try {
    const pictures = await getBingPictures()
    for (const picture of pictures) {
      let { enddate, url, copyright, title, hsh } = picture

      const date =
        enddate.slice(0, 4) +
        '-' +
        enddate.slice(4, 6) +
        '-' +
        enddate.slice(-2)

      const url_1080 = option.bingUrl + url
      const url_preview = url_1080.replace('1920', '480').replace('1080', '270')
      const url_4k = url_1080.replace('1920', '3840').replace('1080', '2160')

      writeMap({
        hsh,
        date,
        title,
        copyright,
        url_preview,
        url_1080,
        url_4k
      })
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}

async function getBingPictures() {
  try {
    const { idx, n, format, mkt } = option.queries
    const URL =
      option.pictureURL +
      `?idx=${idx}&n=${n}&format=${format}&mkt=${mkt}&uhd=1&uhdwidth=1920&uhdheight=1080`

    console.log(`Request url: ${URL}`)
    const response = await fetch(URL)
    const data = await response.json()
    // console.log(data)
    const pictures = data.images
    // console.log(picture)
    return pictures
  } catch (e) {
    console.log(e)
    throw e
  }
}

function writeMap(info: PictureInfo) {
  try {
    if (!existsSync('./map.json')) {
      writeFileSync('./map.json', '{"images": [],"archives": []}')
    }

    const buffer = readFileSync('./map.json')
    const stringData = buffer.toString()
    const JSONData = JSON.parse(stringData) as JSONMap
    const { images, archives } = JSONData
    const isRepeat = images.some(v => v.date === info.date)
    if (isRepeat) {
      // 防止写入重复的
      console.log('Warning: Duplicate data, not written! ↓')
      console.log(info)
      return
    }
    images.unshift(info)
    images.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() // 按日期从大到小排序
    )

    const dateMonth = info.date.split('-').slice(0, 2).join('-')
    const year = dateMonth.split('-')[0]
    const mapPath = `./archives/${year}/${dateMonth}/${dateMonth}.json`
    const previewPath = `./archives/${year}/${dateMonth}/${dateMonth}.md`
    writeArchive(dateMonth, info, mapPath, previewPath)

    const isExistsArchive = archives.some(item => item.date.includes(dateMonth))
    if (!isExistsArchive) {
      archives.unshift({
        date: dateMonth,
        mapPath,
        previewPath
      })
      archives.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() // 按日期从大到小排序
      )
    }

    writeFileSync('./map.json', JSON.stringify(JSONData))
    console.log('Done: Write map.json completed! ↓')
    console.log(info)

    writeReadme(images, archives)
    writeDocs(images, archives)
  } catch (e) {
    console.log(e)
    throw e
  }
}

async function writeReadme(images: PictureInfo[], archives: ArchivesInfo[]) {
  try {
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

    writeFileSync('./README.md', writeDataList.join(''))
    console.log('Done: Write README.md completed!')
  } catch (e) {
    console.log(e)
    throw e
  }
}

function writeArchive(
  dateMonth: string,
  info: PictureInfo,
  mapPath: string,
  previewPath: string
) {
  try {
    if (!existsSync(mapPath)) {
      mkdirSync(dirname(mapPath), { recursive: true })
      writeFileSync(mapPath, '[]')
    }

    const buffer = readFileSync(mapPath)
    const stringData = buffer.toString()
    const images = JSON.parse(stringData) as PictureInfo[]
    images.unshift(info)
    images.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() // 按日期从大到小排序
    )

    writeFileSync(mapPath, JSON.stringify(images))
    console.log(`Done: Write '${mapPath}' completed!`)

    const writeDataList = [
      `# ${dateMonth} Bing Daily Wallpaper\n\n`,
      `|      |      |      |\n`,
      `|:----:|:----:|:----:|\n`
    ]

    images.forEach((v, i) => {
      const cell = `![](${v.url_preview})<br> ${v.date} [4K 版本](${v.url_4k}) <br> ${v.title}`
      if ((i + 1) % 3 === 0) {
        // 一行3个
        writeDataList.push(`| ${cell} |\n`)
      } else {
        writeDataList.push(`| ${cell}`)
      }
    })

    writeFileSync(previewPath, writeDataList.join(''))
    console.log(`Done: Write ${previewPath} completed!`)
  } catch (e) {
    console.log(e)
    throw e
  }
}

function writeDocs(images: PictureInfo[], archives: ArchivesInfo[]) {
  // 最新的31条
  const imageList = images.slice(0, 31)
  const writeDataList: string[] = []
  imageList.forEach(item => {
    writeDataList.push(`## ${item.date} ${item.title}\n\n`)
    writeDataList.push(item.copyright + '\n\n')
    writeDataList.push(`![](${item.url_1080})\n\n`)
    writeDataList.push(
      `[Download 1920 * 1080](${item.url_1080}) | [Download 3840 * 2160](${item.url_4k})\n\n`
    )
  })

  writeFile('./docs/index.md', writeDataList.join(''), err => {
    if (err) {
      console.log(err)
      throw err
    }
    console.log(`Done: Write ./docs/index.md completed!`)
  })

  writeDocsArchive(archives)
  writeSidebar(archives)
}

function writeDocsArchive(archives: ArchivesInfo[]) {
  if (!archives.length) {
    console.log('Warnning: no archives!')
    return
  }

  archives.forEach(item => {
    const { date, mapPath } = item
    const buffer = readFileSync(mapPath)
    const stringData = buffer.toString()
    const imageList = JSON.parse(stringData) as PictureInfo[]

    const writeDataList: string[] = []
    imageList.forEach(item => {
      writeDataList.push(`## ${item.date} ${item.title}\n\n`)
      writeDataList.push(item.copyright + '\n\n')
      writeDataList.push(`![](${item.url_1080})\n\n`)
      writeDataList.push(
        `[Download 1920 * 1080](${item.url_1080}) | [Download 3840 * 2160](${item.url_4k})\n\n`
      )
    })

    const year = date.split('-')[0]
    const path = `./docs/archives/${year}/${date}.md`
    const dir = dirname(path)
    if (!existsSync(dir)) {
      mkdirSync(dir, {recursive: true})
    }

    writeFile(path, writeDataList.join(''), err => {
      if (err) {
        console.log(err)
        throw err
      }
      console.log(`Done: Write ${path} completed!`)
    })
  })
}

function writeSidebar(archives: ArchivesInfo[]) {
  const sidebar: SidebarItem[] = [{ text: 'The latest 31', link: '/index.md' }]
  const archiveMap: Record<string, SidebarItem[]> = {}

  archives.forEach(item => {
    const year = item.date.split('-')[0]
    if (item.date.includes(year)) {
      if (!archiveMap[year]) {
        archiveMap[year] = []
      }
      archiveMap[year].push({text: item.date, link: `/archives/${year}/${item.date}.md`})
    }
  })
  Object.keys(archiveMap).forEach(k => {
    sidebar.push({
      text: k,
      collapsed: false,
      items: archiveMap[k]
    })
  })
  sidebar.sort((a, b) => +b.text - (+a.text))

  const sidebarDate = 'export default ' + JSON.stringify(sidebar)
  writeFile(`./docs/.vitepress/sidebar.ts`, sidebarDate, err => {
    if (err) {
      console.log(err)
      throw err
    }
    console.log(`Done: Write ./docs/.vitepress/sidebar.ts completed!`)
  })
}
