import fetch from 'node-fetch'
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const option = {
  mapPath: './map.json',
  getArchiveMapPath: (d: string) => `./archives/${d}/${d}.json`,
  getArchivePreviewPath: (d: string) => `./archives/${d}/${d}.md`,
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

// ;(async function () {
//   option.queries.idx = 7
//   option.queries.n = 8
//   await main()
//   option.queries.idx = 0
//   option.queries.n = 7
//   await main()
// })()

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
    if (!existsSync(option.mapPath)) {
      writeFileSync(option.mapPath, '{"images": [],"archives": []}')
    }

    const buffer = readFileSync(option.mapPath)
    const stringData = buffer.toString()
    const JSONData = JSON.parse(stringData) as JSONMap
    const { images, archives } = JSONData
    const isRepeat = images.some(v => v.hsh === info.hsh)
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
    const mapPath = option.getArchiveMapPath(dateMonth)
    const previewPath = option.getArchivePreviewPath(dateMonth)
    writeArchive(dateMonth, info, mapPath, previewPath)
    const isExistsArchive = archives.some(item => item.date.includes(dateMonth))
    if (!isExistsArchive) {
      archives.unshift({
        date: dateMonth,
        mapPath,
        previewPath
      })
      images.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() // 按日期从大到小排序
      )
    }

    writeFileSync(option.mapPath, JSON.stringify(JSONData))
    console.log('Done: Write map.json completed! ↓')
    console.log(info)

    writeReadme(images, archives)
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

function writeArchive(dateMonth: string, info: PictureInfo, mapPath: string, previewPath: string) {
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
    console.log(`Done: Write '${mapPath}' completed! ↓`)
    console.log(info)

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