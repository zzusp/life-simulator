import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game-engine'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge'

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

    // 获取当前场景（完成状态允许为空）
    const currentScene = await gameEngine.getCurrentScene(sessionId)
    if (!currentScene && gameSession.gameState !== 'completed') {
      return NextResponse.json(
        { success: false, error: { code: 'SCENE_NOT_FOUND', message: '当前场景不存在' } },
        { status: 404 }
      )
    }

    // 兜底修复：若推断应为结束状态但DB未标记，则自动修正
    let effectiveSession = gameSession
    if (gameSession.gameState !== 'completed') {
      const score = gameSession.currentScore
      const endedByVictory = score >= 100
      const endedByDefeat = score <= 0
      const endedByChoice = !!currentScene && currentScene.isEndingScene
      const endedByTimeout = !!currentScene && currentScene.sceneNumber >= 20

      let endingType: 'victory' | 'defeat' | 'timeout' | 'choice' | undefined
      let endReason: string | undefined

      if (endedByVictory) {
        endingType = 'victory'
        endReason = '恭喜！你的人生获得了巨大成功！'
      } else if (endedByDefeat) {
        endingType = 'defeat'
        endReason = '很遗憾，你的人生遇到了重大挫折...'
      } else if (endedByChoice) {
        endingType = 'choice'
        endReason = '你的人生走到了一个重要的转折点...'
      } else if (endedByTimeout) {
        endingType = 'timeout'
        endReason = '你的人生已经经历了足够多的选择，是时候总结一下了...'
      }

      if (endingType && endReason) {
        const completedAt = new Date().toISOString()
        await supabase
          .from('game_sessions')
          .update({
            game_state: 'completed',
            completed_at: completedAt,
            end_reason: endReason,
            ending_type: endingType
          })
          .eq('session_id', sessionId)

        effectiveSession = {
          ...gameSession,
          gameState: 'completed',
          completedAt,
          endReason,
          endingType
        }
      }
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
        gameSession: effectiveSession,
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
