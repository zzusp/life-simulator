-- AI个性化人生总结 表迁移
-- 创建时间: 2025-10-28

-- 依赖扩展（初始迁移已启用 uuid-ossp/pgcrypto）

-- 为 game_sessions 增加结束原因与类型字段（向后兼容，可重复执行）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='game_sessions' AND column_name='end_reason'
    ) THEN
        ALTER TABLE game_sessions ADD COLUMN end_reason TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='game_sessions' AND column_name='ending_type'
    ) THEN
        ALTER TABLE game_sessions ADD COLUMN ending_type VARCHAR(20) CHECK (ending_type IN ('victory','defeat','timeout','choice'));
    END IF;
END $$;

-- 创建 ai_summaries 表
CREATE TABLE IF NOT EXISTS ai_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    life_type_id UUID REFERENCES life_types(id) ON DELETE SET NULL,
    summary_text TEXT NOT NULL,
    model TEXT,
    tokens_prompt INTEGER,
    tokens_output INTEGER,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    prompt_used TEXT,
    cached BOOLEAN DEFAULT TRUE,
    regenerated_from_id UUID
);

-- 约束：一局一条总结
ALTER TABLE ai_summaries
    ADD CONSTRAINT ai_summaries_session_unique UNIQUE (session_id);

-- 自引用外键（可选，用于未来版本链）
ALTER TABLE ai_summaries
    ADD CONSTRAINT ai_summaries_regenerated_from_fk
    FOREIGN KEY (regenerated_from_id) REFERENCES ai_summaries(id) ON DELETE SET NULL;

-- 索引
CREATE INDEX IF NOT EXISTS idx_ai_summaries_session_id ON ai_summaries(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_generated_at ON ai_summaries(generated_at);

-- 行级安全
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

-- RLS 策略：默认仅允许读取；写入需服务端权限
CREATE POLICY ai_summaries_select_policy ON ai_summaries FOR SELECT USING (true);
CREATE POLICY ai_summaries_insert_policy ON ai_summaries FOR INSERT WITH CHECK (true);
CREATE POLICY ai_summaries_update_policy ON ai_summaries FOR UPDATE USING (true);
CREATE POLICY ai_summaries_delete_policy ON ai_summaries FOR DELETE USING (false);
