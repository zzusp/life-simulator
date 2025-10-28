# Implementation Plan: 003-ai-life-summary

**Branch**: `feature/003-ai-life-summary` | **Date**: 2025-10-28 | **Spec**: `D:\project\life-simulator\specs\003-ai-life-summary\spec.md`
**Input**: Feature specification from `/specs/003-ai-life-summary/spec.md`

## Summary

在结算页为完成的游戏会话生成并展示 AI 个性化人生总结：
- 首次进入结算页实时生成（展示加载态），并写入数据库 `ai_summaries`（与 `game_sessions` 一对一）
- 再次查看直接返回缓存文本
- 文本 200–400 汉字，积极温暖风格；不同结局呈现差异化
- 失败走降级模板但仍写库，保证始终可见

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 15 (App Router), Supabase (PostgreSQL), OpenAI API  
**Storage**: Supabase Postgres (`ai_summaries` with RLS; server-only write)  
**Testing**: Jest + Playwright（契约/集成）  
**Target Platform**: Web（Next.js）  
**Project Type**: Web 单体（前后端同仓）  
**Performance Goals**: 总结生成 ≤5s p95；再访命中缓存 ≥95%  
**Constraints**: 结果页 UI 不改动结构，仅替换描述区域；匿名会话  
**Scale/Scope**: 每日 ≤1k 次生成（示意）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

From `.specify/memory/constitution.md`:
- Next.js 优先架构：✅ 满足（App Router + API Routes）
- 数据安全与合规：
  - AI Key 不暴露：✅ 仅服务端调用
  - RLS：✅ 开启，写操作仅 Service Role
  - 用户输入审查：⚠️ 本功能不接收用户自由文本，属于 AI 输出；保留提示词约束与最小化处理
- 性能与可扩展性：
  - API 响应 ≤2s：⚠️ 生成接口可能超过（AI 调用）。以加载态与降级兜底，并在复杂度跟踪中备案
  - 缓存：✅ 首次生成写库，后续命中缓存
- 代码质量与一致性：✅ TypeScript + 测试

结论：存在 1 项性能门禁潜在违反（AI 响应超 2s），已在“Complexity Tracking”备案与缓解。

## Project Structure

```text
src/
├── app/
│   └── api/
│       └── game/
│           └── summary/         # 新API实现位置（计划）
├── components/
│   └── game/
│       └── GameResult.tsx       # 替换描述区域为AI总结
├── lib/
│   └── ai.ts                    # 复用AI客户端，新增summary方法
└── types/
    └── game.ts                  # 如需新增类型（可选）

specs/003-ai-life-summary/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── summary-api.yaml
```

**Structure Decision**: 单体仓库中新增 API 与最小 UI 变更；文档与契约位于 003-ai-life-summary 目录。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| API ≤2s 门禁 | AI 调用不稳定且通常>2s | 预生成存在时序风险；用户选择B实时生成；用加载态与缓存缓解 |

## Phase 0: Outline & Research

Output: `research.md`（已生成）。

## Phase 1: Design & Contracts

Outputs：
- `data-model.md`：定义 `ai_summaries`（一对一、RLS、唯一约束）
- `contracts/summary-api.yaml`：`POST /api/game/summary`
- `quickstart.md`：实施步骤与注意事项

Agent Context 更新：使用脚本更新 cursor-agent（仅添加与本功能相关的新技术/约束）。
