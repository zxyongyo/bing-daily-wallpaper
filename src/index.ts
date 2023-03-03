import fetch from 'node-fetch'
import {
  writeFile,
  existsSync,
  writeFileSync,
  readFileSync,
  mkdirSync
} from 'fs'
import chalk from '../node_modules/chalk/source/index.js'

const config = {
  savePath: './static/',
  mapPath: './map.json',
  bingUrl: 'https://cn.bing.com',
  pictureURL: 'http://www.bing.com/HPImageArchive.aspx',
  storyURL: 'http://cn.bing.com/cnhp/coverstory',
  defaultQueries: {
    idx: 0,
    n: 1,
    format: 'js'
  }
}

main()

// ;(async function () {
//   config.defaultQueries.idx = 7
//   config.defaultQueries.n = 8
//   await main()
//   config.defaultQueries.idx = 0
//   config.defaultQueries.n = 7
//   await main()
// })()


async function main() {
  console.log(new Date())
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
      const url_1080 = config.bingUrl + url
      url = url.split('1920x1080').join('UHD')
      const url_4k = config.bingUrl + url
      const url_preview = config.bingUrl + url + '&w=480&h=270'
      const name_preview = `${date}_preview.jpg`
      const name_4k = `${date}_4k.jpg`

      download(url_preview, name_preview)
      download(url_4k, name_4k)

      writeMap({
        hsh,
        date,
        title,
        copyright,
        url_preview,
        url_1080,
        url_4k,
        local_path_preview: config.savePath + name_preview,
        local_path_4k: config.savePath + name_4k
      })
    }
  } catch (e) {
    errLog('main', e)
    throw e
  }
}

async function getBingPictures() {
  try {
    const { idx, n, format } = config.defaultQueries
    const URL =
      config.pictureURL + `?idx=${idx}&n=${n}&format=${format}&mkt=zh-CN`
  
    console.log(chalk.cyan(`Request url: ${URL}`))
    const response = await fetch(URL)
    const data = await response.json()
    // console.log(data)
    const pictures = data.images
    // console.log(picture)
    return pictures
  } catch (e) {
    errLog('getBingPictures', e)
    throw e
  }
}

/**
 * 保存图片
 * @param url 图片url
 * @param name 图片名称
 */
async function download(url: string, name: string) {
  if (!existsSync(config.savePath)) {
    mkdirSync(config.savePath)
  }

  const path = config.savePath + name
  if (existsSync(path)) {
    console.log(chalk.yellow('Duplicate image, not downloaded! → ' + path))
    return
  }
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  writeFile(path, buffer, err => {
    if (err) {
      errLog('download', err)
      throw err
    }
    console.log(chalk.greenBright(`Download completed! Saved at ${path}`))
  })
}

type PictureInfo = {
  hsh: string
  date: string
  title: string
  copyright: string
  url_preview: string
  url_1080: string
  url_4k: string
  local_path_preview: string
  local_path_4k: string
}
function writeMap(info: PictureInfo) {
  try {
    if (!existsSync(config.mapPath)) {
      writeFileSync(config.mapPath, '[]')
    }

    const buffer = readFileSync(config.mapPath)
    const stringData = buffer.toString()
    const JSONData = JSON.parse(stringData) as PictureInfo[]
    const isRepeat = JSONData.some(v => v.hsh === info.hsh)
    if (isRepeat) {
      // 防止写入重复的
      console.log(chalk.yellow('Duplicate data, not written! ↓'))
      console.log(info)
      return
    }
    JSONData.unshift(info)
    JSONData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() // 按日期从大到小排序
    )

    writeFileSync(config.mapPath, JSON.stringify(JSONData))
    console.log(chalk.greenBright('Write map.json completed! ↓'))
    console.log(info)

    writeReadme(JSONData)
  } catch (e) {
    errLog('writeMap', e)
    throw e
  }
}

async function writeReadme(data: PictureInfo[]) {
  try {
    const today = data.shift()
    if (!today) {
      console.log(chalk.bgRed('WriteReadme: invalid data! ↓'))
      console.log(data)
      return
    }

    const { date, title, local_path_4k } = today!
    const dataList = [
      `# Bing Daily Wallpaper\n\n`,
      `### ${date} ${title}\n\n`,
      `![](${local_path_4k})\n\n`,
      `|      |      |      |\n`,
      `|:----:|:----:|:----:|\n`
    ]

    data.forEach((v, i) => {
      const cell = `![](${v.local_path_preview})<br> ${v.date} [4K 版本](${v.local_path_4k}) <br> ${v.title}`
      if ((i + 1) % 3 === 0) { // 一行3个
        dataList.push(`|${cell}|\n`)
      } else {
        dataList.push(`|${cell}`)
      }
    })

    writeFileSync('./README.md', dataList.join(''))
    console.log(chalk.greenBright('Write README.md completed!'))
  } catch (e) {
    errLog('writeReadme', e)
    throw e
  }
}

function errLog(fnName: string, e: unknown) {
  console.log(chalk.bgRed(`Error in ${fnName}! ↓`))
  console.log(e)
}
