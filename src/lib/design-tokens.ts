/**
 * Design Tokens: 手绘卡通风格 UI 设计系统
 * 
 * 定义完整的色彩、字体、间距、圆角、阴影、动效配置
 */

// ============================================================================
// 色彩系统（Color System）
// ============================================================================

export const colors = {
  // 纸张色系
  paper: {
    DEFAULT: '#f5e6d3',  // 主背景米黄色
    light: '#fffef9',    // 卡片浅米色
    dark: '#e8d5bd',     // 深米色（边缘）
  },
  
  // 卡通元素色
  cartoon: {
    blue: '#5b6f8d',        // 主按钮深蓝灰
    blueLight: '#89b4e8',   // 标签纸浅蓝
    brown: '#6d4c3d',       // 边框深木棕色（更深更立体）
    brownLight: '#8b6f5c',  // 浅木棕色（用于渐变）
    orange: '#e8945f',      // 强调暖橙色
    purple: '#7c6ba6',      // 紫色（用于背景渐变）
    purpleLight: '#9d8bc7', // 浅紫色
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
} as const;

// ============================================================================
// 字体系统（Typography）
// ============================================================================

export const fonts = {
  // 字体族
  family: {
    title: '"Zcool KuaiLe", "ZCOOL KuaiLe", "站酷快乐体", cursive, system-ui',  // 标题手写体
    body: '"LXGW WenKai", "霞鹜文楷", "LXGW WenKai Screen", serif, system-ui',    // 正文楷体
    fallback: 'system-ui, -apple-system, "Segoe UI", sans-serif',                // 回退字体
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
    '5xl': '3rem',    // 48px - 超大标题
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
} as const;

// ============================================================================
// 间距系统（Spacing）
// ============================================================================

export const spacing = {
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
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ============================================================================
// 圆角系统（Border Radius）
// ============================================================================

export const radius = {
  none: '0',
  sm: '0.25rem',    // 4px - 小元素
  DEFAULT: '0.5rem', // 8px - 卡片
  md: '0.75rem',    // 12px - 中等卡片
  lg: '1rem',       // 16px - 大按钮
  xl: '1.5rem',     // 24px - 特大按钮
  '2xl': '2rem',    // 32px - 圆润元素
  full: '9999px',   // 完全圆形
} as const;

// ============================================================================
// 阴影系统（Shadows）
// ============================================================================

export const shadows = {
  // 按钮立体阴影（更深更厚实）
  button: [
    'inset 0 -3px 0 rgba(0,0,0,0.3)',      // 内阴影（高光）
    '0 5px 0 #2d3a4d',                      // 厚边缘（加厚）
    '0 8px 12px rgba(0,0,0,0.25)',         // 柔和投影
  ].join(', '),
  
  // 按钮悬停
  buttonHover: [
    'inset 0 -3px 0 rgba(0,0,0,0.3)',
    '0 7px 0 #2d3a4d',
    '0 10px 16px rgba(0,0,0,0.3)',
  ].join(', '),
  
  // 按钮按下
  buttonActive: [
    'inset 0 2px 0 rgba(0,0,0,0.4)',
    '0 2px 0 #2d3a4d',
    '0 3px 6px rgba(0,0,0,0.2)',
  ].join(', '),
  
  // 木质边框阴影（深色立体）
  woodFrame: [
    'inset 0 0 30px rgba(0,0,0,0.2)',      // 内部阴影
    '0 8px 16px rgba(0,0,0,0.3)',          // 外部投影
    '0 0 0 2px rgba(0,0,0,0.1)',           // 细边缘
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
  
  // 中阴影
  md: '0 2px 4px rgba(139, 115, 85, 0.15)',
  
  // 重阴影（弹窗）
  lg: '0 10px 24px rgba(139, 115, 85, 0.3)',
  
  // 超重阴影
  xl: '0 20px 40px rgba(139, 115, 85, 0.4)',
} as const;

// ============================================================================
// 动效系统（Animation）
// ============================================================================

export const animation = {
  // 动画时长
  duration: {
    fast: '150ms',      // 快速交互
    base: '250ms',      // 标准过渡
    cartoon: '350ms',   // 卡通风格默认时长
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
    // 柔和进出
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// 响应式断点（Breakpoints）
// ============================================================================

export const breakpoints = {
  sm: '640px',   // 移动端（小）
  md: '768px',   // 平板端
  lg: '1024px',  // 桌面端（小）
  xl: '1280px',  // 桌面端（大）
  '2xl': '1536px', // 超大屏
} as const;

// ============================================================================
// 分数标签映射（Score Label Mapping）
// ============================================================================

export const scoreLabels = [
  { threshold: 90, label: '卓越', color: colors.functional.success },
  { threshold: 80, label: '优秀', color: colors.cartoon.blueLight },
  { threshold: 70, label: '良好', color: colors.functional.info },
  { threshold: 60, label: '及格', color: colors.functional.warning },
  { threshold: 40, label: '一般', color: colors.cartoon.orange },
  { threshold: 0, label: '需要努力', color: colors.functional.error },
] as const;

/**
 * 获取分数对应的标签和颜色
 */
export function getScoreLabel(score: number): { label: string; color: string } {
  for (const item of scoreLabels) {
    if (score >= item.threshold) {
      return { label: item.label, color: item.color };
    }
  }
  return { label: '未知', color: colors.ink.light };
}

// ============================================================================
// 导出类型定义
// ============================================================================

export type Colors = typeof colors;
export type Fonts = typeof fonts;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type Animation = typeof animation;
export type Breakpoints = typeof breakpoints;

// 默认导出所有 tokens
export default {
  colors,
  fonts,
  spacing,
  radius,
  shadows,
  animation,
  breakpoints,
  scoreLabels,
  getScoreLabel,
};

