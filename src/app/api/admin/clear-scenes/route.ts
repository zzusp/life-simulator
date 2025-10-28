import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // 检查管理员权限
    const { adminKey } = await request.json()
    
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '无权限执行此操作' } },
        { status: 401 }
      )
    }

    // 查询所有scene_number为1的场景
    const { data: scenes, error: queryError } = await supabaseAdmin
      .from('scene_nodes')
      .select('id, title, life_type_id, scene_number')
      .eq('scene_number', 1)
    
    if (queryError) {
      console.error('查询场景失败:', queryError)
      return NextResponse.json(
        { success: false, error: { code: 'QUERY_ERROR', message: '查询场景失败' } },
        { status: 500 }
      )
    }
    
    if (!scenes || scenes.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: '没有找到初始场景',
          deletedCount: 0
        }
      })
    }
    
    // 删除所有初始场景
    const { error: deleteError } = await supabaseAdmin
      .from('scene_nodes')
      .delete()
      .eq('scene_number', 1)
    
    if (deleteError) {
      console.error('删除场景失败:', deleteError)
      return NextResponse.json(
        { success: false, error: { code: 'DELETE_ERROR', message: '删除场景失败' } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        message: `成功删除了 ${scenes.length} 个初始场景`,
        deletedCount: scenes.length,
        deletedScenes: scenes.map(scene => ({
          id: scene.id,
          title: scene.title,
          lifeTypeId: scene.life_type_id
        }))
      }
    })
    
  } catch (error) {
    console.error('清理初始场景失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    )
  }
}

