# Life Simulator（AI 人生模拟器）

一个基于 Next.js 与 Supabase 的轻量人生模拟器：选择人生类型，AI 实时生成剧情与选项，分数系统决定你的结局。支持匿名游玩、分享结果与成就系统。

## 主要特性
- **AI 剧情生成**：结合 `OpenAI` API，按场景动态生成描述与 3-5 个选择。
- **分数与结局**：0-100 分制，分数变化驱动结局（胜利/失败/超时等）。
- **匿名会话**：无需登录即玩，RLS 保障数据安全。
- **成就系统**：按条件自动解锁与记录。
- **可分享结果**：生成分享令牌，查看已分享的结果。
- **易于扩展**：清晰的 `GameEngine` 设计，新增规则/类型容易。

## 技术栈
- 前端与服务端：`Next.js 15` + `React 18`
- 数据库与鉴权：`Supabase`（`@supabase/supabase-js`）
- AI 能力：`openai`（可自定义 `OPENAI_BASE_URL` 与 `OPENAI_MODEL`）
- 状态管理：`zustand`
- UI：Tailwind CSS + 组件封装（`src/components`）
- 测试：`Jest`、`@playwright/test`
- 部署：`Dockerfile`、`docker-compose.yml`

## 目录结构（关键）
```
src/
  app/
    api/
      game/           # 启动游戏、选择、会话、分享等接口
      life-types/     # 获取人生类型
      admin/
        clear-scenes/ # 管理端清理初始场景API（需 ADMIN_KEY）
    (game)/play/[sessionId]  # 游戏进行页
    game/                    # 选人生类型页
  components/                # UI 组件
  lib/                       # 核心库（AI、引擎、Supabase 客户端等）
  types/                     # 类型定义
supabase/migrations/         # 数据库 Schema（SQL）
```

## 环境变量
在本地创建 `.env.local`（开发）或使用部署平台的环境配置：
```
# Supabase（必需）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# 服务端仅用（建议仅服务端环境设置）
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI（必需）
OPENAI_API_KEY=
# 可选：自定义代理/兼容接口
OPENAI_BASE_URL=
# 可选：自定义模型（默认 gpt-3.5-turbo）
OPENAI_MODEL=
# 可选：Token（使用deepseek-free-api之类的转接服务时配置）
OPENAI_AUTH_TOKEN

# 管理接口密钥（用于 /api/admin/clear-scenes）
ADMIN_KEY=

# 可选（docker-compose 中示例）
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

> 注意：`SUPABASE_SERVICE_ROLE_KEY` 仅应在服务端使用；前端仅使用 `NEXT_PUBLIC_*` 变量。仓库中 `src/lib/supabase.ts` 已区分匿名与服务端客户端。

## 本地开发
1) 安装依赖
```bash
npm ci
```

2) 启动开发服务
```bash
npm run dev
# 访问 http://localhost:3000
```

3) 类型检查与格式化
```bash
npm run type-check
npm run format
npm run format:check
```

## 数据库（Supabase）
- 在 Supabase 项目中执行迁移文件：`supabase/migrations/001_initial_schema.sql`。
- 方式：
  - 直接复制到 Supabase SQL Editor 运行；或
  - 使用 Supabase CLI 应用迁移。

该 Schema 包含：`life_types`、`game_sessions`、`scene_nodes`、`player_choices`、`achievements`、`session_achievements`、`leaderboards`、`shared_results`、`ai_prompts`、`audit_logs` 等表，并开启了 RLS 与策略。

## 常用脚本
```bash
# 单元测试
npm test
# 端到端测试（Playwright）
npm run test:e2e
# Supabase 连接测试（简单JS/TS）
npm run test:supabase
npm run test:supabase:ts
# 构建与生产启动
npm run build && npm start
```

## API 一览（简）
- `POST /api/game/start`：开始新游戏（传入 `lifeTypeId`）。
- `POST /api/game/choice`：做出选择（传入 `sessionId`、`choiceIndex`）。
- `GET  /api/game/session/[sessionId]`：获取会话状态。
- `POST /api/game/share`：分享本局结果。
- `GET  /api/life-types`：获取可用人生类型。
- `POST /api/admin/clear-scenes`：清理 `scene_number=1` 的初始场景（需 `ADMIN_KEY`）。

## Docker 与部署
- 直接使用 `Dockerfile` 构建镜像，或通过 `docker-compose.yml` 启动：
```bash
docker build -t life-simulator .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e OPENAI_API_KEY=... \
  life-simulator
```

- `docker-compose.yml` 示例包含 `redis` 与 `nginx` 服务，可按需启用，并通过环境变量传入 Supabase 与 OpenAI 配置。

## 开发提示
- AI 相关配置在 `src/lib/ai.ts`；游戏引擎在 `src/lib/game-engine.ts`。
- 匿名模式下，服务端通过 RLS 控制读写，避免泄露数据。
- 如果需要重置初始场景，可使用管理接口 `POST /api/admin/clear-scenes` 并在请求体传入 `{ "adminKey": "..." }`。

---
如有问题或建议，欢迎提交 Issue 或 PR。
