# Implementation Plan: 人生模拟器游戏

**Branch**: `001-life-simulator-game` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-life-simulator-game/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

构建一款基于AI的"人生模拟器"游戏，支持多种人生类型（创业、修真、穿越等），通过AI生成情节节点和选项，实现匿名游戏体验。技术栈采用Node.js + React (Vite) + Supabase，支持容器化部署和CI/CD。

## Technical Context

**Language/Version**: Node.js 20.x (LTS), TypeScript 5.x, React 18.x, Vite 5.x  
**Primary Dependencies**: Next.js 15.x, Supabase, OpenAI API, Docker, GitHub Actions  
**Storage**: Supabase (PostgreSQL 15+) - 存储提示词、情节模板、玩家状态、审计日志、版本信息  
**Testing**: Jest, React Testing Library, Playwright, Vitest  
**Target Platform**: Web browsers (Chrome 90+, Firefox 88+, Safari 14+)  
**Project Type**: Web application - 前后端分离架构  
**Performance Goals**: 3秒内生成AI内容，支持100并发游戏会话，页面加载时间<2秒  
**Constraints**: AI API调用<2秒响应，内容审核<1秒，匿名游戏无用户数据收集  
**Scale/Scope**: 支持1000+并发用户，30+人生类型，每类型30+场景节点，容器化部署

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js 优先架构 ✅
- **要求**: 基于 Next.js 15.x 最新稳定版本，使用 App Router 架构
- **符合性**: 技术栈选择 Next.js 15.x，支持 SSR/SSG，TypeScript 类型检查
- **状态**: 通过

### II. 数据安全与合规 ✅
- **要求**: Supabase加密存储，AI API密钥保护，内容审核，审计日志，RLS策略
- **符合性**: 使用Supabase存储，API密钥后端管理，集成Moderator内容审核，匿名游戏保护隐私
- **状态**: 通过

### III. 性能与可扩展性 ✅
- **要求**: AI调用缓存，数据库优化，懒加载，图片优化，API响应<2秒
- **符合性**: 实现AI调用缓存机制，数据库索引优化，Next.js Image组件，性能目标明确
- **状态**: 通过

### IV. 代码质量与一致性 ✅
- **要求**: ESLint/Prettier规范，函数式编程，Zustand状态管理，async/await，错误处理
- **符合性**: 技术栈支持代码规范工具，React函数式组件，状态管理方案，错误处理机制
- **状态**: 通过

### V. 测试驱动开发 ✅
- **要求**: TDD强制要求，单元测试，集成测试，端到端测试
- **符合性**: 测试工具链完整（Jest, RTL, Playwright），支持TDD开发流程
- **状态**: 通过

**总体状态**: 所有宪法检查通过，可以进入Phase 0研究阶段

## Project Structure

### Documentation (this feature)

```text
specs/001-life-simulator-game/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-schema.yaml  # OpenAPI 3.0规范
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
life-simulator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (game)/            # 游戏页面组
│   │   │   ├── page.tsx       # 游戏首页
│   │   │   ├── play/[sessionId]/page.tsx
│   │   │   └── results/[sessionId]/page.tsx
│   │   ├── (admin)/           # 管理员页面组
│   │   │   ├── admin/page.tsx
│   │   │   ├── admin/life-types/
│   │   │   ├── admin/analytics/
│   │   │   └── login/page.tsx
│   │   ├── api/               # API路由
│   │   │   ├── game/
│   │   │   ├── admin/
│   │   │   └── ai/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/            # 可复用组件
│   │   ├── ui/                # 基础UI组件
│   │   ├── game/              # 游戏相关组件
│   │   └── admin/              # 管理员组件
│   ├── lib/                   # 工具库
│   │   ├── supabase.ts        # Supabase客户端
│   │   ├── ai.ts              # AI服务封装
│   │   ├── game-engine.ts     # 游戏引擎
│   │   ├── prompt-manager.ts  # 提示词管理
│   │   ├── scenario-engine.ts # 场景引擎
│   │   ├── scoring-engine.ts  # 评分引擎
│   │   ├── moderator.ts       # 内容审核
│   │   ├── analytics.ts       # 分析系统
│   │   └── utils.ts           # 工具函数
│   ├── types/                 # TypeScript类型定义
│   │   ├── game.ts
│   │   ├── api.ts
│   │   └── database.ts
│   └── hooks/                 # 自定义Hooks
│       ├── useGameSession.ts
│       ├── useAchievements.ts
│       └── useAI.ts
├── public/                    # 静态资源
├── tests/                     # 测试文件
│   ├── __mocks__/
│   ├── components/
│   ├── pages/
│   └── e2e/
├── docker/                    # Docker配置
├── .github/                   # GitHub Actions
├── docs/                      # 文档
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── Dockerfile
```

## 实施计划完成报告

**分支**: `001-life-simulator-game`  
**实施计划路径**: `specs/001-life-simulator-game/plan.md`  
**生成的设计文档**:

### Phase 0 研究完成 ✅
- **research.md**: 技术栈选型和架构设计研究
- **决策**: Next.js 15.x + Supabase + OpenAI API
- **理由**: 符合项目宪法要求，技术成熟，生态完善

### Phase 1 设计完成 ✅
- **data-model.md**: 完整的数据模型设计
- **contracts/api-schema.yaml**: OpenAPI 3.0 API规范
- **quickstart.md**: 开发者快速开始指南
- **项目结构**: 模块化单体架构，支持未来扩展

### 核心模块设计 ✅
1. **Prompt Manager**: AI提示词管理和版本控制
2. **Scenario Engine**: 游戏场景生成和处理
3. **Scoring Engine**: 规则化分数计算系统
4. **Moderator**: 内容审核和安全过滤
5. **Analytics**: 玩家行为分析和A/B测试

### 技术架构 ✅
- **前端**: Next.js 15.x + React 18.x + TypeScript 5.x
- **后端**: Node.js 20.x + Next.js API Routes
- **数据库**: Supabase (PostgreSQL 15+)
- **AI服务**: OpenAI API + 自定义Prompt管理
- **部署**: Docker + GitHub Actions CI/CD
- **测试**: Jest + RTL + Playwright

### 安全与合规 ✅
- **数据安全**: Supabase RLS策略，API密钥后端管理
- **内容审核**: OpenAI Moderator API集成
- **匿名游戏**: 无用户数据收集，会话级存储
- **审计日志**: 完整的操作记录和版本控制

### 性能优化 ✅
- **AI调用**: 智能缓存 + 批量处理
- **数据库**: 索引优化 + 查询优化
- **前端**: 代码分割 + 懒加载
- **部署**: 容器化 + CDN加速

**下一步建议**: 使用 `/speckit.tasks` 开始任务分解和开发计划制定。
