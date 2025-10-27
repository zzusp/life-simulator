# Data Model: 手绘卡通风格 UI 设计系统

## 设计 Tokens（Design Tokens）

### 1. 色彩系统（Color System）

```typescript
interface ColorTokens {
  // 纸张色系
  paper: {
    DEFAULT: '#f5e6d3',  // 主背景米黄色
    light: '#fffef9',    // 卡片浅米色
    dark: '#e8d5bd',     // 深米色（边缘）
  },
  
  // 卡通元素色
  cartoon: {
    blue: '#4a5f7f',        // 主按钮深蓝
    blueLight: '#7ba3d6',   // 标签纸浅蓝
    brown: '#8b7355',       // 边框木棕色
    orange: '#e8945f',      // 强调暖橙色
  },
  
  // 墨水色（文字）
  ink: {
    DEFAULT: '#2d2d2d',  // 主文字深灰
    light: '#6b5d4f',    // 辅助文字灰棕
  },
  
  // 功能色
  functional: {
    success: '#6ba368',   // 成功绿（低饱和度）
    warning: '#d9a84a',   // 警告黄（温暖）
    error: '#c76b6b',     // 错误红（柔和）
    info: '#7ba3d6',      // 信息蓝
  },
}
```

### 2. 字体系统（Typography）

```typescript
interface FontTokens {
  // 字体族
  family: {
    title: '"Zcool KuaiLe", "站酷快乐体", cursive',  // 标题手写体
    body: '"LXGW WenKai", "霞鹜文楷", serif',        // 正文楷体
    fallback: 'system-ui, sans-serif',              // 回退字体
  },
  
  // 字号
  size: {
    xs: '0.75rem',    // 12px - 辅助文字
    sm: '0.875rem',   // 14px - 小文字
    base: '1rem',     // 16px - 正文
    lg: '1.125rem',   // 18px - 大正文
    xl: '1.25rem',    // 20px - 小标题
    '2xl': '1.5rem',  // 24px - 中标题
    '3xl': '1.875rem',// 30px - 大标题
    '4xl': '2.25rem', // 36px - 特大标题
  },
  
  // 行高
  leading: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },
  
  // 字重
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}
```

### 3. 间距系统（Spacing）

```typescript
interface SpacingTokens {
  // Tailwind 标准间距
  space: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
  },
}
```

### 4. 圆角系统（Border Radius）

```typescript
interface RadiusTokens {
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px - 小元素
    DEFAULT: '0.5rem', // 8px - 卡片
    md: '0.75rem',    // 12px - 中等卡片
    lg: '1rem',       // 16px - 大按钮
    xl: '1.5rem',     // 24px - 特大按钮
    '2xl': '2rem',    // 32px - 圆润元素
    full: '9999px',   // 完全圆形
  },
}
```

### 5. 阴影系统（Shadows）

```typescript
interface ShadowTokens {
  // 卡通风格阴影（多层，立体感）
  shadow: {
    // 按钮立体阴影
    button: [
      'inset 0 -2px 0 rgba(0,0,0,0.2)',      // 内阴影（高光）
      '0 4px 0 #2d3a4d',                      // 厚边缘
      '0 6px 8px rgba(0,0,0,0.15)',          // 柔和投影
    ].join(', '),
    
    // 按钮悬停
    buttonHover: [
      'inset 0 -2px 0 rgba(0,0,0,0.2)',
      '0 6px 0 #2d3a4d',
      '0 8px 12px rgba(0,0,0,0.2)',
    ].join(', '),
    
    // 按钮按下
    buttonActive: [
      'inset 0 1px 0 rgba(0,0,0,0.3)',
      '0 2px 0 #2d3a4d',
    ].join(', '),
    
    // 卡片阴影
    card: [
      '0 2px 4px rgba(139, 115, 85, 0.2)',   // 柔和投影
      'inset 0 0 60px rgba(255, 248, 220, 0.5)', // 内部光晕
    ].join(', '),
    
    // 卡片悬停
    cardHover: [
      '0 4px 8px rgba(139, 115, 85, 0.25)',
      'inset 0 0 60px rgba(255, 248, 220, 0.6)',
    ].join(', '),
    
    // 轻阴影（装饰元素）
    sm: '0 1px 2px rgba(0, 0, 0, 0.08)',
    
    // 重阴影（弹窗）
    lg: '0 10px 24px rgba(139, 115, 85, 0.3)',
  },
}
```

### 6. 动效系统（Animation）

```typescript
interface AnimationTokens {
  // 动画时长
  duration: {
    fast: '150ms',      // 快速交互
    base: '250ms',      // 标准过渡
    slow: '400ms',      // 慢速动画
    slower: '600ms',    // 入场动画
  },
  
  // 缓动曲线
  easing: {
    // 手绘风格：略带弹性
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    // 标准缓动
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // 柔和进入
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    // 柔和退出
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  
  // 关键帧动画
  keyframes: {
    // 摇摆动画（手绘感）
    wiggle: {
      '0%, 100%': { transform: 'rotate(-1deg)' },
      '50%': { transform: 'rotate(1deg)' },
    },
    
    // 弹跳入场
    bounceIn: {
      '0%': { opacity: '0', transform: 'scale(0.9)' },
      '50%': { transform: 'scale(1.02)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    
    // 浮动动画（装饰元素）
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-4px)' },
    },
  },
}
```

---

## 组件数据模型（Component Data Models）

### 1. 卡通按钮（CartoonButton）

```typescript
interface CartoonButtonProps {
  // 基础属性
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  
  // 样式变体
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  
  // 视觉状态
  state?: 'default' | 'hover' | 'active' | 'disabled'
  
  // 装饰
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

// 样式配置
interface CartoonButtonStyles {
  primary: {
    bg: '#4a5f7f',
    border: '#2d3a4d',
    text: '#ffffff',
    shadow: 'shadow-button',
  },
  secondary: {
    bg: '#e8945f',
    border: '#c67445',
    text: '#2d2d2d',
    shadow: 'shadow-button',
  },
  // ...其他变体
}
```

### 2. 纸张卡片（PaperCard）

```typescript
interface PaperCardProps {
  // 内容
  children: React.ReactNode
  title?: string
  
  // 装饰
  decoration?: 'clip' | 'pin' | 'tape' | 'none'
  decorationPosition?: 'top-left' | 'top-right' | 'top-center'
  
  // 边框样式
  border?: 'wood' | 'paper' | 'none'
  borderWidth?: number
  
  // 交互
  hoverable?: boolean
  onClick?: () => void
  
  // 背景
  texture?: 'paper' | 'parchment' | 'cardboard'
}

// 装饰元素配置
interface DecorationConfig {
  clip: {
    emoji: '📎',
    rotation: -15,
    top: -10,
  },
  pin: {
    emoji: '📌',
    rotation: 45,
    top: -8,
  },
  tape: {
    component: '<TapeStrip />',
    rotation: 0,
    top: -4,
  },
}
```

### 3. 标签纸（LabelTab）

```typescript
interface LabelTabProps {
  // 内容
  text: string
  
  // 视觉
  color: 'blue' | 'yellow' | 'pink' | 'green'
  size: 'sm' | 'md' | 'lg'
  
  // 装饰
  hasClip?: boolean
  rotation?: number
  
  // 位置
  position: 'top' | 'left' | 'right'
}
```

### 4. 手绘图标（HandDrawnIcon）

```typescript
interface HandDrawnIconProps {
  // 图标类型
  type: 'star' | 'heart' | 'arrow' | 'check' | 'cross' | 'info'
  
  // 尺寸
  size: number // px
  
  // 颜色
  color: string
  
  // 动画
  animated?: boolean
  animationType?: 'wiggle' | 'float' | 'bounce'
}
```

---

## 纹理资源（Texture Assets）

### 1. 背景纹理

```typescript
interface TextureAsset {
  // 文件信息
  filename: string
  path: string
  format: 'webp' | 'png'
  size: number // KB
  
  // 使用场景
  usage: string
  
  // 性能配置
  lazyLoad?: boolean
  priority?: 'high' | 'low'
}

// 纹理清单
const textures: TextureAsset[] = [
  {
    filename: 'paper-texture.webp',
    path: '/textures/paper-texture.webp',
    format: 'webp',
    size: 120,
    usage: '主背景纸张纹理',
    priority: 'high',
  },
  {
    filename: 'parchment-texture.webp',
    path: '/textures/parchment-texture.webp',
    format: 'webp',
    size: 150,
    usage: '卡片羊皮纸纹理',
    lazyLoad: true,
    priority: 'low',
  },
  {
    filename: 'wood-texture.webp',
    path: '/textures/wood-texture.webp',
    format: 'webp',
    size: 180,
    usage: '边框木质纹理',
    lazyLoad: true,
    priority: 'low',
  },
]
```

---

## 字体资源（Font Assets）

### 1. 字体文件

```typescript
interface FontAsset {
  // 字体信息
  family: string
  displayName: string
  
  // 文件信息
  files: {
    woff2: string
    woff: string
  }
  
  // 字重
  weights: number[]
  
  // 字符子集
  subset?: 'latin' | 'chinese-simplified' | 'full'
  
  // 加载策略
  display: 'swap' | 'optional' | 'fallback'
  preload: boolean
}

// 字体清单
const fonts: FontAsset[] = [
  {
    family: 'Zcool KuaiLe',
    displayName: '站酷快乐体',
    files: {
      woff2: '/fonts/zcool-kuaile.woff2',
      woff: '/fonts/zcool-kuaile.woff',
    },
    weights: [400],
    subset: 'chinese-simplified',
    display: 'swap',
    preload: true,
  },
  {
    family: 'LXGW WenKai',
    displayName: '霞鹜文楷',
    files: {
      woff2: '/fonts/lxgw-wenkai.woff2',
      woff: '/fonts/lxgw-wenkai.woff',
    },
    weights: [400, 700],
    subset: 'chinese-simplified',
    display: 'swap',
    preload: true,
  },
]
```

---

## 响应式断点（Breakpoints）

```typescript
interface BreakpointTokens {
  breakpoints: {
    sm: '640px',   // 移动端（小）
    md: '768px',   // 平板端
    lg: '1024px',  // 桌面端（小）
    xl: '1280px',  // 桌面端（大）
    '2xl': '1536px', // 超大屏
  },
  
  // 手绘风格响应式策略
  strategies: {
    mobile: {
      paperTexture: false,    // 移动端不显示纸张纹理
      decorations: 'minimal', // 最小装饰
      fontSize: '+2px',       // 字号加大
    },
    tablet: {
      paperTexture: true,
      decorations: 'normal',
      fontSize: '+1px',
    },
    desktop: {
      paperTexture: true,
      decorations: 'full',
      fontSize: 'default',
    },
  },
}
```

---

## UI 状态管理（UI State）

### 1. 主题状态

```typescript
interface ThemeState {
  // 当前主题
  currentTheme: 'cartoon-light'  // 首版仅浅色
  
  // 纹理开关（性能优化）
  textureEnabled: boolean
  
  // 动画偏好
  reducedMotion: boolean
  
  // 字体加载状态
  fontsLoaded: boolean
}
```

### 2. 交互状态

```typescript
interface InteractionState {
  // 悬停状态
  hoveredElement: string | null
  
  // 按下状态
  activeElement: string | null
  
  // 聚焦状态
  focusedElement: string | null
}
```

---

## 总结

本数据模型定义了手绘卡通风格 UI 的所有设计 tokens、组件接口、资源配置和状态管理结构，为实施提供完整的数据基础。

**关键特点**：
- 完整的色彩、字体、间距、阴影系统
- 可复用的组件数据模型
- 清晰的资源管理策略
- 响应式与性能优化配置

**版本**: 1.0  
**创建日期**: 2025-10-27  
**状态**: ✅ 已完成
