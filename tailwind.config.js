/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // 手绘卡通风格色彩系统
        paper: {
          DEFAULT: '#f5e6d3',  // 主背景米黄色
          light: '#fffef9',    // 卡片浅米色
          dark: '#e8d5bd',     // 深米色（边缘）
        },
        cartoon: {
          blue: '#5b6f8d',        // 主按钮深蓝灰
          blueLight: '#89b4e8',   // 标签纸浅蓝
          brown: '#6d4c3d',       // 边框深木棕色（更深更立体）
          brownLight: '#8b6f5c',  // 浅木棕色（用于渐变）
          orange: '#e8945f',      // 强调暖橙色
          purple: '#7c6ba6',      // 紫色（用于背景渐变）
          purpleLight: '#9d8bc7', // 浅紫色
        },
        ink: {
          DEFAULT: '#2d2d2d',  // 主文字深灰
          light: '#6b5d4f',    // 辅助文字灰棕
        },
        functional: {
          success: '#6ba368',   // 成功绿（低饱和度）
          warning: '#d9a84a',   // 警告黄（温暖）
          error: '#c76b6b',     // 错误红（柔和）
          info: '#7ba3d6',      // 信息蓝
        },
        // 保留 shadcn/ui 的色彩变量（兼容性）
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        title: ['"ZCOOL KuaiLe"', '"Zcool KuaiLe"', '"站酷快乐体"', 'cursive', 'system-ui'],
        body: ['"LXGW WenKai"', '"霞鹜文楷"', 'serif', 'system-ui'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // 手绘卡通风格圆角
        'cartoon-sm': '0.75rem',   // 12px
        'cartoon': '1rem',         // 16px
        'cartoon-lg': '1.5rem',    // 24px
        'cartoon-xl': '2rem',      // 32px
      },
      boxShadow: {
        // 手绘卡通风格阴影（增强版）
        'button': 'inset 0 -3px 0 rgba(0,0,0,0.3), 0 5px 0 #2d3a4d, 0 8px 12px rgba(0,0,0,0.25)',
        'button-hover': 'inset 0 -3px 0 rgba(0,0,0,0.3), 0 7px 0 #2d3a4d, 0 10px 16px rgba(0,0,0,0.3)',
        'button-active': 'inset 0 2px 0 rgba(0,0,0,0.4), 0 2px 0 #2d3a4d, 0 3px 6px rgba(0,0,0,0.2)',
        'wood-frame': 'inset 0 0 30px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3), 0 0 0 2px rgba(0,0,0,0.1)',
        'card': '0 2px 4px rgba(139, 115, 85, 0.2), inset 0 0 60px rgba(255, 248, 220, 0.5)',
        'card-hover': '0 4px 8px rgba(139, 115, 85, 0.25), inset 0 0 60px rgba(255, 248, 220, 0.6)',
      },
      transitionDuration: {
        'cartoon': '350ms',  // 卡通风格默认时长
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // 弹性曲线
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        // 手绘卡通风格动画
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // 手绘卡通风格动画
        'wiggle': 'wiggle 0.4s ease-in-out',
        'bounce-in': 'bounceIn 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'float': 'float 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
