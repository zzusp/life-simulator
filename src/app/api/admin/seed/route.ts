import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sampleLifeTypes, sampleAchievements } from '@/lib/seed-data'

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

    // 清空现有数据
    await supabase.from('achievements').delete().neq('id', '')
    await supabase.from('life_types').delete().neq('id', '')

    // 插入人生类型数据
    const { data: lifeTypes, error: lifeTypesError } = await supabase
      .from('life_types')
      .insert(sampleLifeTypes)
      .select()

    if (lifeTypesError) {
      throw new Error(`插入人生类型失败: ${lifeTypesError.message}`)
    }

    // 插入成就数据
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .insert(sampleAchievements)
      .select()

    if (achievementsError) {
      throw new Error(`插入成就数据失败: ${achievementsError.message}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        lifeTypes: lifeTypes.length,
        achievements: achievements.length,
        message: '数据初始化成功'
      }
    })
  } catch (error) {
    console.error('数据初始化失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    )
  }
}
