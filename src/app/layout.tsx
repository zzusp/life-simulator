import type { Metadata } from 'next'
import './globals.css'
import '../styles/fonts.css'
import '../styles/animations.css'

export const metadata: Metadata = {
  title: '人生模拟器',
  description: '基于AI的互动式人生体验游戏',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 预加载关键字体 */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap" 
          as="style"
        />
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/style.css" 
          as="style"
        />
      </head>
      <body className="font-body">
        {children}
      </body>
    </html>
  )
}
