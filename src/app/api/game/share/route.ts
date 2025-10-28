import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSessionId } from '@/lib/utils'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '会话ID不能为空' } },
        { status: 400 }
      )
    }

    // 获取游戏会话信息
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select(`
        *,
        life_types(name, description),
        session_achievements(
          achievements(name, description, points)
        )
      `)
      .eq('session_id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_NOT_FOUND', message: '游戏会话不存在' } },
        { status: 404 }
      )
    }

    // 生成分享URL
    const shareId = generateSessionId()
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${shareId}`

    // 保存分享记录
    const { data: shareData, error: shareError } = await supabase
      .from('shared_results')
      .insert({
        session_id: session.id,
        share_url: shareUrl,
        share_id: shareId
      })
      .select()
      .single()

    if (shareError) {
      throw new Error('创建分享链接失败')
    }

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        shareId,
        gameSummary: {
          lifeType: session.life_types.name,
          finalScore: session.current_score,
          choicesMade: session.choices_made.length,
          achievements: session.session_achievements.map((sa: any) => ({
            name: sa.achievements.name,
            description: sa.achievements.description,
            points: sa.achievements.points
          })),
          duration: session.completed_at 
            ? new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()
            : 0
        }
      }
    })
  } catch (error) {
    console.error('创建分享链接失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    )
  }
}
