'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GameScene } from '@/components/game/GameScene'
import { GameResult } from '@/components/game/GameResult'
import { AchievementToast } from '@/components/game/AchievementToast'
import { ScoreAnimation } from '@/components/game/ScoreAnimation'
import { useGameStore } from '@/lib/store'
import { GameSession, SceneNode, LifeType } from '@/types/game'

export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  const [gameSession, setGameSession] = useState<GameSession | null>(null)
  const [currentScene, setCurrentSceneState] = useState<SceneNode | null>(null)
  const [lifeType, setLifeType] = useState<LifeType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 动画状态
  const [showScoreAnimation, setShowScoreAnimation] = useState(false)
  const [scoreChange, setScoreChange] = useState(0)
  const [newScore, setNewScore] = useState(0)
  const [achievements, setAchievements] = useState<string[]>([])
  const [showAchievements, setShowAchievements] = useState(false)

  // 从store获取状态
  const { setCurrentSession, setCurrentScene, updateGameState, setLoading, setError: setStoreError } = useGameStore()

  useEffect(() => {
    loadGameSession()
  }, [sessionId])

  const loadGameSession = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 获取游戏会话
      const response = await fetch(`/api/game/session/${sessionId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error.message)
      }

      const { gameSession, currentScene, lifeType } = result.data
      
      setGameSession(gameSession)
      setCurrentSceneState(currentScene)
      setLifeType(lifeType)
      
      // 更新store
      setCurrentSession(gameSession)
      setCurrentScene(currentScene)
      updateGameState(gameSession.gameState)
      
    } catch (error) {
      console.error('加载游戏会话失败:', error)
      setError(error instanceof Error ? error.message : '加载游戏失败')
      setStoreError(error instanceof Error ? error.message : '加载游戏失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChoiceSelect = async (choiceIndex: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/game/choice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          choiceIndex
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error.message)
      }

      const { newScore, reasoning, nextScene, gameState, isEnding, achievements, scoreChange, endReason, endingType } = result.data

      // 显示分数变化动画
      if (scoreChange !== 0) {
        setScoreChange(scoreChange)
        setNewScore(newScore)
        setShowScoreAnimation(true)
      }

      // 显示成就提示
      if (achievements && achievements.length > 0) {
        setAchievements(achievements)
        setShowAchievements(true)
      }

      // 更新游戏会话
      const updatedSession = {
        ...gameSession!,
        currentScore: newScore,
        gameState,
        completedAt: isEnding ? new Date().toISOString() : null
      }

      setGameSession(updatedSession)
      setCurrentSession(updatedSession)
      updateGameState(gameState)

      if (nextScene) {
        setCurrentSceneState(nextScene)
        setCurrentScene(nextScene)
      }

      // 显示分数变化和推理
      if (reasoning) {
        // 这里可以显示一个toast或者modal来显示推理
        console.log('选择推理:', reasoning)
      }

    } catch (error) {
      console.error('处理选择失败:', error)
      setError(error instanceof Error ? error.message : '处理选择失败')
      setStoreError(error instanceof Error ? error.message : '处理选择失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    router.push('/')
  }

  const handleViewHistory = () => {
    router.push('/history')
  }

  const handleShare = async () => {
    try {
      const response = await fetch('/api/game/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error.message)
      }

      const { shareUrl } = result.data
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(shareUrl)
      alert('分享链接已复制到剪贴板！')
      
    } catch (error) {
      console.error('分享失败:', error)
      alert('分享失败，请重试')
    }
  }

  if (isLoading && !gameSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">加载游戏中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">游戏加载失败</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (!gameSession || !currentScene || !lifeType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">游戏会话不存在</h1>
          <p className="text-gray-600 mb-4">请检查游戏链接是否正确</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  // 游戏结束，显示结果
  if (gameSession.gameState === 'completed') {
    return (
      <GameResult
        session={gameSession}
        lifeType={lifeType}
        endReason={gameSession.endReason}
        endingType={gameSession.endingType}
        onRestart={handleRestart}
        onViewHistory={handleViewHistory}
        onShare={handleShare}
      />
    )
  }

  // 游戏进行中，显示场景
  return (
    <>
      <GameScene
        scene={currentScene}
        currentScore={gameSession.currentScore}
        onChoiceSelect={handleChoiceSelect}
        isLoading={isLoading}
      />
      
      {/* 分数变化动画 */}
      {showScoreAnimation && (
        <ScoreAnimation
          scoreChange={scoreChange}
          newScore={newScore}
          onComplete={() => setShowScoreAnimation(false)}
        />
      )}
      
      {/* 成就提示 */}
      {showAchievements && (
        <AchievementToast
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </>
  )
}
