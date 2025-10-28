-- 人生模拟器游戏数据库Schema
-- 创建时间: 2024-12-19

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建人生类型表
CREATE TABLE life_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    worldview_prompt TEXT NOT NULL,
    initial_identity TEXT NOT NULL,
    resources JSONB DEFAULT '{}',
    constraints JSONB DEFAULT '{}',
    main_goals TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建游戏会话表
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    life_type_id UUID NOT NULL REFERENCES life_types(id) ON DELETE CASCADE,
    current_score INTEGER DEFAULT 50 CHECK (current_score >= 0 AND current_score <= 100),
    game_state VARCHAR(20) DEFAULT 'playing' CHECK (game_state IN ('playing', 'completed', 'abandoned')),
    current_scene_id UUID,
    choices_made JSONB[] DEFAULT '{}',
    achievements_unlocked UUID[] DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建场景节点表
CREATE TABLE scene_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    life_type_id UUID NOT NULL REFERENCES life_types(id) ON DELETE CASCADE,
    scene_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    ai_generated_content TEXT NOT NULL,
    choices JSONB[] NOT NULL,
    next_scene_rules JSONB DEFAULT '{}',
    is_ending_scene BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(life_type_id, scene_number)
);

-- 创建玩家选择表
CREATE TABLE player_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    scene_id UUID NOT NULL REFERENCES scene_nodes(id) ON DELETE CASCADE,
    choice_index INTEGER NOT NULL CHECK (choice_index >= 0 AND choice_index <= 4),
    choice_text TEXT NOT NULL,
    score_impact INTEGER NOT NULL CHECK (score_impact >= -50 AND score_impact <= 50),
    reasoning_summary TEXT NOT NULL,
    ai_prompt_used TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建成就表
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_url VARCHAR(500),
    unlock_conditions JSONB NOT NULL,
    reward_type VARCHAR(20) DEFAULT 'badge' CHECK (reward_type IN ('badge', 'title', 'unlock_content')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建会话成就表
CREATE TABLE session_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB DEFAULT '{}',
    UNIQUE(session_id, achievement_id)
);

-- 创建排行榜表
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    life_type_id UUID NOT NULL REFERENCES life_types(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    rank INTEGER NOT NULL CHECK (rank > 0),
    game_duration INTEGER NOT NULL CHECK (game_duration >= 0),
    achievements_count INTEGER DEFAULT 0 CHECK (achievements_count >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建分享结果表
CREATE TABLE shared_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    share_token VARCHAR(100) NOT NULL UNIQUE,
    share_content JSONB NOT NULL,
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 创建AI提示词表
CREATE TABLE ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    prompt_type VARCHAR(20) NOT NULL CHECK (prompt_type IN ('scene_generation', 'choice_generation', 'reasoning', 'moderation')),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建审计日志表
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'view')),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    admin_user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_life_types_name ON life_types(name);
CREATE INDEX idx_life_types_active ON life_types(is_active);
CREATE INDEX idx_game_sessions_session_id ON game_sessions(session_id);
CREATE INDEX idx_game_sessions_life_type_id ON game_sessions(life_type_id);
CREATE INDEX idx_game_sessions_state ON game_sessions(game_state);
CREATE INDEX idx_game_sessions_last_activity ON game_sessions(last_activity_at);
CREATE INDEX idx_scene_nodes_life_type_id ON scene_nodes(life_type_id);
CREATE INDEX idx_scene_nodes_scene_number ON scene_nodes(life_type_id, scene_number);
CREATE INDEX idx_scene_nodes_ending ON scene_nodes(is_ending_scene);
CREATE INDEX idx_player_choices_session_id ON player_choices(session_id);
CREATE INDEX idx_player_choices_scene_id ON player_choices(scene_id);
CREATE INDEX idx_player_choices_created_at ON player_choices(created_at);
CREATE INDEX idx_achievements_active ON achievements(is_active);
CREATE INDEX idx_session_achievements_session_id ON session_achievements(session_id);
CREATE INDEX idx_leaderboards_life_type_id ON leaderboards(life_type_id);
CREATE INDEX idx_leaderboards_score ON leaderboards(life_type_id, score DESC);
CREATE INDEX idx_shared_results_token ON shared_results(share_token);
CREATE INDEX idx_shared_results_expires ON shared_results(expires_at);
CREATE INDEX idx_ai_prompts_type ON ai_prompts(prompt_type);
CREATE INDEX idx_ai_prompts_active ON ai_prompts(is_active);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间的表创建触发器
CREATE TRIGGER update_life_types_updated_at BEFORE UPDATE ON life_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scene_nodes_updated_at BEFORE UPDATE ON scene_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_prompts_updated_at BEFORE UPDATE ON ai_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建行级安全策略 (RLS)
ALTER TABLE life_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 人生类型：所有人可读，管理员可写
CREATE POLICY "life_types_select_policy" ON life_types FOR SELECT USING (true);
CREATE POLICY "life_types_insert_policy" ON life_types FOR INSERT WITH CHECK (false); -- 仅管理员
CREATE POLICY "life_types_update_policy" ON life_types FOR UPDATE USING (false); -- 仅管理员
CREATE POLICY "life_types_delete_policy" ON life_types FOR DELETE USING (false); -- 仅管理员

-- 游戏会话：匿名访问，基于session_id
CREATE POLICY "game_sessions_select_policy" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "game_sessions_insert_policy" ON game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "game_sessions_update_policy" ON game_sessions FOR UPDATE USING (true);
CREATE POLICY "game_sessions_delete_policy" ON game_sessions FOR DELETE USING (false);

-- 场景节点：所有人可读
CREATE POLICY "scene_nodes_select_policy" ON scene_nodes FOR SELECT USING (true);
CREATE POLICY "scene_nodes_insert_policy" ON scene_nodes FOR INSERT WITH CHECK (true); -- 允许匿名用户创建场景节点
CREATE POLICY "scene_nodes_update_policy" ON scene_nodes FOR UPDATE USING (true); -- 允许匿名用户更新场景节点
CREATE POLICY "scene_nodes_delete_policy" ON scene_nodes FOR DELETE USING (true); -- 允许匿名用户删除场景节点

-- 玩家选择：基于session_id访问
CREATE POLICY "player_choices_select_policy" ON player_choices FOR SELECT USING (true);
CREATE POLICY "player_choices_insert_policy" ON player_choices FOR INSERT WITH CHECK (true);
CREATE POLICY "player_choices_update_policy" ON player_choices FOR UPDATE USING (false);
CREATE POLICY "player_choices_delete_policy" ON player_choices FOR DELETE USING (false);

-- 成就：所有人可读
CREATE POLICY "achievements_select_policy" ON achievements FOR SELECT USING (true);
CREATE POLICY "achievements_insert_policy" ON achievements FOR INSERT WITH CHECK (false); -- 仅管理员
CREATE POLICY "achievements_update_policy" ON achievements FOR UPDATE USING (false); -- 仅管理员
CREATE POLICY "achievements_delete_policy" ON achievements FOR DELETE USING (false); -- 仅管理员

-- 会话成就：基于session_id访问
CREATE POLICY "session_achievements_select_policy" ON session_achievements FOR SELECT USING (true);
CREATE POLICY "session_achievements_insert_policy" ON session_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "session_achievements_update_policy" ON session_achievements FOR UPDATE USING (true);
CREATE POLICY "session_achievements_delete_policy" ON session_achievements FOR DELETE USING (false);

-- 排行榜：所有人可读
CREATE POLICY "leaderboards_select_policy" ON leaderboards FOR SELECT USING (true);
CREATE POLICY "leaderboards_insert_policy" ON leaderboards FOR INSERT WITH CHECK (true);
CREATE POLICY "leaderboards_update_policy" ON leaderboards FOR UPDATE USING (true);
CREATE POLICY "leaderboards_delete_policy" ON leaderboards FOR DELETE USING (false);

-- 分享结果：基于token访问
CREATE POLICY "shared_results_select_policy" ON shared_results FOR SELECT USING (true);
CREATE POLICY "shared_results_insert_policy" ON shared_results FOR INSERT WITH CHECK (true);
CREATE POLICY "shared_results_update_policy" ON shared_results FOR UPDATE USING (true);
CREATE POLICY "shared_results_delete_policy" ON shared_results FOR DELETE USING (false);

-- AI提示词：仅管理员访问
CREATE POLICY "ai_prompts_select_policy" ON ai_prompts FOR SELECT USING (false); -- 仅管理员
CREATE POLICY "ai_prompts_insert_policy" ON ai_prompts FOR INSERT WITH CHECK (false); -- 仅管理员
CREATE POLICY "ai_prompts_update_policy" ON ai_prompts FOR UPDATE USING (false); -- 仅管理员
CREATE POLICY "ai_prompts_delete_policy" ON ai_prompts FOR DELETE USING (false); -- 仅管理员

-- 审计日志：仅管理员访问
CREATE POLICY "audit_logs_select_policy" ON audit_logs FOR SELECT USING (false); -- 仅管理员
CREATE POLICY "audit_logs_insert_policy" ON audit_logs FOR INSERT WITH CHECK (false); -- 仅管理员
CREATE POLICY "audit_logs_update_policy" ON audit_logs FOR UPDATE USING (false); -- 仅管理员
CREATE POLICY "audit_logs_delete_policy" ON audit_logs FOR DELETE USING (false); -- 仅管理员

-- 插入初始数据
INSERT INTO life_types (name, description, worldview_prompt, initial_identity, resources, constraints, main_goals) VALUES
('创业人生', '体验从零开始的创业历程，面对各种挑战和机遇', '你是一个充满激情的创业者，拥有无限的想象力和执行力。', '你是一名刚毕业的大学生，怀揣着改变世界的梦想，准备开始你的创业之旅。', '{"资金": 10000, "人脉": 5, "技能": ["编程", "市场分析"]}', '{"时间": "5年", "风险": "高"}', ARRAY['获得第一笔投资', '建立稳定团队', '实现盈利']),
('修真人生', '踏上修仙之路，追求长生不老和超凡脱俗', '你是一个有灵根的凡人，踏上了修仙之路，追求长生不老和超凡脱俗。', '你是一个普通的山村少年，在一次意外中发现了自己的灵根，从此踏上了修仙之路。', '{"灵石": 100, "功法": "基础吐纳术", "法器": "无"}', '{"境界": "炼气期", "寿命": "100年"}', ARRAY['突破筑基期', '获得高级功法', '建立修仙门派']),
('穿越古代人生', '穿越到古代，体验不同的历史时期和文化', '你是一个现代人，意外穿越到了古代，需要适应古代的生活和文化。', '你是一个现代大学生，在一次意外中穿越到了古代，成为了一个普通的农家子弟。', '{"银两": 50, "知识": "现代知识", "物品": "无"}', '{"时代": "明朝", "身份": "平民"}', ARRAY['适应古代生活', '利用现代知识', '改变历史进程']);

-- 插入初始成就
INSERT INTO achievements (name, description, unlock_conditions, reward_type) VALUES
('初出茅庐', '完成第一次游戏', '{"type": "first_game"}', 'badge'),
('高分玩家', '单局游戏得分超过80分', '{"type": "high_score", "score": 80}', 'badge'),
('人生赢家', '单局游戏得分达到100分', '{"type": "perfect_score", "score": 100}', 'title'),
('多面手', '体验过3种不同的人生类型', '{"type": "multiple_life_types", "count": 3}', 'badge'),
('坚持不懈', '连续完成5局游戏', '{"type": "consecutive_games", "count": 5}', 'badge');

-- 插入初始AI提示词
INSERT INTO ai_prompts (name, prompt_type, content, variables) VALUES
('场景生成', 'scene_generation', '你是一个专业的游戏情节设计师。请根据以下信息生成一个游戏场景：\n\n人生类型：{lifeType}\n当前分数：{currentScore}\n场景编号：{sceneNumber}\n\n请生成一个符合主题的场景描述，包含3-5个选择选项。\n\n要求：\n- 场景描述：控制在150-300字以内\n- 每个选择选项：控制在20-50字以内，要具体、有意义\n- 选择选项应该反映真实的人生决策，给出具体的行动方案\n- 不要使用"继续前进"、"谨慎行事"、"大胆尝试"等通用词汇\n- 每个选项都应该有明确的行动描述，如"直接申请这个职位"、"先做兼职积累经验"等\n- 不要显示分值，让玩家根据具体情况判断\n- 确保内容简洁明了，便于玩家快速理解', '{"lifeType": "string", "currentScore": "number", "sceneNumber": "number"}'),
('选择生成', 'choice_generation', '你是一个专业的游戏设计师。请为以下场景生成选择选项：\n\n场景描述：{sceneDescription}\n当前分数：{currentScore}\n\n请生成3-5个选择选项。\n\n要求：\n- 每个选择选项：控制在20-50字以内，要具体、有意义\n- 选择选项应该反映真实的人生决策，给出具体的行动方案\n- 不要使用"继续前进"、"谨慎行事"、"大胆尝试"等通用词汇\n- 每个选项都应该有明确的行动描述，如"直接申请这个职位"、"先做兼职积累经验"等\n- 不要显示分值，让玩家根据具体情况判断\n- 确保选项简洁明了，便于玩家快速决策', '{"sceneDescription": "string", "currentScore": "number"}'),
('推理分析', 'reasoning', '你是一个专业的游戏分析师。请分析以下选择的影响：\n\n选择：{choice}\n当前分数：{currentScore}\n场景：{sceneDescription}\n\n请分析这个选择对游戏进程的影响，并给出分数变化的理由。\n\n字数限制：\n- 推理分析：控制在100-200字以内\n- 确保分析简洁有力，便于玩家理解选择的影响', '{"choice": "string", "currentScore": "number", "sceneDescription": "string"}'),
('内容审核', 'moderation', '请审核以下内容是否适合游戏使用：\n\n内容：{content}\n\n请检查是否包含不当内容，如暴力、色情、仇恨言论等。\n\n字数限制：\n- 审核结果：控制在50-100字以内\n- 确保审核意见简洁明确', '{"content": "string"}');
