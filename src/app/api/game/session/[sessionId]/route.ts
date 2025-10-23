import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game-engine'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '会话ID不能为空' } },
        { status: 400 }
      )
    }

    // 获取游戏会话
    const gameSession = await gameEngine.getGameSession(sessionId)
    if (!gameSession) {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_NOT_FOUND', message: '游戏会话不存在' } },
        { status: 404 }
      )
    }

    // 获取当前场景
    const currentScene = await gameEngine.getCurrentScene(sessionId)
    if (!currentScene) {
      return NextResponse.json(
        { success: false, error: { code: 'SCENE_NOT_FOUND', message: '当前场景不存在' } },
        { status: 404 }
      )
    }

    // 获取人生类型信息
    const { data: lifeType, error: lifeTypeError } = await supabase
      .from('life_types')
      .select('*')
      .eq('id', gameSession.lifeTypeId)
      .single()

    if (lifeTypeError || !lifeType) {
      return NextResponse.json(
        { success: false, error: { code: 'LIFE_TYPE_NOT_FOUND', message: '人生类型不存在' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        gameSession,
        currentScene,
        lifeType
      }
    })
  } catch (error) {
    console.error('获取游戏会话失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    )
  }
}
