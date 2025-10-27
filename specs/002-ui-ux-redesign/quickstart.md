# Quickstart: 手绘卡通风格 UI 实施指南

## 快速开始

本指南帮助开发者快速理解并开始实施手绘卡通风格 UI 重设计。

---

## 🎯 核心目标

将"人生模拟器"游戏的 UI 从扁平极简风格改造为**手绘卡通风格**，具备以下特征：

- 📄 纸张/羊皮纸质感背景
- ✍️ 手写体中文字体
- 🎨 温暖柔和的色调（米黄+深蓝+木棕）
- 🔘 立体卡通按钮（多层阴影）
- 📎 趣味装饰元素（回形针、标签纸）
- 🌊 柔和的动效（摇摆、弹跳）

---

## 📚 必读文档

开始实施前，请按顺序阅读以下文档：

1. **[spec.md](./spec.md)** - 功能规格与用户故事
2. **[research.md](./research.md)** - 技术选型与决策依据
3. **[data-model.md](./data-model.md)** - 设计系统数据模型
4. **[plan.md](./plan.md)** - 实施计划与里程碑
5. **[tasks.md](./tasks.md)** - 详细任务清单（待生成）

---

## 🛠️ 环境准备

### 1. 确认现有环境

```bash
# 确认 Node.js 版本（需 ≥ 18）
node --version

# 确认依赖已安装
npm list next react typescript tailwindcss
```

### 2. 准备字体文件

下载并放置在 `public/fonts/` 目录：

```bash
# 创建字体目录
mkdir -p public/fonts

# 下载站酷快乐体
# https://www.zcool.com.cn/special/zcoolfonts/
# 下载 zcool-kuaile.woff2 和 zcool-kuaile.woff

# 下载霞鹜文楷
# https://github.com/lxgw/LxgwWenKai/releases
# 下载 lxgw-wenkai.woff2 和 lxgw-wenkai.woff
```

### 3. 准备纹理图片

下载并放置在 `public/textures/` 目录：

```bash
# 创建纹理目录
mkdir -p public/textures

# 下载纸张纹理（推荐来源）
# https://www.toptal.com/designers/subtlepatterns/
# 搜索 "paper" 或 "parchment"
# 转换为 WebP 格式并压缩
```

**纹理要求**：
- 格式：WebP
- 尺寸：1024x1024 或更小
- 文件大小：< 200KB
- 平铺友好（seamless texture）

---

## 🎨 核心概念

### 1. 设计 Tokens

所有视觉参数都定义在 `src/lib/design-tokens.ts` 中：

```typescript
export const colorTokens = {
  paper: {
    DEFAULT: '#f5e6d3',  // 米黄色背景
    light: '#fffef9',    // 卡片白色
    dark: '#e8d5bd',     // 深米色
  },
  cartoon: {
    blue: '#4a5f7f',        // 主按钮蓝
    blueLight: '#7ba3d6',   // 标签蓝
    brown: '#8b7355',       // 边框棕
    orange: '#e8945f',      // 强调橙
  },
  // ...更多
}
```

### 2. 组件库结构

新建 `src/components/cartoon/` 存放手绘风格组件：

```text
src/components/cartoon/
├── CartoonButton.tsx      # 立体按钮
├── PaperCard.tsx          # 纸张卡片
├── LabelTab.tsx           # 标签纸
├── HandDrawnIcon.tsx      # 手绘图标
├── DecorationClip.tsx     # 回形针装饰
└── WoodFrame.tsx          # 木质边框
```

### 3. 字体加载

在 `src/styles/fonts.css` 中定义：

```css
@font-face {
  font-family: 'Zcool KuaiLe';
  src: url('/fonts/zcool-kuaile.woff2') format('woff2'),
       url('/fonts/zcool-kuaile.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'LXGW WenKai';
  src: url('/fonts/lxgw-wenkai.woff2') format('woff2'),
       url('/fonts/lxgw-wenkai.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### 4. 纸张背景

在 `src/app/globals.css` 中应用：

```css
body {
  background-image: url('/textures/paper-texture.webp');
  background-color: #f5e6d3;
  background-blend-mode: multiply;
  background-size: 400px 400px;
  filter: contrast(0.95) brightness(1.05);
}
```

---

## 🚀 快速实施步骤

### Step 1: 创建设计 Tokens（30分钟）

```bash
# 创建 design-tokens.ts
touch src/lib/design-tokens.ts
```

复制 `data-model.md` 中的 tokens 定义到文件中。

### Step 2: 配置 Tailwind（15分钟）

编辑 `tailwind.config.js`，扩展配置：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#f5e6d3',
          light: '#fffef9',
          dark: '#e8d5bd',
        },
        cartoon: {
          blue: '#4a5f7f',
          'blue-light': '#7ba3d6',
          brown: '#8b7355',
          orange: '#e8945f',
        },
        ink: {
          DEFAULT: '#2d2d2d',
          light: '#6b5d4f',
        },
      },
      fontFamily: {
        title: ['"Zcool KuaiLe"', 'cursive'],
        body: ['"LXGW WenKai"', 'serif'],
      },
      boxShadow: {
        'button': 'inset 0 -2px 0 rgba(0,0,0,0.2), 0 4px 0 #2d3a4d, 0 6px 8px rgba(0,0,0,0.15)',
        'button-hover': 'inset 0 -2px 0 rgba(0,0,0,0.2), 0 6px 0 #2d3a4d, 0 8px 12px rgba(0,0,0,0.2)',
        'card': '0 2px 4px rgba(139, 115, 85, 0.2), inset 0 0 60px rgba(255, 248, 220, 0.5)',
      },
    },
  },
}
```

### Step 3: 引入字体与纹理（15分钟）

编辑 `src/app/globals.css`：

```css
/* 引入字体 */
@import './fonts.css';

/* 纸张背景 */
body {
  background-image: url('/textures/paper-texture.webp');
  background-color: theme('colors.paper.DEFAULT');
  background-blend-mode: multiply;
  background-size: 400px 400px;
}

/* 移动端简化 */
@media (max-width: 768px) {
  body {
    background-image: none;
  }
}
```

### Step 4: 创建第一个组件（1小时）

创建 `src/components/cartoon/CartoonButton.tsx`：

```tsx
import React from 'react'

interface CartoonButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function CartoonButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false
}: CartoonButtonProps) {
  const baseClasses = 'rounded-2xl font-bold transition-all duration-150'
  
  const variantClasses = {
    primary: 'bg-cartoon-blue text-white border-3 border-[#2d3a4d] shadow-button hover:shadow-button-hover active:translate-y-1 active:shadow-none',
    secondary: 'bg-cartoon-orange text-ink border-3 border-[#c67445] shadow-button hover:shadow-button-hover active:translate-y-1 active:shadow-none'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}
```

### Step 5: 改造第一个页面（2小时）

编辑 `src/app/page.tsx`，使用新组件：

```tsx
import { CartoonButton } from '@/components/cartoon/CartoonButton'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-5xl font-title text-ink mb-6">
          人生模拟器 🎮
        </h1>
        <p className="text-lg font-body text-ink-light mb-8 max-w-2xl mx-auto">
          体验不同的人生，做出关键选择，看看你的选择会带你走向何方
        </p>
        <CartoonButton 
          onClick={() => window.location.href = '/game'}
          variant="primary"
          size="lg"
        >
          开始游戏 →
        </CartoonButton>
      </div>
    </main>
  )
}
```

### Step 6: 测试与验证（30分钟）

```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问 http://localhost:3000
# 验证：
# ✓ 纸张背景纹理显示
# ✓ 标题使用手写体
# ✓ 按钮有立体阴影效果
# ✓ 按下按钮有下沉动画
```

---

## 🧪 测试检查清单

### 视觉检查
- [ ] 纸张背景纹理正确显示
- [ ] 字体正确加载（标题=站酷快乐体，正文=霞鹜文楷）
- [ ] 色彩符合设计系统（米黄+深蓝+木棕）
- [ ] 按钮有立体阴影效果
- [ ] 卡片有纸张质感

### 交互检查
- [ ] 按钮按下有下沉动画
- [ ] 卡片悬停有浮起效果
- [ ] 页面过渡流畅
- [ ] 加载动画符合手绘风格

### 响应式检查
- [ ] 移动端不显示纹理（或显示简化版）
- [ ] 移动端字号适当增大
- [ ] 平板端布局正常
- [ ] 桌面端显示完整装饰

### 性能检查
- [ ] 首屏加载 ≤ 3秒
- [ ] 字体不阻塞渲染（font-display: swap生效）
- [ ] 纹理图片懒加载
- [ ] 动画流畅60fps

### 可访问性检查
- [ ] 键盘可导航所有交互元素
- [ ] 焦点环清晰可见
- [ ] 文字对比度 ≥ 4.5:1
- [ ] 屏幕阅读器兼容

---

## 📦 核心组件示例

### PaperCard 组件

```tsx
interface PaperCardProps {
  children: React.ReactNode
  decoration?: 'clip' | 'pin' | 'none'
}

export function PaperCard({ children, decoration = 'none' }: PaperCardProps) {
  return (
    <div className="relative bg-paper-light rounded-lg border-4 border-cartoon-brown p-6 shadow-card hover:shadow-card-hover transition-all">
      {decoration === 'clip' && (
        <div className="absolute -top-3 left-6 text-3xl rotate-[-15deg]">
          📎
        </div>
      )}
      {decoration === 'pin' && (
        <div className="absolute -top-2 right-6 text-2xl rotate-45">
          📌
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
```

### LabelTab 组件

```tsx
interface LabelTabProps {
  text: string
  color?: 'blue' | 'yellow' | 'pink'
}

export function LabelTab({ text, color = 'blue' }: LabelTabProps) {
  const colors = {
    blue: 'bg-cartoon-blue-light',
    yellow: 'bg-yellow-200',
    pink: 'bg-pink-200'
  }
  
  return (
    <div className={`
      ${colors[color]}
      px-4 py-2 rounded-t-lg border-2 border-b-0 border-cartoon-brown
      font-title text-ink
      shadow-sm
      relative
    `}>
      <div className="absolute -top-2 -right-1 text-xl">📎</div>
      {text}
    </div>
  )
}
```

---

## 🔧 常见问题

### Q: 字体文件太大，加载慢怎么办？

**A**: 使用字体子集化工具：

```bash
# 使用 fontmin 压缩字体
npm install -g fontmin

# 仅包含常用 3000 汉字
fontmin --text="常用汉字列表" zcool-kuaile.ttf
```

### Q: 纸张纹理在移动端看不清？

**A**: 移动端不显示纹理，使用纯色：

```css
@media (max-width: 768px) {
  body {
    background-image: none;
    background-color: #f5e6d3;
  }
}
```

### Q: 按钮阴影在某些浏览器不显示？

**A**: 确保使用 Tailwind 配置的阴影类名，并检查浏览器兼容性。

### Q: 手写体在小屏幕上难以阅读？

**A**: 仅标题使用手写体，正文使用楷体，且移动端字号加大：

```css
@media (max-width: 768px) {
  .font-title { font-size: 1.5rem; }
  .font-body { font-size: 1rem; line-height: 1.75; }
}
```

---

## 📊 性能优化建议

### 1. 字体优化

```javascript
// 使用 Next.js Font Optimization
import localFont from 'next/font/local'

const zcoolKuaiLe = localFont({
  src: '../fonts/zcool-kuaile.woff2',
  variable: '--font-title',
  display: 'swap',
})
```

### 2. 纹理懒加载

```tsx
import Image from 'next/image'

// 使用 Next.js Image 组件
<div className="relative">
  <Image
    src="/textures/paper-texture.webp"
    alt="Paper texture"
    fill
    className="object-cover opacity-30"
    loading="lazy"
  />
</div>
```

### 3. CSS 动画优化

```css
/* 使用 will-change 优化动画性能 */
.cartoon-button {
  will-change: transform, box-shadow;
}

/* 动画结束后移除 will-change */
.cartoon-button:not(:hover):not(:active) {
  will-change: auto;
}
```

---

## 🎯 下一步

1. ✅ 完成本 Quickstart 步骤
2. ⏭️ 运行 `/speckit.tasks` 生成详细任务清单
3. ⏭️ 按照任务清单逐步实施
4. ⏭️ 每完成一个里程碑，进行验收测试

---

## 📞 支持与资源

- **设计系统文档**: [data-model.md](./data-model.md)
- **技术决策**: [research.md](./research.md)
- **实施计划**: [plan.md](./plan.md)
- **字体下载**: 
  - 站酷快乐体: https://www.zcool.com.cn/special/zcoolfonts/
  - 霞鹜文楷: https://github.com/lxgw/LxgwWenKai
- **纹理资源**: https://www.toptal.com/designers/subtlepatterns/

---

**版本**: 1.0  
**创建日期**: 2025-10-27  
**状态**: ✅ Ready to Use
