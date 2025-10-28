# Research: AI生成个性化人生总结

**Feature**: 003-ai-life-summary  
**Date**: 2025-10-28  
**Context**: 在结算页实时生成并展示个性化人生总结，首次查看生成并缓存，后续查看复用；总结需存储到数据库并与游戏记录关联。

## Decisions

### 1) 生成时机
- Decision: 进入结算页时实时生成（展示加载态）；若已有缓存则直接返回
- Rationale: 避免后台时序问题；首次进入可能需要等待，但可控
- Alternatives: 后台预生成（有时序风险）；游戏中预生成（实现复杂）

### 2) Prompt 上下文范围
- Decision: 包含该局所有场景与选择（总场景数受玩法限制）
- Rationale: 场景数量有限，不必担心 token 超限；保证总结完整且个性化
- Alternatives: 仅取前 N 个关键节点；分段汇总再合成

### 3) 字数与风格
- Decision: 200–400 个汉字，积极温暖、鼓励式，避免负面词
- Rationale: 可读性与成本平衡，匹配人生模拟主题
- Alternatives: 150–300 或 300–500（前者信息不足，后者冗长）

### 4) 缓存与再访
- Decision: 首次完成生成并缓存；同一 session 后续查看直接返回缓存；支持可选强制再生（仅内部使用）
- Rationale: 降本、提速、体验一致
- Alternatives: 每次都重生（成本高且不一致）

### 5) 存储与关联
- Decision: 新增表 `ai_summaries`（或等价命名）存储总结，与 `game_sessions` 通过 `session_id` 一对一关联，`UNIQUE(session_id)`
- Rationale: 明确一局一份最终总结；可通过再生成覆盖更新
- Alternatives: 版本化多份总结（复杂度提高，暂不需要）

### 6) 安全与RLS
- Decision: 仅服务端（Service Role）可写入/更新；客户端通过应用 API 读取；数据库开启 RLS
- Rationale: 匿名会话，不暴露写权限；满足最小权限与合规
- Alternatives: 前端直连读取（增加泄露风险，弃用）

### 7) 性能与超时
- Decision: API 端设置 ≤5s 目标超时；失败走降级文案；记录日志
- Rationale: AI 不稳定性需兜底；与用户体验约束一致
- Alternatives: 更严格超时（易失败）；更宽松超时（体验变差）

## Best Practices

- Prompt 包含：人生类型、最终分数、选择次数、时长、按顺序列出各场景描述与所选项及分数变化
- 输出要求：仅返回纯文本总结，200–400 汉字，避免负面词
- 失败兜底：超时/错误/空响应 → 使用基于统计的模板化总结
- 观测性：记录模型、tokens、时长、是否命中缓存

## Open Questions (Resolved)

- 长局游戏上下文是否截断？→ 不截断（总场景有限）
- 何时生成？→ 进入结算页实时生成
- UI 放置位置？→ 替换现有结果描述区域
- 缓存策略？→ 首次生成并缓存，后续复用
- 字数怎么计算？→ 汉字计数，不含标点空格
