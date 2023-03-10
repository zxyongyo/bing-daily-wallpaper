
type PictureInfo = {
  hsh: string
  date: string
  title: string
  copyright: string
  url_preview: string
  url_1080: string
  url_4k: string
}

type ArchivesInfo = {
  date: string
  previewPath: string
  mapPath: string
}

type JSONMap = {
  images: PictureInfo[]
  archives: ArchivesInfo[]
}

type SidebarItem = {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}