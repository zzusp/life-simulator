# Tasks: 003-ai-life-summary

Feature: AI生成个性化人生总结  
Branch: feature/003-ai-life-summary  
Spec: /specs/003-ai-life-summary/spec.md  
Plan: /specs/003-ai-life-summary/plan.md

## Phase 1 — Setup

- [ ] T001 Verify OpenAI key and config present in .env.local (OPENAI_API_KEY)  
- [ ] T002 Create API route folder structure at src/app/api/game/summary/  

## Phase 2 — Foundational

- [ ] T003 Confirm migration applied for ai_summaries table (supabase/migrations/002_ai_summaries.sql)  
- [ ] T004 Add DB access helper for ai_summaries UPSERT in src/lib/supabase.ts (server-side only)  

## Phase 3 — [US1] 查看AI生成的人生总结 (P1)

Goal: 玩家完成游戏后在结算页看到个性化总结（替换现有描述）。

Independent Test: 完成一局 → 进入结算页 → 显示生成的总结（200–400字），再访加载极快（命中缓存）。

- [ ] T005 [US1] Add summary prompt builder in src/lib/ai.ts (buildLifeSummaryPrompt)  
- [ ] T006 [US1] Add AI summary generator in src/lib/ai.ts (generateLifeSummary)  
- [ ] T007 [US1] Implement POST /api/game/summary in src/app/api/game/summary/route.ts  
- [ ] T008 [US1] In route.ts, load game session by UUID id (from body.sessionId) and verify game_state='completed'  
- [ ] T009 [US1] In route.ts, check ai_summaries by session_id; if exists and !regenerate return cached  
- [ ] T010 [US1] In route.ts, assemble full context (life type, final score, duration, all scenes & choices) from DB (game_sessions, scene_nodes optional, player_choices or session JSON)  
- [ ] T011 [US1] In route.ts, call generateLifeSummary and enforce 200–400汉字长度（超出截断、过短重试一次）  
- [ ] T012 [US1] In route.ts, UPSERT ai_summaries by session_id (uuid) with summary_text/model/tokens  
- [ ] T013 [US1] Replace result description area in src/components/game/GameResult.tsx to fetch and render summary  
- [ ] T014 [P] [US1] Show loading state while fetching summary in GameResult.tsx  
- [ ] T015 [P] [US1] Handle API error with fallback UI text（短提示 + 重试按钮） in GameResult.tsx  

## Phase 4 — [US2] 总结反映游戏历程 (P1)

Goal: 总结准确反映先后顺序、关键转折、分数趋势。

Independent Test: 10 局对比，总结均不同且与路径一致。

- [ ] T016 [US2] Ensure prompt includes ordered scenes/choices with score deltas in src/lib/ai.ts  
- [ ] T017 [P] [US2] Add risk profile detection (adventurous vs conservative) based on choices variance in route.ts  
- [ ] T018 [US2] Include key turning points heuristics (largest absolute score changes) in prompt  

## Phase 5 — [US3] 总结语言风格与质量 (P1)

Goal: 语言积极温暖、避免负面词、200–400汉字。

Independent Test: 抽样 50 份总结，风格与长度满足规范。

- [ ] T019 [US3] Strengthen prompt constraints to avoid negative vocabulary in src/lib/ai.ts  
- [ ] T020 [US3] Add chineseCharacterCount utility and length enforcement in src/lib/ai.ts  
- [ ] T021 [P] [US3] Add post-processing sanitizer (trim spaces, remove trailing punctuation noise) in src/lib/ai.ts  

## Phase 6 — [US4] 不同结局差异化总结 (P2)

Goal: 胜利/失败/超时/转折 采用不同基调与关键词。

Independent Test: 各结局生成风格显著不同且合理。

- [ ] T022 [US4] Adjust prompt tone by session.endingType in src/lib/ai.ts  
- [ ] T023 [P] [US4] Add outcome-specific lines (celebration, constructive reflection, journey richness) in prompt  

## Phase 7 — [US5] AI服务异常处理 (P2)

Goal: 超时/错误/空响应提供降级总结并写库。

Independent Test: 模拟失败 → 展示降级文本 → 仍有记录。

- [ ] T024 [US5] Implement timeout (≤5s target) with abort controller in route.ts  
- [ ] T025 [US5] Add fallback summary builder (based on lifeType, score, choices count) in src/lib/ai.ts  
- [ ] T026 [US5] Ensure fallback also UPSERTs ai_summaries with cached=true in route.ts  
- [ ] T027 [P] [US5] Add error logging (model, tokens, latency, error type) in route.ts  

## Final Phase — Polish & Cross-Cutting

- [ ] T028 Add OpenAPI doc link (specs/003-ai-life-summary/contracts/summary-api.yaml) to README.md  
- [ ] T029 Add implementation notes to specs/003-ai-life-summary/implements/IMPLEMENTATION_REPORT.md  
- [ ] T030 Verify RLS behavior (service role writes only) and document in implements/SECURITY_NOTES.md  

## Dependencies (Story Order)

1) US1 → 2) US2 → 3) US3 → 4) US4 → 5) US5  
（US4/US5 可与 US2/US3 局部并行，但发布需在 US1 完成后）

## Parallel Execution Examples

- T014 与 T015 可并行（独立前端文件）
- T017 与 T023 可并行（提示词增强与基调参数化）
- T021 与 T027 可并行（后处理与日志）

## Implementation Strategy

- MVP：完成 US1（T005–T015）。
- 增量：依次交付 US2、US3；最后 US4/US5。
