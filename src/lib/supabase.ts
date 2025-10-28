import { createClient } from '@supabase/supabase-js'

// 确保在客户端和服务器端都正确读取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// 调试输出（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase配置:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey && supabaseAnonKey !== 'placeholder-anon-key'
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端客户端（使用服务角色密钥）
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 警告：如果服务端密钥未配置，使用匿名密钥
if (!serviceRoleKey && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY未配置，将使用匿名密钥作为fallback')
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || supabaseAnonKey, // 如果服务端密钥未配置，使用匿名密钥
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
