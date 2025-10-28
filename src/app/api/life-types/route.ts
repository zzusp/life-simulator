import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // 从数据库获取人生类型数据
    const { data: lifeTypes, error } = await supabase
      .from('life_types')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('获取人生类型失败:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DATABASE_ERROR', 
            message: '获取人生类型数据失败' 
          } 
        },
        { status: 500 }
      )
    }

    if (!lifeTypes || lifeTypes.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'NO_DATA', 
            message: '没有可用的生命类型数据' 
          } 
        },
        { status: 404 }
      )
    }

    // 转换数据库字段名为前端期望的格式
    const transformedLifeTypes = lifeTypes.map(lifeType => ({
      id: lifeType.id,
      name: lifeType.name,
      description: lifeType.description,
      worldviewPrompt: lifeType.worldview_prompt,
      initialIdentity: lifeType.initial_identity,
      resources: lifeType.resources,
      constraints: lifeType.constraints,
      mainGoals: lifeType.main_goals || [], // 确保是数组
      isActive: lifeType.is_active,
      version: lifeType.version,
      createdAt: lifeType.created_at,
      updatedAt: lifeType.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: transformedLifeTypes
    })
  } catch (error) {
    console.error('获取人生类型失败:', error)
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