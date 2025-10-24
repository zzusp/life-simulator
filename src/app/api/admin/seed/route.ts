import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // 检查管理员权限（这里简化处理，实际应该验证管理员身份）
    const { adminKey } = await request.json()
    
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '无权限执行此操作' } },
        { status: 401 }
      )
    }

    // 检查数据库连接状态
    const { data: healthCheck, error: healthError } = await supabase
      .from('life_types')
      .select('count')
      .limit(1)

    if (healthError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DATABASE_ERROR', 
            message: '数据库连接失败' 
          } 
        },
        { status: 500 }
      )
    }

    // 获取当前数据统计
    const { data: lifeTypes, error: lifeTypesError } = await supabase
      .from('life_types')
      .select('id, name, is_active')
      .order('created_at', { ascending: true })

    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('id, name, is_active')
      .order('created_at', { ascending: true })

    if (lifeTypesError || achievementsError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'QUERY_ERROR', 
            message: '查询数据失败' 
          } 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        databaseStatus: 'connected',
        lifeTypes: {
          total: lifeTypes?.length || 0,
          active: lifeTypes?.filter(lt => lt.is_active).length || 0,
          items: lifeTypes || []
        },
        achievements: {
          total: achievements?.length || 0,
          active: achievements?.filter(a => a.is_active).length || 0,
          items: achievements || []
        },
        message: '数据库状态正常，数据已从数据库迁移脚本初始化'
      }
    })
  } catch (error) {
    console.error('数据库状态检查失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: '服务器内部错误' 
        } 
      },
      { status: 500 }
    )
  }
}

// 添加GET方法用于检查数据库状态
export async function GET(request: NextRequest) {
  try {
    // 检查数据库连接状态
    const { data: lifeTypes, error: lifeTypesError } = await supabase
      .from('life_types')
      .select('id, name, is_active')
      .order('created_at', { ascending: true })

    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('id, name, is_active')
      .order('created_at', { ascending: true })

    if (lifeTypesError || achievementsError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DATABASE_ERROR', 
            message: '数据库连接失败' 
          } 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        databaseStatus: 'connected',
        lifeTypes: {
          total: lifeTypes?.length || 0,
          active: lifeTypes?.filter(lt => lt.is_active).length || 0
        },
        achievements: {
          total: achievements?.length || 0,
          active: achievements?.filter(a => a.is_active).length || 0
        },
        message: '数据库连接正常'
      }
    })
  } catch (error) {
    console.error('数据库状态检查失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: '服务器内部错误' 
        } 
      },
      { status: 500 }
    )
  }
}