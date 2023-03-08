import { defineConfig } from 'vitepress'
import sidebar from './sidebar'

// @see https://vitepress.vuejs.org/config/app-config
export default defineConfig({
  lang: 'zh-CN',
  title: 'Bing Daily Wallpaper',
  description: 'Automatic fetch & settle bing daily wallpaper',
  head: [["link", { rel: "icon", type: "image/png", href: "/favicon.png" }]],

  base: '/bing-daily-wallpaper/',
  lastUpdated: true,

  markdown: {},

  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/zxyongyo/bing-daily-wallpaper'
      }
    ],
    outline: [2, 3],
    sidebar,
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present zxyongyo'
    }
  }
})
