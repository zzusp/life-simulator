# Data Model: AI生成个性化人生总结

## Entities

### ai_summaries
- id: uuid (pk, default gen_random_uuid())
- session_id: uuid (fk → game_sessions.id, unique)
- life_type_id: uuid (冗余存储，便于统计，可选)
- summary_text: text (200–400 汉字，存储生成后的最终文本)
- model: text (如 "gpt-4.x")
- tokens_prompt: integer (可选)
- tokens_output: integer (可选)
- generated_at: timestamptz (默认 now())
- prompt_used: text (可选，便于审计/复现)
- cached: boolean (默认 true，表示当前文本可直接复用)
- regenerated_from_id: uuid (可选，用于未来版本化链条)

Constraints:
- UNIQUE(session_id) 保证一局最终一条记录（再生成时覆盖更新）
- 外键约束：session_id 引用 game_sessions(id)

Indexes:
- idx_ai_summaries_session_id (session_id)
- idx_ai_summaries_generated_at (generated_at)

RLS（行级安全）与权限建议：
- ENABLE RLS on ai_summaries
- Policy: 仅服务端 Service Role 可 INSERT/UPDATE/DELETE
- Policy: 读取通过应用 API 完成，不直接暴露 Supabase anon key 的 SELECT 权限

## Relationships

- game_sessions (1) — (1) ai_summaries（按 session_id 一对一）

## Validation Rules

- summary_text 长度应在 200–400 汉字（应用层保证）
- 同一 session_id 写入时应覆盖更新（UPSERT）
- 失败兜底：若生成失败，允许写入模板化总结并标记 cached=true
