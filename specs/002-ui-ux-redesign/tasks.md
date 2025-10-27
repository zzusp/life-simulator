# Tasks: 手绘卡通风格 UI 重设计

**Feature**: 002-ui-ux-redesign  
**Branch**: `002-ui-ux-redesign`  
**Generated**: 2025-10-27  
**Total Estimated Time**: 5 weeks (25 working days)

---

## Implementation Strategy

本项目采用**按 User Story 组织任务**的策略，每个 User Story 都是一个独立可测试的增量交付单元：

1. **MVP 优先**：User Story 1（首页+游戏主页）构成 MVP，优先完成
2. **增量交付**：每完成一个 User Story，即可独立测试和验收
3. **并行执行**：标记 `[P]` 的任务可与同阶段其他任务并行
4. **依赖管理**：Setup 和 Foundational 阶段为所有 User Story 的先决条件

---

## Task Summary

| Phase | Tasks | Parallelizable | Estimated Time |
|-------|-------|----------------|----------------|
| Phase 1: Setup | 8 | 5 | 3 days |
| Phase 2: Foundational | 9 | 6 | 4 days |
| Phase 3: US1 (首页+游戏主页) | 6 | 4 | 3 days |
| Phase 4: US2 (游戏进行页) | 7 | 5 | 4 days |
| Phase 5: US3 (结果+分享页) | 6 | 4 | 3 days |
| Phase 6: US4 (历史页) | 6 | 4 | 3 days |
| Phase 7: US5 (无障碍) | 5 | 2 | 2 days |
| Phase 8: Polish | 6 | 3 | 3 days |
| **Total** | **53** | **33** | **25 days** |

---

## Phase 1: Setup（项目初始化）

**目标**：准备手绘卡通风格 UI 所需的基础资源和配置。

### Tasks

- [X] T001 下载并准备纸张纹理资源（WebP 格式）到 public/textures/ - 使用 CDN 和 CSS 模拟替代
- [X] T002 [P] 下载站酷快乐体字体文件（woff2 + woff）到 public/fonts/ - 使用 Google Fonts CDN
- [X] T003 [P] 下载霞鹜文楷字体文件（woff2 + woff）到 public/fonts/ - 使用 jsDelivr CDN
- [X] T004 [P] 创建 src/lib/design-tokens.ts 定义完整设计系统
- [X] T005 [P] 创建 src/styles/fonts.css 配置字体引入与 font-face
- [X] T006 [P] 创建 src/styles/animations.css 定义手绘风格动画
- [X] T007 扩展 tailwind.config.js 添加手绘卡通风格色彩、阴影、动效配置
- [X] T008 在 src/app/layout.tsx 中引入 fonts.css 和 animations.css

**验收标准**：
- 纹理图片可通过 `/textures/paper-texture.webp` 访问
- 字体文件可通过 `/fonts/zcool-kuaile.woff2` 等访问
- design-tokens.ts 导出完整的色彩、字体、阴影、动效配置
- Tailwind 配置包含 paper、cartoon、ink 等自定义色彩

**Parallel Execution Example**:
```bash
# 可同时执行的任务组
Group 1: T002, T003, T004, T005, T006 (下载资源 + 创建配置文件)
Sequential: T001 → T007 → T008 (依赖关系)
```

---

## Phase 2: Foundational（组件库建设）

**目标**：构建手绘卡通风格的核心组件库，为所有页面提供统一的 UI 元素。

**依赖**：Phase 1 完成

### Tasks

- [X] T009 创建 src/components/cartoon/ 目录结构
- [X] T010 [P] 实现 CartoonButton 组件（立体阴影，300-400ms 弹跳动效）在 src/components/cartoon/CartoonButton.tsx
- [X] T011 [P] 实现 PaperCard 组件（纸张纹理，适度装饰）在 src/components/cartoon/PaperCard.tsx
- [X] T012 [P] 实现 LabelTab 组件（标签纸效果）在 src/components/cartoon/LabelTab.tsx
- [X] T013 [P] 实现 HandDrawnIcon 组件（手绘图标）在 src/components/cartoon/HandDrawnIcon.tsx
- [X] T014 [P] 实现 DecorationClip 组件（回形针装饰）在 src/components/cartoon/DecorationClip.tsx
- [X] T015 [P] 实现 WoodFrame 组件（木质边框）在 src/components/cartoon/WoodFrame.tsx
- [X] T016 更新 ErrorBlock 组件为手绘风格在 src/components/common/ErrorBlock.tsx
- [X] T017 更新 LoadingSkeleton 组件为手绘风格在 src/components/common/LoadingSkeleton.tsx

**验收标准**：
- CartoonButton 有 primary/secondary/outline/ghost 四种变体
- CartoonButton 按下时有 translateY(2px) 和阴影缩短效果
- PaperCard 显示纸张纹理背景（桌面端）
- 所有组件支持 disabled 状态
- 所有组件在移动端响应式正常

**Parallel Execution Example**:
```bash
# 可同时执行的任务组
Sequential: T009 (创建目录)
Group 1: T010, T011, T012, T013, T014, T015 (6个组件可并行开发)
Group 2: T016, T017 (更新现有组件)
```

---

## Phase 3: User Story 1 - 新手从首页开始游戏 (Priority: P1)

**目标**：改造首页和游戏主页，建立手绘卡通风格的第一印象，提升转化率。

**依赖**：Phase 2 完成

**Independent Test**：仅访问首页 (/) 和游戏主页 (/game)，验证手绘卡通风格呈现和流程转化。

### Tasks

- [X] T018 [P] [US1] 更新 src/app/globals.css 添加全局纸张背景和 h1 手写体样式
- [X] T019 [P] [US1] 改造首页 src/app/page.tsx 使用 PaperCard + CartoonButton + DecorationClip
- [X] T020 [P] [US1] 为首页添加 h1 标题（站酷快乐体）和副标题（霞鹜文楷）
- [X] T021 [P] [US1] 改造游戏主页 src/app/game/page.tsx 使用 LifeTypeSelector + PaperCard
- [X] T022 [US1] 为游戏主页添加 LabelTab 装饰元素（适度使用）
- [X] T023 [US1] 验收：从首页点击"开始游戏"到游戏主页流程完整，视觉一致

**验收标准**：
- 首页 h1 标题使用站酷快乐体，字号≥36px（移动端≥24px）
- 首页背景显示纸张纹理（桌面端）
- 首页有回形针或标签纸装饰元素
- 游戏主页人生类型卡片使用 PaperCard 组件
- "开始游戏"按钮使用 CartoonButton，有立体阴影效果
- 移动端字号≥16px（正文）

**Acceptance Scenarios**:
1. 首次到访首页，3 秒内理解玩法并发现"开始游戏"按钮
2. 点击"开始游戏"，进入游戏主页，2 次以内交互完成类型选择

**Parallel Execution Example**:
```bash
Group 1: T018, T019, T020, T021 (可并行改造不同文件)
Sequential: T022 → T023 (依赖前面任务完成)
```

---

## Phase 4: User Story 2 - 玩家在场景中做出选择并获得清晰反馈 (Priority: P1)

**目标**：改造游戏进行页，提供清晰的场景展示、选择交互和动态反馈。

**依赖**：Phase 2 完成（不依赖 US1）

**Independent Test**：直接进入游戏进行页 (/play/[sessionId])，验证场景展示、选择交互、分数动画和成就提示。

### Tasks

- [X] T024 [P] [US2] 改造 GameScene 组件在 src/components/game/GameScene.tsx 使用 PaperCard + CartoonButton
- [X] T025 [P] [US2] 为场景标题和描述应用楷体（霞鹜文楷）并确保移动端字号≥16px
- [X] T026 [P] [US2] 实现选择卡片悬停效果（轻微浮起，box-shadow 增强，300-400ms）
- [X] T027 [P] [US2] 实现选择处理态（半透明遮罩 + 禁用其他选项 + 加载骨架屏）
- [X] T028 [P] [US2] 改造 ScoreAnimation 组件支持弹性曲线（bounce）和位移≤16px
- [X] T029 [US2] 改造 AchievementToast 为手绘风格（PaperCard + HandDrawnIcon）在 src/components/game/AchievementToast.tsx
- [X] T030 [US2] 验收：完成 3 次选择流程，分数动画流畅，成就提示不遮挡主交互区

**验收标准**：
- 场景标题和描述使用霞鹜文楷，行距≥1.75
- 选择卡片悬停时有轻微浮起效果（transform: translateY(-4px)）
- 选择卡片按下时有弹跳动画（300-400ms，bounce 曲线）
- 分数变化动画时长 0.8-1.2s，数字平滑过渡
- 成就 Toast 单条展示约 3s，队列严格串行，条间≥300ms
- 成就 Toast 显示在角落，不遮挡主要操作区

**Acceptance Scenarios**:
1. 场景已加载，悬停/触碰某个选择，卡片出现高亮与可点击提示
2. 点选一个选择，其他选项禁用且出现半透明遮罩+进度反馈
3. AI 返回结果，分数在 1s 内完成数字过渡动画并显示变化值
4. 解锁成就，成就 Toast 3s 内自动淡出，不遮挡主交互区

**Parallel Execution Example**:
```bash
Group 1: T024, T025, T026, T027, T028 (可并行改造不同子功能)
Sequential: T029 → T030
```

---

## Phase 5: User Story 3 - 完成一局并查看结果/分享 (Priority: P2)

**目标**：改造结果页和分享页，提供清晰的结果展示和友好的分享体验。

**依赖**：Phase 2 完成（不依赖 US1/US2）

**Independent Test**：游戏结束后进入结果页，点击分享并访问分享链接，验证手绘风格和功能完整性。

### Tasks

- [X] T031 [P] [US3] 改造 GameResult 组件在 src/components/game/GameResult.tsx 使用 PaperCard + 装饰元素
- [X] T032 [P] [US3] 为结果页添加分数色阶标签（卓越/优秀/良好等）使用 LabelTab 组件
- [X] T033 [P] [US3] 为结果页关键统计（分数/选择数/时长）使用卡片栅格布局
- [X] T034 [P] [US3] 改造分享页 src/app/share/[shareId]/page.tsx 使用 PaperCard + DecorationClip
- [X] T035 [US3] 为分享页添加"返回首页开始游戏"CTA 使用 CartoonButton
- [X] T036 [US3] 验收：完成结果页到分享页流程，分享链接可正常访问并显示手绘风格

**验收标准**：
- 结果页标题与原因文案在首屏可见
- 关键统计以卡片栅格呈现（移动端单列，桌面端三列）
- 分数标签根据映射规则显示（≥90 卓越，≥80 优秀，等）
- 分享页显示该局概览、成就列表和引导 CTA
- 分享失败时显示内嵌错误区块（ErrorBlock）+ 重试按钮
- 所有按钮使用 CartoonButton，有立体阴影效果

**Acceptance Scenarios**:
1. 游戏结束，打开结果页，结果标题与原因文案在首屏可见
2. 点击分享，复制链接成功，显示轻量反馈
3. 打开分享链接，看到清晰的分数色阶与标签

**Parallel Execution Example**:
```bash
Group 1: T031, T032, T033, T034 (可并行改造不同页面)
Sequential: T035 → T036
```

---

## Phase 6: User Story 4 - 历史页与详情 (Priority: P3)

**目标**：改造历史列表页和历史详情页，提供清晰的历史记录查看体验。

**依赖**：Phase 2 完成（不依赖其他 US）

**Independent Test**：访问历史列表页 (/history)，测试无限滚动加载，点击进入详情页 (/history/[sessionId])，验证手绘风格和功能。

### Tasks

- [X] T037 [P] [US4] 创建历史列表页 src/app/history/page.tsx 使用 PaperCard（简化装饰）
- [X] T038 [P] [US4] 为历史列表项实现手绘风格卡片（楷体文字，轻阴影）
- [X] T039 [P] [US4] 实现无限滚动加载（触发阈值 300px，节流 300ms，limit=20）
- [X] T040 [P] [US4] 为历史列表底部加载态实现手绘风格骨架屏（LoadingSkeleton）
- [X] T041 [US4] 创建历史详情页 src/app/history/[sessionId]/page.tsx 使用时间线纸张风格
- [X] T042 [US4] 验收：历史列表滚动加载正常，详情页展示完整，无重复项

**验收标准**：
- 历史列表默认时间倒序
- 列表项显示：时间、人生类型、分数（色阶/标签）、成就数量、时长
- 列表卡片装饰简化（仅轻阴影，无回形针等装饰）
- 滚动到距底部 300px 内触发加载
- 加载触发节流≥300ms
- API 超时≥10s 或错误时显示内嵌错误区块（ErrorBlock）
- 重试后沿用 lastCursor，无重复项（sessionId 去重）
- 详情页显示标题+摘要+逐步选择（含分数变化标签）
- 无数据时显示空状态（ErrorBlock 或自定义空状态）+ 引导 CTA

**Acceptance Scenarios**:
1. 访问历史页，看到按时间倒序的历史列表
2. 滚动到底部，自动加载下一批，1s 内完成渲染
3. 点击某条记录，进入详情页，看到完整的选择时间线

**Parallel Execution Example**:
```bash
Group 1: T037, T038, T039, T040 (可并行开发列表页不同功能)
Sequential: T041 → T042
```

---

## Phase 7: User Story 5 - 无障碍与键盘可用性 (Priority: P2)

**目标**：确保全站支持键盘导航、焦点可视、语义结构与对比度，动效可降级。

**依赖**：Phase 3-6 完成（跨所有页面）

**Independent Test**：使用仅键盘完成一局游戏；在"减少动态效果"开启时，验证动效替换为非运动反馈。

### Tasks

- [ ] T043 [P] [US5] 为所有交互元素添加 focus-visible 焦点环样式（手绘风格边框）
- [ ] T044 [P] [US5] 验证所有页面 Tab 键遍历顺序合理，可触发主要操作
- [ ] T045 [US5] 实现"减少动态效果"支持（prefers-reduced-motion: reduce）
- [ ] T046 [US5] 校验所有文本对比度≥4.5:1（WCAG AA）
- [ ] T047 [US5] 验收：仅用键盘完成首页→游戏主页→场景→结果全流程

**验收标准**：
- 所有可交互元素（按钮、卡片、链接）可通过 Tab 键访问
- 焦点环清晰可见（手绘风格边框，3px 宽，cartoon-blue 色）
- Enter/Space 可触发主要操作
- 系统设置"减少动态效果"时，位移动画替换为淡入淡出
- 分数变化使用数值瞬时更新，无过渡动画
- 所有文本对比度通过自动化校验（可使用 axe-core 或类似工具）
- 装饰性图标（回形针、标签纸）添加 aria-hidden="true"

**Acceptance Scenarios**:
1. 使用键盘导航，Tab 遍历，焦点顺序与视觉提示合理
2. Enter/Space 可触发主要操作
3. 系统设置减少动态，触发动效时使用淡入淡出

**Parallel Execution Example**:
```bash
Group 1: T043, T044 (可并行测试不同页面)
Sequential: T045 → T046 → T047
```

---

## Phase 8: Polish & Cross-Cutting Concerns（优化与完善）

**目标**：性能优化、字体子集化、纹理懒加载、响应式完善、全面测试。

**依赖**：Phase 3-7 完成（所有 User Story）

### Tasks

- [ ] T048 [P] 对站酷快乐体和霞鹜文楷进行字体子集化（常用 3000 汉字）
- [ ] T049 [P] 为纸张纹理图片实现懒加载（移动端不加载或使用轻量版本）
- [ ] T050 [P] 验证移动端响应式（360px/768px/1280px）字号、间距、装饰适配
- [ ] T051 验证首屏加载≤3s（使用 Lighthouse 或类似工具）
- [ ] T052 运行完整端到端测试覆盖所有 User Story 流程
- [ ] T053 生成实施报告总结所有改动、验收结果和性能数据

**验收标准**：
- 字体文件大小减少至 ~500KB 以下（每个字体）
- 字体加载使用 font-display: swap，不阻塞渲染
- 移动端（<768px）不加载纸张纹理或使用 50KB 轻量版本
- 移动端字号≥16px（正文）、≥24px（h1 标题）
- 桌面端纹理正常显示
- Lighthouse 性能评分≥90
- 所有 User Story 的 Acceptance Scenarios 通过测试

**Parallel Execution Example**:
```bash
Group 1: T048, T049, T050 (可并行优化不同方面)
Sequential: T051 → T052 → T053
```

---

## Dependency Graph（User Story 完成顺序）

```text
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← 所有 User Story 的前置依赖
    ↓
    ├─→ US1 (Phase 3) ← MVP，优先完成
    ├─→ US2 (Phase 4) ← 可与 US1 并行
    ├─→ US3 (Phase 5) ← 可与 US1/US2 并行
    └─→ US4 (Phase 6) ← 可与 US1/US2/US3 并行
         ↓
    US5 (Phase 7) ← 依赖所有页面完成
         ↓
    Polish (Phase 8) ← 最终优化与测试
```

**关键路径**：Setup → Foundational → US1 → US5 → Polish（最短 15 天）

**建议顺序**：
1. **Sprint 1（Week 1）**：Phase 1 + Phase 2（Setup + 组件库）
2. **Sprint 2（Week 2）**：Phase 3 (US1) + Phase 4 (US2)（MVP 核心流程）
3. **Sprint 3（Week 3）**：Phase 5 (US3) + Phase 6 (US4)（扩展功能）
4. **Sprint 4（Week 4）**：Phase 7 (US5)（无障碍）
5. **Sprint 5（Week 5）**：Phase 8（优化与测试）

---

## Parallel Execution Opportunities

### 高并行度阶段
- **Phase 2（Foundational）**：6/9 任务可并行（组件库建设）
- **Phase 3-6（User Stories）**：不同 US 可完全并行开发

### 建议并行策略
```text
Week 1: 
  - Developer A: Setup (T001-T008)
  - Developer B: Foundational 组件 1-3 (T010-T012)
  - Developer C: Foundational 组件 4-6 (T013-T015)

Week 2:
  - Developer A: US1 首页改造 (T018-T020)
  - Developer B: US1 游戏主页改造 (T021-T023)
  - Developer C: US2 场景交互 (T024-T027)

Week 3:
  - Developer A: US3 结果页 (T031-T033)
  - Developer B: US3 分享页 (T034-T036)
  - Developer C: US4 历史列表 (T037-T040)
```

---

## MVP Scope（最小可行产品）

**定义**：User Story 1 (Phase 3) 构成 MVP

**包含**：
- 手绘卡通风格首页（纸张背景、手写体标题、卡通按钮）
- 手绘卡通风格游戏主页（人生类型选择卡片）
- 基础组件库（CartoonButton、PaperCard、装饰元素）

**MVP 验收**：
- 首页到游戏主页流程完整
- 手绘卡通风格视觉呈现清晰
- 转化率提升≥25%（对比旧版）

**预计时间**：10 天（Phase 1 + Phase 2 + Phase 3）

---

## Task Format Validation

✅ 所有任务遵循标准格式：`- [ ] [ID] [P?] [Story?] Description with file path`

**格式说明**：
- `[ID]`：任务唯一标识（T001-T053）
- `[P]`：可并行执行标记（33/53 任务可并行）
- `[Story]`：User Story 标签（US1-US5）
- 描述包含具体文件路径

---

**Tasks Generated**: 2025-10-27  
**Total Tasks**: 53  
**Parallelizable**: 33 (62%)  
**Estimated Duration**: 25 working days (5 weeks)  
**Status**: ✅ Ready for Implementation
