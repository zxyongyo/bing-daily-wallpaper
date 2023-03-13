### 必应壁纸官方API：

- `https://cn.bing.com/HPImageArchive.aspx`

#### 参数：

| 参数名    | 必传 | 说明                      | 可选值                                                       |
| --------- | ---- | ------------------------- | ------------------------------------------------------------ |
| format    | 否   | 返回数据格式              | js (json), xml (默认)                                        |
| idx       | 否   | 请求图片截至天数          | 0: 今天, -1: 明天（预准备的）, 1: 截止至昨天, （类推，最多获取到7天前的图片） |
| n         | 是   | 返回数量，目前最多一次8张 | 1 ~ 8                                                        |
| mkt       | 否   | 地区                      | "en-US", "zh-CN", "ja-JP", "en-IN", "pt-BR", "fr-FR", "de-DE", "en-CA", "en-GB", "it-IT", "es-ES", "fr-CA" |
| uhd       | 否   | 高清图                    | 1                                                            |
| uhdwidth  | 否   | uhd=1时，图片宽度         | 1920（默认）                                                 |
| uhdheight | 否   | uhd=1时，图片高度         | 1080（默认）                                                 |

### 任务

- [x] 抓取必应每日一图，下载保存到文件夹。

- [x] 将数据做一个 `map.json`，方便使用。

- [ ] 写入对应图片的 story 链接。

- [x] 每日抓取后将图片和信息写入 README.md 方便预览。

- [x] GitHub Action 定时任务，每日自动抓取，写入。

- [x] 使用 vitepress 做一个网站方便预览。

- [x] 将 vitepress 发布到 GitHub page

- [x] 不再保存至本地，直接使用 bing的链接

- [x] 按月归档，`README.md` 中展示最新的 31张

- [x] 修改存档目录 `./archives/${year}/${dateMonth}/${dateMonth}.md`

- [x] vitepress 左侧目录按 年 月 分级展示

- [ ] 优化代码