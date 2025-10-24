# 数据库创建指南

## 方案 1: 使用 Supabase 云服务（推荐）

### 1. 创建 Supabase 项目
1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账户
3. 点击 "New Project" 创建新项目
4. 选择组织，输入项目名称：`life-simulator`
5. 设置数据库密码（请记住这个密码）
6. 选择地区（建议选择离您最近的地区）
7. 点击 "Create new project"

### 2. 获取连接信息
项目创建完成后，在项目仪表板中：
1. 进入 "Settings" → "API"
2. 复制以下信息：
   - Project URL
   - anon public key
   - service_role secret key

### 3. 配置环境变量
在项目根目录创建 `.env.local` 文件：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# 应用配置
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 4. 执行数据库迁移
在 Supabase 项目仪表板中：
1. 进入 "SQL Editor"
2. 复制 `supabase/migrations/001_initial_schema.sql` 的内容
3. 粘贴到 SQL Editor 中
4. 点击 "Run" 执行

## 方案 2: 使用 Docker 本地 PostgreSQL

### 1. 创建 docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: life_simulator
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

### 2. 启动数据库
```bash
docker-compose up -d postgres
```

### 3. 执行迁移
```bash
docker exec -i life-simulator_postgres_1 psql -U postgres -d life_simulator < supabase/migrations/001_initial_schema.sql
```

## 方案 3: 使用 Supabase CLI

### 1. 安装 Supabase CLI
```bash
npm install -g supabase
```

### 2. 登录 Supabase
```bash
supabase login
```

### 3. 链接项目
```bash
supabase link --project-ref your-project-ref
```

### 4. 推送迁移
```bash
supabase db push
```

## 验证数据库创建

### 检查表是否创建成功
在 Supabase 仪表板的 "Table Editor" 中，您应该看到以下表：
- life_types
- game_sessions
- scene_nodes
- player_choices
- achievements
- session_achievements
- leaderboards
- shared_results
- ai_prompts
- audit_logs

### 检查初始数据
在 `life_types` 表中应该看到3条记录：
- 创业人生
- 修真人生
- 穿越古代人生

## 常见问题解决

### 1. 数组语法错误
如果遇到数组语法错误，确保使用 `ARRAY['value1', 'value2']` 而不是 `['value1', 'value2']`

### 2. 权限问题
确保 Supabase 项目的 RLS 策略正确配置

### 3. 连接问题
检查环境变量是否正确设置，特别是 URL 和密钥
