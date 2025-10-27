'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ErrorBlock from '@/components/common/ErrorBlock'

interface GameSummary {
  lifeType: string
  finalScore: number
  choicesMade: number
  achievements: Array<{
    name: string
    description: string
    points: number
  }>
  duration: number
}

export default function SharePage() {
  const params = useParams()
  const shareId = params.shareId as string
  
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGameSummary()
  }, [shareId])

  const loadGameSummary = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 获取分享信息
      const { data: shareData, error: shareError } = await supabase
        .from('shared_results')
        .select(`
          *,
          game_sessions(
            current_score,
            choices_made,
            started_at,
            completed_at,
            life_types(name, description),
            session_achievements(
              achievements(name, description, points)
            )
          )
        `)
        .eq('share_id', shareId)
        .single()

      if (shareError || !shareData) {
        throw new Error('分享链接不存在或已过期')
      }

      const session = shareData.game_sessions
      const summary: GameSummary = {
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

      setGameSummary(summary)
    } catch (error) {
      console.error('加载游戏总结失败:', error)
      setError(error instanceof Error ? error.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}分${seconds}秒`
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return '卓越'
    if (score >= 80) return '优秀'
    if (score >= 70) return '良好'
    if (score >= 60) return '及格'
    if (score >= 40) return '一般'
    return '需要努力'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <ErrorBlock
              title="加载失败"
              description={error}
              onRetry={loadGameSummary}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!gameSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <ErrorBlock
              title="游戏总结不存在"
              description="请检查分享链接是否正确"
              onRetry={loadGameSummary}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              人生模拟器 - 游戏总结
            </h1>
            <p className="text-lg text-gray-600">
              看看这个玩家的人生选择结果
            </p>
          </div>

          {/* 游戏总结卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 transition-standard" aria-label="游戏总结">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {gameSummary.lifeType}
              </h2>
              <div className={`text-4xl font-bold ${getScoreColor(gameSummary.finalScore)}`} aria-label="最终分数">
                {gameSummary.finalScore} 分
              </div>
              <div className="text-lg text-gray-600 mt-2" aria-label="分数评价标签">
                {getScoreLabel(gameSummary.finalScore)}
              </div>
            </div>

            {/* 游戏统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 rounded-lg bg-gray-50" aria-label="做出选择次数">
                <div className="text-3xl font-bold text-gray-900">
                  {gameSummary.choicesMade}
                </div>
                <div className="text-sm text-gray-500 mt-1">做出选择</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-gray-50" aria-label="解锁成就数量">
                <div className="text-3xl font-bold text-gray-900">
                  {gameSummary.achievements.length}
                </div>
                <div className="text-sm text-gray-500 mt-1">解锁成就</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-gray-50" aria-label="游戏时长">
                <div className="text-3xl font-bold text-gray-900">
                  {formatDuration(gameSummary.duration)}
                </div>
                <div className="text-sm text-gray-500 mt-1">游戏时长</div>
              </div>
            </div>

            {/* 成就列表 */}
            {gameSummary.achievements.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  解锁成就
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameSummary.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <div className="font-medium text-gray-900">{achievement.name}</div>
                        <div className="text-sm text-gray-500">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 分享按钮 */}
            <div className="text-center">
              <button
                onClick={() => window.open('/', '_blank')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-standard"
              >
                开始你的游戏
              </button>
            </div>
          </div>

          {/* 游戏介绍 */}
          <div className="bg-white rounded-lg shadow-lg p-6 transition-standard" aria-label="关于人生模拟器">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              关于人生模拟器
            </h3>
            <p className="text-gray-600 mb-4">
              人生模拟器是一款基于AI的互动游戏，让你体验不同的人生选择。
              每次选择都会影响你的分数，最终决定你的人生结局。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• 多种人生类型</div>
              <div>• AI智能生成</div>
              <div>• 分数系统</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
