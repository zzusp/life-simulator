'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ErrorBlock from '@/components/common/ErrorBlock'
import { getScoreColor, getScoreLabel, formatDuration } from '@/lib/utils'

interface HistoryItem {
  id: string
  lifeType: string
  finalScore: number
  choicesMade: number
  completedAt: string
  duration: number
}

export default function HistoryPage() {
  const router = useRouter()
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)
  
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading])

  const loadHistory = async (pageNum: number = 0) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('game_sessions')
        .select(`
          id,
          current_score,
          choices_made,
          started_at,
          completed_at,
          life_types(name)
        `)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1)

      if (queryError) throw queryError

      const items: HistoryItem[] = (data || []).map((session: any) => ({
        id: session.id,
        lifeType: session.life_types?.name || '未知类型',
        finalScore: session.current_score,
        choicesMade: session.choices_made?.length || 0,
        completedAt: session.completed_at,
        duration: session.completed_at 
          ? new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()
          : 0
      }))

      if (pageNum === 0) {
        setHistoryItems(items)
      } else {
        setHistoryItems(prev => [...prev, ...items])
      }

      setHasMore(items.length === ITEMS_PER_PAGE)
      setPage(pageNum)
    } catch (error) {
      console.error('加载历史失败:', error)
      setError(error instanceof Error ? error.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return
    loadHistory(page + 1)
  }, [page, hasMore, isLoading])

  const handleItemClick = (sessionId: string) => {
    router.push(`/history/${sessionId}`)
  }

  const handleRetry = () => {
    setPage(0)
    setHistoryItems([])
    setHasMore(true)
    loadHistory(0)
  }

  if (isLoading && historyItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">加载历史记录中...</p>
        </div>
      </div>
    )
  }

  if (error && historyItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <ErrorBlock
              title="加载失败"
              description={error}
              onRetry={handleRetry}
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
              游戏历史
            </h1>
            <p className="text-lg text-gray-600">
              查看你的所有游戏记录
            </p>
          </div>

          {/* 空状态 */}
          {historyItems.length === 0 && !isLoading && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                暂无游戏记录
              </h2>
              <p className="text-gray-600 mb-6">
                开始你的第一个游戏，体验不同的人生选择
              </p>
              <button
                onClick={() => router.push('/game')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-standard"
              >
                开始游戏
              </button>
            </div>
          )}

          {/* 历史记录列表 */}
          {historyItems.length > 0 && (
            <div className="space-y-4">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`查看游戏记录：${item.lifeType}`}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-standard focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                  onClick={() => handleItemClick(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleItemClick(item.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {item.lifeType}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>完成时间: {new Date(item.completedAt).toLocaleString('zh-CN')}</span>
                        <span>•</span>
                        <span>游戏时长: {formatDuration(Math.floor(item.duration / 1000))}</span>
                        <span>•</span>
                        <span>选择次数: {item.choicesMade}</span>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className={`text-3xl font-bold ${getScoreColor(item.finalScore)}`}>
                        {item.finalScore}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {getScoreLabel(item.finalScore)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 加载更多指示器 */}
              {hasMore && (
                <div ref={observerTarget} className="py-8 text-center">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-600">加载更多...</span>
                    </div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="px-6 py-2 text-blue-600 hover:text-blue-700 transition-standard"
                    >
                      点击加载更多
                    </button>
                  )}
                </div>
              )}

              {/* 到底提示 */}
              {!hasMore && historyItems.length > 0 && (
                <div className="py-8 text-center text-gray-500 text-sm">
                  已显示全部记录
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

