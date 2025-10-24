// 环境配置
export const config = {
  // API配置
  api: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    timeout: 30000, // 30秒超时
  },

  // AI配置
  ai: {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    maxTokens: 1000,
    temperature: 0.8,
    timeout: 30000,
  },

  // 游戏配置
  game: {
    maxScenes: 20,
    maxScore: 100,
    minScore: 0,
    defaultScore: 50,
    cacheSize: 100,
  },

  // 数据库配置
  database: {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 10000,
  },

  // 缓存配置
  cache: {
    ttl: 3600000, // 1小时
    maxSize: 100,
    cleanupInterval: 300000, // 5分钟
  },

  // 错误处理配置
  error: {
    maxRetries: 3,
    retryDelay: 1000,
    showDetails: process.env.NODE_ENV === 'development',
  },

  // 性能配置
  performance: {
    enableMetrics: process.env.NODE_ENV === 'development',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  }
}

// 环境检查
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

// 功能开关
export const features = {
  enableAI: !!process.env.OPENAI_API_KEY,
  enableCustomOpenAI: !!process.env.OPENAI_BASE_URL,
  enableSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  enableAnalytics: isProduction,
  enableErrorReporting: isProduction,
  enablePerformanceMonitoring: isProduction,
}

// 验证配置
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 检查必需的环境变量
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }

  if (!process.env.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is required')
  }

  // OPENAI_BASE_URL 是可选的，如果设置了需要验证格式
  if (process.env.OPENAI_BASE_URL) {
    try {
      new URL(process.env.OPENAI_BASE_URL)
    } catch {
      errors.push('OPENAI_BASE_URL must be a valid URL')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
