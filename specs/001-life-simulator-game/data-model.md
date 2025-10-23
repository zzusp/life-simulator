# Data Model: 人生模拟器游戏

**Date**: 2024-12-19  
**Feature**: 人生模拟器游戏数据模型设计  
**Purpose**: 定义系统核心数据结构和关系

## 核心实体

### 1. LifeType (人生类型)

**用途**: 定义不同的人生类型配置，如创业人生、修真人生等

**字段**:
- `id`: UUID (主键)
- `name`: VARCHAR(100) - 人生类型名称
- `description`: TEXT - 人生类型描述
- `worldview_prompt`: TEXT - 世界观提示词
- `initial_identity`: TEXT - 初始身份描述
- `resources`: JSONB - 初始资源配置
- `constraints`: JSONB - 限制条件
- `main_goals`: TEXT[] - 主要目标列表
- `is_active`: BOOLEAN - 是否启用
- `version`: INTEGER - 版本号
- `created_at`: TIMESTAMP - 创建时间
- `updated_at`: TIMESTAMP - 更新时间

**约束**:
- `name` 必须唯一
- `is_active` 默认为 true
- `version` 从 1 开始递增

### 2. GameSession (游戏会话)

**用途**: 存储匿名游戏会话状态

**字段**:
- `id`: UUID (主键)
- `session_id`: VARCHAR(255) - 会话标识符（匿名）
- `life_type_id`: UUID (外键) - 关联人生类型
- `current_score`: INTEGER - 当前分数 (0-100)
- `game_state`: ENUM - 游戏状态 (playing, completed, abandoned)
- `current_scene_id`: UUID - 当前场景ID
- `choices_made`: JSONB[] - 已做选择记录
- `achievements_unlocked`: UUID[] - 已解锁成就
- `started_at`: TIMESTAMP - 开始时间
- `last_activity_at`: TIMESTAMP - 最后活动时间
- `completed_at`: TIMESTAMP - 完成时间（可为空）

**约束**:
- `current_score` 范围 0-100
- `session_id` 必须唯一
- `game_state` 枚举值: 'playing', 'completed', 'abandoned'

### 3. SceneNode (情节节点)

**用途**: 存储游戏场景节点信息

**字段**:
- `id`: UUID (主键)
- `life_type_id`: UUID (外键) - 关联人生类型
- `scene_number`: INTEGER - 场景编号
- `title`: VARCHAR(200) - 场景标题
- `description`: TEXT - 场景描述
- `ai_generated_content`: TEXT - AI生成的内容
- `choices`: JSONB[] - 选项列表
- `next_scene_rules`: JSONB - 下一场景规则
- `is_ending_scene`: BOOLEAN - 是否为结局场景
- `version`: INTEGER - 版本号
- `created_at`: TIMESTAMP - 创建时间
- `updated_at`: TIMESTAMP - 更新时间

**约束**:
- `scene_number` 在同一人生类型中必须唯一
- `choices` 数组长度 3-5
- `is_ending_scene` 默认为 false

### 4. PlayerChoice (玩家选择)

**用途**: 记录玩家的具体选择

**字段**:
- `id`: UUID (主键)
- `session_id`: VARCHAR(255) - 会话标识符
- `scene_id`: UUID (外键) - 场景ID
- `choice_index`: INTEGER - 选择索引
- `choice_text`: TEXT - 选择文本
- `score_impact`: INTEGER - 分数影响
- `reasoning_summary`: TEXT - 理由摘要
- `ai_prompt_used`: TEXT - 使用的AI提示词
- `created_at`: TIMESTAMP - 选择时间

**约束**:
- `choice_index` 范围 0-4
- `score_impact` 范围 -50 到 +50

### 5. Achievement (成就)

**用途**: 定义游戏成就系统

**字段**:
- `id`: UUID (主键)
- `name`: VARCHAR(100) - 成就名称
- `description`: TEXT - 成就描述
- `icon_url`: VARCHAR(500) - 成就图标URL
- `unlock_conditions`: JSONB - 解锁条件
- `reward_type`: ENUM - 奖励类型
- `is_active`: BOOLEAN - 是否启用
- `created_at`: TIMESTAMP - 创建时间

**约束**:
- `name` 必须唯一
- `reward_type` 枚举值: 'badge', 'title', 'unlock_content'
- `is_active` 默认为 true

### 6. SessionAchievement (会话成就)

**用途**: 记录会话中解锁的成就

**字段**:
- `id`: UUID (主键)
- `session_id`: VARCHAR(255) - 会话标识符
- `achievement_id`: UUID (外键) - 成就ID
- `unlocked_at`: TIMESTAMP - 解锁时间
- `progress_data`: JSONB - 进度数据

**约束**:
- 同一会话同一成就只能解锁一次

### 7. Leaderboard (排行榜)

**用途**: 匿名排行榜数据

**字段**:
- `id`: UUID (主键)
- `life_type_id`: UUID (外键) - 人生类型ID
- `session_id`: VARCHAR(255) - 会话标识符
- `score`: INTEGER - 最高分数
- `rank`: INTEGER - 排名
- `game_duration`: INTEGER - 游戏时长（秒）
- `achievements_count`: INTEGER - 成就数量
- `updated_at`: TIMESTAMP - 更新时间

**约束**:
- `score` 范围 0-100
- `rank` 必须为正整数

### 8. SharedResult (分享结果)

**用途**: 存储分享的游戏结果

**字段**:
- `id`: UUID (主键)
- `session_id`: VARCHAR(255) - 会话标识符
- `share_token`: VARCHAR(100) - 分享令牌
- `share_content`: JSONB - 分享内容
- `view_count`: INTEGER - 查看次数
- `created_at`: TIMESTAMP - 创建时间
- `expires_at`: TIMESTAMP - 过期时间

**约束**:
- `share_token` 必须唯一
- `view_count` 默认为 0

### 9. AIPrompt (AI提示词)

**用途**: 管理AI提示词模板

**字段**:
- `id`: UUID (主键)
- `name`: VARCHAR(100) - 提示词名称
- `prompt_type`: ENUM - 提示词类型
- `content`: TEXT - 提示词内容
- `variables`: JSONB - 变量定义
- `version`: INTEGER - 版本号
- `is_active`: BOOLEAN - 是否启用
- `usage_count`: INTEGER - 使用次数
- `created_at`: TIMESTAMP - 创建时间
- `updated_at`: TIMESTAMP - 更新时间

**约束**:
- `name` 必须唯一
- `prompt_type` 枚举值: 'scene_generation', 'choice_generation', 'reasoning', 'moderation'
- `is_active` 默认为 true

### 10. AuditLog (审计日志)

**用途**: 记录系统操作日志

**字段**:
- `id`: UUID (主键)
- `action_type`: ENUM - 操作类型
- `entity_type`: VARCHAR(50) - 实体类型
- `entity_id`: UUID - 实体ID
- `old_values`: JSONB - 旧值
- `new_values`: JSONB - 新值
- `admin_user_id`: UUID - 管理员用户ID
- `ip_address`: INET - IP地址
- `user_agent`: TEXT - 用户代理
- `created_at`: TIMESTAMP - 操作时间

**约束**:
- `action_type` 枚举值: 'create', 'update', 'delete', 'view'
- 所有字段都不能为空

## 关系定义

### 一对多关系
- `LifeType` → `GameSession` (1:N)
- `LifeType` → `SceneNode` (1:N)
- `GameSession` → `PlayerChoice` (1:N)
- `Achievement` → `SessionAchievement` (1:N)
- `LifeType` → `Leaderboard` (1:N)

### 多对多关系
- `GameSession` ↔ `Achievement` (通过 SessionAchievement)

## 索引设计

### 主要索引
- `life_types.name` (唯一索引)
- `game_sessions.session_id` (唯一索引)
- `game_sessions.life_type_id` (外键索引)
- `scene_nodes.life_type_id` (外键索引)
- `player_choices.session_id` (外键索引)
- `leaderboards.life_type_id, score` (复合索引)
- `shared_results.share_token` (唯一索引)

### 性能索引
- `game_sessions.last_activity_at` (时间索引)
- `audit_logs.created_at` (时间索引)
- `ai_prompts.is_active, prompt_type` (复合索引)

## 数据验证规则

### 业务规则
1. 游戏分数必须在 0-100 范围内
2. 场景选择数量必须在 3-5 个之间
3. 成就解锁条件必须可验证
4. 分享令牌必须唯一且有时效性
5. AI提示词版本必须递增

### 数据完整性
1. 外键约束确保数据一致性
2. 检查约束确保数据有效性
3. 唯一约束防止重复数据
4. 非空约束确保必要数据存在

## 安全策略

### 行级安全策略 (RLS)
1. 匿名用户只能访问公开数据
2. 管理员可以访问所有数据
3. 会话数据只能被创建者访问
4. 审计日志只有管理员可访问

### 数据加密
1. 敏感字段使用Supabase加密
2. API密钥存储在环境变量中
3. 用户输入进行SQL注入防护
4. 输出数据进行XSS防护

## 扩展性考虑

### 水平扩展
1. 数据库读写分离
2. 缓存层分离
3. 静态资源CDN分发
4. 微服务架构预留

### 垂直扩展
1. 数据库连接池优化
2. 查询性能优化
3. 内存使用优化
4. CPU使用优化