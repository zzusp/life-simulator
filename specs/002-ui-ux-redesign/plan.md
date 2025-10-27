# Implementation Plan: 手绘卡通风格 UI 重设计（002-ui-ux-redesign）

**Branch**: `002-ui-ux-redesign` | **Date**: 2025-10-27 | **Spec**: [spec.md](./spec.md)  
**Input**: 用户需求："修改UI，要求类似于手绘卡通风格的效果（参考图片：带有纸张质感、手绘字体、卡通按钮边框）"

## Summary

- **目标**：为"人生模拟器"游戏实现手绘卡通风格 UI，包括纸张纹理背景、手写体字体、卡通按钮、圆润边框、温暖色调等视觉元素。
- **技术方案**：基于 Next.js 15 + TypeScript + Tailwind CSS；使用站酷快乐体（仅h1标题）+霞鹜文楷（正文/按钮/标签）；WebP 纹理图片；自定义 CSS 阴影与动画；SVG/Emoji 装饰图标。
- **核心特征**：纸张质感、手绘字体、立体按钮、卡通边框、温暖色调、适度装饰、活泼动效（300-400ms，弹性效果）。

---

## Technical Context

| 项目 | 内容 | 状态 |
|------|------|------|
| **Language/Version** | TypeScript 5.x（Next.js 环境） | ✅ 已确定 |
| **Primary Dependencies** | Next.js 15 (App Router), Tailwind CSS, shadcn/ui, Radix UI | ✅ 已确定 |
| **新增依赖** | 站酷快乐体、霞鹜文楷（Web Fonts） | ✅ 已确定 |
| **纹理资源** | WebP 格式纸张纹理（~200KB） | ✅ 已确定 |
| **Storage** | Supabase（不变） | ✅ 复用现有 |
| **Testing** | Jest, React Testing Library, Playwright | ✅ 不变 |
| **Target Platform** | Web（SSR/SSG） | ✅ 不变 |
| **Project Type** | web | ✅ 不变 |
| **Performance Goals** | 首屏加载≤3s；字体子集化；纹理懒加载；动画60fps | ✅ 已确定 |
| **Constraints** | 对比度AA；减少动效降级；字体加载优先级；响应式适配 | ✅ 已确定 |
| **Scale/Scope** | 7个页面全面重设计；组件库重构；设计系统建立 | ✅ 已确定 |

---

## Constitution Check

### Next.js 优先架构
- ✅ 符合：使用 Next.js 15 App Router
- ✅ 符合：所有组件支持 SSR
- ✅ 符合：TypeScript 类型检查
- ✅ 符合：Next.js Font Optimization 用于字体加载

### 数据安全与合规
- ✅ 符合：不涉及新的数据收集
- ✅ 符合：纹理图片通过 CDN 加载
- ✅ 符合：字体文件自托管或使用可信 CDN

### 性能与可扩展性
- ✅ 符合：字体子集化减少文件大小
- ✅ 符合：纹理图片懒加载
- ✅ 符合：Next.js Image 组件优化
- ✅ 符合：CSS 动画优先（避免 JS 动画）

### 代码质量与一致性
- ✅ 符合：遵循 ESLint/Prettier
- ✅ 符合：函数式组件
- ✅ 符合：Zustand 状态管理（主题状态）
- ✅ 符合：错误边界处理

---

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-ux-redesign/
├── plan.md                    # 本文件
├── spec.md                    # ✅ 已更新（整合3个澄清）
├── research.md                # ✅ 已完成：技术选型与决策
├── data-model.md              # ✅ 已完成：设计系统数据模型
├── quickstart.md              # ✅ 已完成：快速开始指南
├── contracts/                 # 不涉及新API，复用现有
└── tasks.md                   # ⏭️ 待生成（/speckit.tasks）
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css                              # 全局样式：纸张背景、字体引入
│   ├── page.tsx                                 # 首页：手绘卡通风格改造
│   ├── game/page.tsx                            # 游戏主页：卡通卡片布局
│   ├── (game)/play/[sessionId]/page.tsx         # 游戏进行页：场景卡片
│   ├── share/[shareId]/page.tsx                 # 分享页：纸张风格
│   ├── history/page.tsx                         # 历史列表：手绘列表卡片
│   ├── history/[sessionId]/page.tsx             # 历史详情：时间线纸张风格
│   └── test/page.tsx                            # 测试页
├── components/
│   ├── cartoon/                                 # 新增：卡通风格组件库
│   │   ├── CartoonButton.tsx                    # 立体按钮
│   │   ├── PaperCard.tsx                        # 纸张卡片
│   │   ├── LabelTab.tsx                         # 标签纸
│   │   ├── HandDrawnIcon.tsx                    # 手绘图标
│   │   ├── DecorationClip.tsx                   # 回形针装饰
│   │   └── WoodFrame.tsx                        # 木质边框
│   ├── common/
│   │   ├── ErrorBlock.tsx                       # 手绘风格错误区块
│   │   └── LoadingSkeleton.tsx                  # 手绘风格加载
│   └── game/
│       ├── GameScene.tsx                        # 卡通风格场景UI
│       ├── GameResult.tsx                       # 纸张风格结果页
│       └── AchievementToast.tsx                 # 手绘成就提示
├── lib/
│   └── design-tokens.ts                         # 设计 tokens（色彩、字体、阴影等）
├── styles/
│   ├── fonts.css                                # 字体引入与配置
│   └── animations.css                           # 手绘风格动画库
└── public/
    ├── textures/                                # 纹理图片
    │   ├── paper-texture.webp                   # 纸张纹理
    │   ├── parchment-texture.webp               # 羊皮纸纹理
    │   └── wood-texture.webp                    # 木质纹理
    └── fonts/                                   # 字体文件（自托管）
        ├── zcool-kuaile.woff2                   # 站酷快乐体
        ├── zcool-kuaile.woff
        ├── lxgw-wenkai.woff2                    # 霞鹜文楷
        └── lxgw-wenkai.woff
```

**Structure Decision**: 
- 新增 `src/components/cartoon/` 目录存放手绘风格组件库
- 新增 `src/styles/` 目录存放字体与动画样式
- 新增 `public/textures/` 和 `public/fonts/` 存放静态资源
- 维持单仓单应用结构

---

## Phase 0: Outline & Research

✅ **已完成** - 见 [research.md](./research.md)

**关键决策摘要**（已整合澄清结果）：
1. **纸张质感**: WebP 纹理图片 + CSS 滤镜组合
2. **手绘字体**: 站酷快乐体（**仅 h1 标题**）+ 霞鹜文楷（**正文/按钮/标签**）
3. **卡通按钮**: CSS box-shadow 多层立体效果
4. **装饰元素**: Emoji + 自定义 SVG；**适度使用**（主要页面有装饰，列表页简化）
5. **色彩系统**: 温暖米黄色 + 深蓝色 + 木棕色
6. **动效策略**: **活泼风格**（300-400ms，位移≤16px，缩放≤5%，弹性曲线 bounce/wiggle）
7. **性能优化**: 字体子集化 + 纹理懒加载
8. **响应式**: 渐进增强，移动端简化纹理，字号增大（≥16px 正文，≥24px 标题）

**✅ 所有澄清项已完成** (/speckit.clarify 第二轮)：
- **动效幅度**：活泼（300-400ms，弹性效果 bounce/wiggle）
- **装饰密度**：适中（主要页面使用，列表简化）
- **字体应用**：标题专用手写体，其他用楷体

---

## Phase 1: Design & Contracts

### 1.1 Data Model

✅ **已完成** - 见 [data-model.md](./data-model.md)

**核心内容**：
- 完整的设计 tokens（色彩、字体、间距、圆角、阴影、动效）
- 组件数据模型（CartoonButton、PaperCard、LabelTab 等）
- 纹理资源清单与配置
- 字体资源清单与加载策略
- 响应式断点与策略
- UI 状态管理

### 1.2 Contracts

**不涉及新 API 接口** - 本次重设计仅涉及前端 UI 层，复用现有的后端 API。

### 1.3 Quickstart

✅ **已完成** - 见 [quickstart.md](./quickstart.md)

### 1.4 Agent Context Update

✅ **已完成** - Cursor IDE context 已同步更新

---

## Phase 2: High-Level Task Decomposition

**任务清单将在 `/speckit.tasks` 中生成**，覆盖：

### 阶段 1：核心基础设施（P0）
- 设计 tokens 文件创建（`src/lib/design-tokens.ts`）
- 全局样式配置（`src/app/globals.css`）
- 字体文件准备与引入（站酷快乐体 + 霞鹜文楷）
- 纸张纹理图片准备（WebP 格式）
- Tailwind 配置扩展（手绘卡通风格色彩、阴影、动效）

### 阶段 2：组件库建设（P1）
- CartoonButton 组件（立体阴影，300-400ms 动效）
- PaperCard 组件（纸张纹理，适度装饰）
- LabelTab 组件（标签纸效果）
- HandDrawnIcon 组件（手绘图标）
- DecorationClip 组件（回形针装饰）
- WoodFrame 组件（木质边框）

### 阶段 3：页面改造（P1）
- 首页手绘风格改造（h1 手写体，装饰元素）
- 游戏主页卡通卡片改造（适度装饰）
- 游戏进行页场景卡片改造（立体按钮，活泼动效）
- 结果页纸张风格改造（装饰元素）
- 分享页纸张风格改造（装饰元素）
- 历史列表手绘卡片改造（简化装饰）
- 历史详情时间线纸张风格改造

### 阶段 4：动效与交互（P2）
- 按钮按下动效（300-400ms，弹跳效果）
- 卡片悬停动效（轻微浮起）
- 页面过渡动画（摇摆效果）
- 加载动画手绘风格
- 成就提示手绘风格

### 阶段 5：优化与完善（P3）
- 字体子集化与加载优化（站酷快乐体 + 霞鹜文楷）
- 纹理图片懒加载
- 响应式适配（移动端简化，字号≥16px）
- 性能测试与优化（首屏≤3s）
- 可访问性测试与修复（对比度 AA）
- 减少动效降级支持

---

## 里程碑与验收

### 里程碑 A：设计系统建立（预计1周）
- ✅ design-tokens.ts 创建
- ✅ 全局样式配置完成（活泼动效：300-400ms）
- ✅ 字体文件加载成功（h1 手写体，其他楷体）
- ✅ 纸张纹理显示正常

**验收标准**：
- 首页能显示纸张背景纹理
- h1 标题使用站酷快乐体
- 正文/按钮/标签使用霞鹜文楷
- 色彩符合设计系统（米黄/深蓝/木棕）

### 里程碑 B：组件库完成（预计1周）
- ✅ 6个核心组件开发完成
- ✅ 组件响应式正常
- ✅ 动效符合规范（300-400ms，弹性曲线）

**验收标准**：
- CartoonButton 有立体阴影效果，按下有弹跳动画
- PaperCard 显示纸张纹理与适度装饰
- 所有组件响应式正常

### 里程碑 C：页面改造完成（预计2周）
- ✅ 7个页面全部改造完成
- ✅ 页面间过渡流畅
- ✅ 交互动效符合手绘风格（活泼，弹性）

**验收标准**：
- 首页→游戏主页→进行页流程完整
- 所有页面显示手绘卡通风格
- 主要页面有装饰，列表页简化
- 移动端响应式正常（字号≥16px）

### 里程碑 D：性能与可访问性验收（预计1周）
- ✅ 首屏加载≤3s
- ✅ Lighthouse 性能评分≥90
- ✅ 对比度 AA 标准通过
- ✅ 键盘导航完整

**验收标准**：
- 字体加载不阻塞渲染（font-display: swap）
- 纹理图片懒加载成功
- 所有交互元素可键盘访问
- 屏幕阅读器兼容

---

## 技术风险与缓解

### 风险 1：字体文件过大导致加载慢
**影响**: 首屏加载时间超过 3 秒  
**概率**: 中  
**缓解**:
- 使用 font-spider 或 fontmin 进行字体子集化
- 仅包含常用 3000 汉字，减少文件到 ~500KB
- 使用 font-display: swap 避免阻塞渲染
- 预加载关键字体文件

### 风险 2：纸张纹理在移动端性能差
**影响**: 移动端卡顿或加载慢  
**概率**: 中  
**缓解**:
- 移动端使用纯色背景，不加载纹理
- 或使用更轻量级的纹理（50KB）
- 使用 WebP 格式减少文件大小
- 懒加载非关键纹理

### 风险 3：手写体可读性差
**影响**: 用户阅读困难，体验下降  
**概率**: 低  
**缓解**:
- ✅ 已通过澄清确定：仅 h1 标题使用手写体
- 所有正文、按钮、标签使用楷体确保可读性
- 移动端字号≥16px（正文）、≥24px（标题）
- 行距≥1.75
- 对比度测试确保≥4.5:1

### 风险 4：多层阴影影响性能
**影响**: 动画卡顿，不流畅  
**概率**: 低  
**缓解**:
- 移动端减少阴影层数
- 使用 will-change 优化动画性能
- 避免在滚动时触发阴影动画
- 使用 CSS transforms 替代 box-shadow 动画

---

## 依赖与约束

### 外部依赖
- ✅ 站酷快乐体字体文件（需下载或 CDN）
- ✅ 霞鹜文楷字体文件（需下载或 CDN）
- ✅ 纸张纹理图片（需准备或购买）
- ✅ Tailwind CSS 配置扩展

### 内部约束
- 不改变后端 API 接口
- 不改变数据库结构
- 保持现有路由结构
- 保持现有功能逻辑

### 时间约束
- 预计总工期：5周
- 核心功能（里程碑 A-C）：4周
- 优化与测试（里程碑 D）：1周

---

## Constitution Re-Check (Post-Design & Clarification)

### Next.js 优先架构
- ✅ 设计方案完全基于 Next.js
- ✅ 字体使用 Next.js Font Optimization
- ✅ 图片使用 Next.js Image 组件

### 性能与可扩展性
- ✅ 字体子集化策略明确
- ✅ 纹理懒加载策略明确
- ✅ 响应式渐进增强策略明确（移动端简化）

### 代码质量与一致性
- ✅ 组件库统一设计
- ✅ Design tokens 标准化
- ✅ 类型定义完整

---

## 下一步行动

1. ✅ Phase 0 已完成（research.md）
2. ✅ Phase 1 已完成（data-model.md, quickstart.md, agent context）
3. ✅ Clarifications 已完成（3/3 问题）
4. ⏭️ **运行 `/speckit.tasks` 生成详细任务清单**
5. ⏭️ 运行 `/speckit.implement` 开始实施

**Branch**: 002-ui-ux-redesign  
**Plan Path**: `D:\project\life-simulator\specs\002-ui-ux-redesign\plan.md`  

**Generated Artifacts**:
- ✅ spec.md (已更新) - 整合了3个澄清问答
- ✅ research.md - 技术选型与决策
- ✅ data-model.md - 设计系统数据模型
- ✅ quickstart.md - 快速开始指南
- ✅ .cursor/rules/specify-rules.mdc - Agent context 已同步
- ⏭️ tasks.md (待 /speckit.tasks 生成)

---

**Plan Version**: 2.1 (手绘卡通风格 - 澄清完成版)  
**Created**: 2025-10-27  
**Last Updated**: 2025-10-27  
**Clarifications Completed**: ✅ 3/3 (动效幅度 + 装饰密度 + 字体应用)  
**Status**: ✅ Phase 0-1 Complete + Clarifications Done → Ready for Phase 2 (Tasks Generation)
