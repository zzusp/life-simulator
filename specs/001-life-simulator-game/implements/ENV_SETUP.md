# 环境变量配置指南

## 必需的环境变量

### Supabase配置
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### OpenAI配置
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
# OPENAI_BASE_URL=https://api.openai.com/v1  # 可选：自定义OpenAI API地址
```

## 可选的环境变量

### 应用配置
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

### 数据库配置（如果使用本地数据库）
```env
DATABASE_URL=your_database_url_here
```

## OPENAI_BASE_URL 使用场景

### 1. 使用官方OpenAI API（默认）
```env
# 不设置 OPENAI_BASE_URL 或设置为官方地址
OPENAI_BASE_URL=https://api.openai.com/v1
```

### 2. 使用OpenAI兼容的API服务
```env
# 使用其他OpenAI兼容的API服务
OPENAI_BASE_URL=https://api.anthropic.com/v1
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_BASE_URL=https://api.moonshot.cn/v1
```

### 3. 使用本地部署的模型
```env
# 使用本地部署的OpenAI兼容服务
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_BASE_URL=http://localhost:8000/v1
```

## 配置验证

应用启动时会自动验证环境变量配置：

- ✅ **必需变量检查**: 确保所有必需的环境变量都已设置
- ✅ **URL格式验证**: 如果设置了OPENAI_BASE_URL，会验证URL格式是否正确
- ✅ **功能开关**: 根据环境变量自动启用/禁用相应功能

## 功能开关

```typescript
// 自动检测的功能开关
features = {
  enableAI: !!process.env.OPENAI_API_KEY,           // AI功能是否启用
  enableCustomOpenAI: !!process.env.OPENAI_BASE_URL, // 是否使用自定义OpenAI API
  enableSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL, // 数据库功能是否启用
  // ... 其他功能开关
}
```

## 示例配置

### 开发环境
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-3.5-turbo
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 生产环境
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4
OPENAI_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
```

### 使用第三方API服务
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your-third-party-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_BASE_URL=https://api.anthropic.com/v1
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```
