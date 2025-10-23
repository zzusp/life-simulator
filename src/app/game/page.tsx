'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LifeTypeSelector } from '@/components/game/LifeTypeSelector'
import { LifeType } from '@/types/game'
import { useGameStore } from '@/lib/store'

export default function GameHomePage() {
  const router = useRouter()
  const [lifeTypes, setLifeTypes] = useState<LifeType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { startGame, setLoading, setError: setStoreError } = useGameStore()

  useEffect(() => {
    loadLifeTypes()
  }, [])

  const loadLifeTypes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/life-types')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error.message)
      }

      setLifeTypes(result.data)
    } catch (error) {
      console.error('加载人生类型失败:', error)
      setError(error instanceof Error ? error.message : '加载人生类型失败')
      setStoreError(error instanceof Error ? error.message : '加载人生类型失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLifeTypeSelect = async (lifeType: LifeType) => {
    try {
      setLoading(true)
      setError(null)

      // 开始新游戏
      startGame(lifeType)

      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lifeTypeId: lifeType.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error.message)
      }

      const { sessionId } = result.data
      
      // 跳转到游戏页面
      router.push(`/play/${sessionId}`)
      
    } catch (error) {
      console.error('开始游戏失败:', error)
      setError(error instanceof Error ? error.message : '开始游戏失败')
      setStoreError(error instanceof Error ? error.message : '开始游戏失败')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">加载人生类型中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadLifeTypes}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            人生模拟器
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            体验不同的人生，做出关键选择，看看你的选择会带你走向何方
          </p>
        </div>

        {/* 游戏介绍 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">选择人生类型</h3>
              <p className="text-gray-600 text-sm">
                从创业人生、修真人生、穿越古代人生等多种类型中选择
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI生成情节</h3>
              <p className="text-gray-600 text-sm">
                基于AI智能生成的情节节点和选择，每次都有不同的体验
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">分数系统</h3>
              <p className="text-gray-600 text-sm">
                0-100分系统，你的选择会影响分数，最终决定游戏结局
              </p>
            </div>
          </div>
        </div>

        {/* 人生类型选择 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            选择你的人生类型
          </h2>
          <LifeTypeSelector
            lifeTypes={lifeTypes}
            onSelect={handleLifeTypeSelect}
            isLoading={isLoading}
          />
        </div>

        {/* 游戏说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">游戏说明</h3>
          <div className="text-blue-800 text-sm space-y-2">
            <p>• 游戏完全匿名，无需注册登录</p>
            <p>• 每次选择都会影响你的分数（0-100分）</p>
            <p>• 分数达到100分或0分时游戏结束</p>
            <p>• 游戏状态会自动保存，可以随时继续</p>
            <p>• 所有内容都经过AI内容审核，确保安全</p>
          </div>
        </div>
      </div>
    </div>
  )
}
