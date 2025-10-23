import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game-engine'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, choiceIndex } = await request.json()

    if (!sessionId || choiceIndex === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '会话ID和选择索引不能为空' } },
        { status: 400 }
      )
    }

    // 处理玩家选择
    const result = await gameEngine.makeChoice(sessionId, choiceIndex)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('处理玩家选择失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    )
  }
}
