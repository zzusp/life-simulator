import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game-engine'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { lifeTypeId } = await request.json()

    if (!lifeTypeId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '人生类型ID不能为空' } },
        { status: 400 }
      )
    }

    // 开始新游戏
    const gameSession = await gameEngine.startGame(lifeTypeId)
    
    // 获取初始场景
    const initialScene = await gameEngine.getCurrentScene(gameSession.sessionId)

    if (!initialScene) {
      return NextResponse.json(
        { success: false, error: { code: 'SCENE_ERROR', message: '获取初始场景失败' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: gameSession.sessionId,
        gameSession,
        initialScene
      }
    })
  } catch (error) {
    console.error('开始游戏失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    )
  }
}
