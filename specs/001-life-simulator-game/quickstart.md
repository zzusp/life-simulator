# 人生模拟器游戏 - 快速开始指南

**Date**: 2024-12-19  
**Feature**: 人生模拟器游戏开发指南  
**Purpose**: 帮助开发者快速理解项目结构和开始开发

## 项目概述

人生模拟器游戏是一款基于AI的互动式人生体验游戏，玩家可以选择不同的人生类型（如创业人生、修真人生等），通过AI生成的情节节点和选项来体验不同的人生路径。

## 技术栈

- **前端**: Next.js 15.x + React 18.x + TypeScript 5.x + Vite 5.x
- **后端**: Node.js 20.x + Next.js API Routes
- **数据库**: Supabase (PostgreSQL 15+)
- **AI服务**: OpenAI API + 自定义Prompt管理
- **部署**: Docker + GitHub Actions
- **测试**: Jest + React Testing Library + Playwright

## 项目结构

```
life-simulator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (game)/            # 游戏页面组
│   │   │   ├── page.tsx       # 游戏首页
│   │   │   ├── play/
│   │   │   │   └── [sessionId]/
│   │   │   │       └── page.tsx
│   │   │   └── results/
│   │   │       └── [sessionId]/
│   │   │           └── page.tsx
│   │   ├── (admin)/           # 管理员页面组
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── life-types/
│   │   │   │   └── analytics/
│   │   │   └── login/
│   │   │       └── page.tsx
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

## 核心模块

### 1. Prompt Manager (提示词管理)

**位置**: `src/lib/prompt-manager.ts`

**功能**:
- 管理AI提示词模板
- 支持版本控制和A/B测试
- 动态变量替换
- 提示词缓存

**关键接口**:
```typescript
interface PromptManager {
  getPrompt(type: PromptType, variables: Record<string, any>): Promise<string>
  updatePrompt(id: string, content: string): Promise<void>
  getPromptVersion(id: string): Promise<number>
}
```

### 2. Scenario Engine (场景引擎)

**位置**: `src/lib/scenario-engine.ts`

**功能**:
- 接收玩家状态
- 构建AI提示词
- 调用AI服务
- 解析AI响应
- 计算分数变化
- 保存游戏状态

**关键接口**:
```typescript
interface ScenarioEngine {
  generateScene(sessionId: string, context: GameContext): Promise<SceneNode>
  processChoice(sessionId: string, choiceIndex: number): Promise<ChoiceResult>
  calculateScore(choice: Choice, currentScore: number): number
}
```

### 3. Scoring Engine (评分引擎)

**位置**: `src/lib/scoring-engine.ts`

**功能**:
- 规则化分数计算
- 支持权重配置
- 条件表达式支持
- 分数边界检查

**关键接口**:
```typescript
interface ScoringEngine {
  calculateScore(choice: Choice, context: ScoreContext): number
  validateScore(score: number): boolean
  getScoreImpact(choice: Choice): ScoreImpact
}
```

### 4. Moderator (内容审核) 【待实现】

> ⚠️ **状态**: 待办事项 - 当前已移除旧代码，未来可根据需要重新实现

**计划位置**: `src/lib/moderator.ts`

**计划功能**:
- 敏感内容检测
- 内容标签分类
- 自动过滤机制
- 审核日志记录

**TODO - 计划接口**:
```typescript
// TODO: 未来可实现内容审核功能
// interface Moderator {
//   checkContent(content: string): Promise<ModerationResult>
//   isContentSafe(result: ModerationResult): boolean
//   getContentTags(result: ModerationResult): string[]
// }
```

**实现建议**:
- 可选择集成第三方内容审核服务
- 或自建基于关键词的简单审核机制
- 当前游戏通过AI提示词控制内容质量

### 5. Analytics (分析系统)

**位置**: `src/lib/analytics.ts`

**功能**:
- 玩家轨迹分析
- A/B测试结果统计
- 游戏平衡性报告
- 性能指标监控

**关键接口**:
```typescript
interface Analytics {
  trackPlayerAction(sessionId: string, action: PlayerAction): Promise<void>
  getGameBalanceReport(lifeTypeId: string): Promise<BalanceReport>
  getABTestResults(testId: string): Promise<ABTestResult>
}
```

## 开发环境设置

### 1. 环境要求

- Node.js 20.x (LTS)
- npm 9.x 或 pnpm 8.x
- Docker Desktop (用于本地开发)
- Git

### 2. 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd life-simulator

# 安装依赖
npm install
# 或使用 pnpm
pnpm install
```

### 3. 环境变量配置

创建 `.env.local` 文件：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI服务配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo

# 应用配置
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# 开发配置
NODE_ENV=development
```

### 4. 数据库设置

```bash
# 使用Supabase CLI初始化数据库
npx supabase init
npx supabase start

# 运行数据库迁移
npx supabase db reset
```

### 5. 启动开发服务器

```bash
# 启动前端开发服务器
npm run dev

# 启动数据库（如果使用本地Supabase）
npx supabase start
```

## 开发工作流

### 1. 功能开发

```bash
# 创建新功能分支
git checkout -b feature/new-feature

# 开发功能
# ... 编写代码 ...

# 运行测试
npm run test
npm run test:e2e

# 提交代码
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 2. 代码规范

```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

### 3. 测试策略

```bash
# 单元测试
npm run test

# 集成测试
npm run test:integration

# 端到端测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

## 部署指南

### 1. Docker部署

```bash
# 构建Docker镜像
docker build -t life-simulator .

# 运行容器
docker run -p 3000:3000 life-simulator
```

### 2. 生产环境配置

```env
# 生产环境变量
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=production_service_role_key
OPENAI_API_KEY=production_openai_key
```

### 3. CI/CD配置

项目使用GitHub Actions进行自动化部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # 部署脚本
```

## 常见问题

### 1. 开发环境问题

**Q: 如何解决端口冲突？**
A: 修改 `package.json` 中的 `dev` 脚本，指定不同端口：
```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

**Q: 如何调试AI API调用？**
A: 在 `.env.local` 中设置 `DEBUG=ai:*` 启用调试日志。

### 2. 数据库问题

**Q: 如何重置数据库？**
A: 运行 `npx supabase db reset` 重置数据库。

**Q: 如何查看数据库日志？**
A: 运行 `npx supabase logs db` 查看数据库日志。

### 3. 性能问题

**Q: 如何优化AI响应时间？**
A: 启用AI响应缓存，在 `src/lib/ai.ts` 中配置缓存策略。

**Q: 如何优化数据库查询？**
A: 检查数据库索引，使用 `EXPLAIN` 分析查询计划。

## 贡献指南

### 1. 代码贡献

1. Fork项目仓库
2. 创建功能分支
3. 编写代码和测试
4. 提交Pull Request

### 2. 文档贡献

1. 更新相关文档
2. 添加代码注释
3. 编写使用示例

### 3. 问题报告

1. 使用GitHub Issues报告问题
2. 提供详细的错误信息
3. 包含复现步骤

## 联系信息

- 项目仓库: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 开发团队: dev@life-simulator.com

---

**注意**: 这是一个快速开始指南，详细的技术文档请参考项目中的其他文档文件。
