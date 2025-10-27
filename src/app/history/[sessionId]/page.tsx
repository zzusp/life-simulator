'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ErrorBlock from '@/components/common/ErrorBlock'
import { getScoreColor, getScoreLabel, formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ChoiceDetail {
  sceneNumber: number
  sceneTitle: string
  sceneDescription: string
  choiceText: string
  reasoningSummary: string
  scoreImpact: number
  scoreAfter: number
}

interface HistoryDetail {
  id: string
  lifeType: string
  lifeTypeDescription: string
  initialIdentity: string
  mainGoals: string[]
  finalScore: number
  choicesMade: number
  startedAt: string
  completedAt: string
  duration: number
  choices: ChoiceDetail[]
}

export default function HistoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  const [detail, setDetail] = useState<HistoryDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDetail()
  }, [sessionId])

  const loadDetail = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select(`
          id,
          current_score,
          choices_made,
          started_at,
          completed_at,
          life_types(name, description, initial_identity, main_goals)
        `)
        .eq('id', sessionId)
        .single()

      if (sessionError || !session) {
        throw new Error('游戏记录不存在')
      }

      // 构建选择详情
      const choices: ChoiceDetail[] = (session.choices_made || []).map((choice: any, index: number) => {
        // 计算累积分数
        const scoreAfter = 50 + (session.choices_made || [])
          .slice(0, index + 1)
          .reduce((sum: number, c: any) => sum + (c.scoreImpact || 0), 0)
        
        return {
          sceneNumber: choice.sceneNumber || index + 1,
          sceneTitle: choice.sceneTitle || `场景 ${index + 1}`,
          sceneDescription: choice.sceneDescription || '',
          choiceText: choice.choiceText || '',
          reasoningSummary: choice.reasoningSummary || '',
          scoreImpact: choice.scoreImpact || 0,
          scoreAfter
        }
      })

      const historyDetail: HistoryDetail = {
        id: session.id,
        lifeType: session.life_types?.name || '未知类型',
        lifeTypeDescription: session.life_types?.description || '',
        initialIdentity: session.life_types?.initial_identity || '',
        mainGoals: session.life_types?.main_goals || [],
        finalScore: session.current_score,
        choicesMade: session.choices_made?.length || 0,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        duration: session.completed_at 
          ? new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()
          : 0,
        choices
      }

      setDetail(historyDetail)
    } catch (error) {
      console.error('加载游戏详情失败:', error)
      setError(error instanceof Error ? error.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">加载游戏详情中...</p>
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <ErrorBlock
              title="加载失败"
              description={error || '游戏记录不存在'}
              onRetry={loadDetail}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 返回按钮 */}
          <div>
            <Button
              variant="outline"
              onClick={() => router.push('/history')}
              className="mb-4"
            >
              ← 返回历史列表
            </Button>
          </div>

          {/* 游戏标题与摘要 */}
          <div className="bg-white rounded-lg shadow-lg p-8 transition-standard">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {detail.lifeType}
            </h1>
            <p className="text-gray-600 mb-6">
              {detail.lifeTypeDescription}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <div className={`text-3xl font-bold ${getScoreColor(detail.finalScore)}`}>
                  {detail.finalScore}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  最终分数 ({getScoreLabel(detail.finalScore)})
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <div className="text-3xl font-bold text-gray-900">
                  {detail.choicesMade}
                </div>
                <div className="text-sm text-gray-500 mt-1">做出选择</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <div className="text-3xl font-bold text-gray-900">
                  {formatDuration(Math.floor(detail.duration / 1000))}
                </div>
                <div className="text-sm text-gray-500 mt-1">游戏时长</div>
              </div>
            </div>
          </div>

          {/* 人生类型信息 */}
          <div className="bg-white rounded-lg shadow-lg p-6 transition-standard">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              人生设定
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">初始身份</h3>
                <p className="text-sm text-gray-600">{detail.initialIdentity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">主要目标</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {detail.mainGoals.map((goal, index) => (
                    <li key={index}>• {goal}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 逐步选择历史 */}
          <div className="bg-white rounded-lg shadow-lg p-6 transition-standard">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              选择历程
            </h2>
            <div className="space-y-6">
              {detail.choices.map((choice, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-6 pb-6 relative">
                  {/* 场景编号标记 */}
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {choice.sceneNumber}
                  </div>
                  
                  {/* 场景信息 */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {choice.sceneTitle}
                    </h3>
                    {choice.sceneDescription && (
                      <p className="text-sm text-gray-600 mb-3">
                        {choice.sceneDescription}
                      </p>
                    )}
                  </div>

                  {/* 选择内容 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          你的选择：{choice.choiceText}
                        </div>
                        {choice.reasoningSummary && (
                          <div className="text-sm text-gray-600">
                            {choice.reasoningSummary}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <div className={`text-lg font-bold ${
                          choice.scoreImpact > 0 ? 'text-green-600' : 
                          choice.scoreImpact < 0 ? 'text-red-600' : 
                          'text-gray-500'
                        }`}>
                          {choice.scoreImpact > 0 ? '+' : ''}{choice.scoreImpact}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          分数: {choice.scoreAfter}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/game')} className="px-8 py-3">
              再来一局
            </Button>
            <Button onClick={() => router.push('/history')} variant="outline" className="px-8 py-3">
              返回历史列表
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

