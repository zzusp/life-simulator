'use client'

import { useEffect, useState } from 'react'
import { PaperCard } from '@/components/cartoon/PaperCard'
import { LabelTab } from '@/components/cartoon/LabelTab'

interface ScoreAnimationProps {
  scoreChange: number
  newScore: number
  onComplete: () => void
}

/**
 * ScoreAnimation 分数变化动画组件
 * 
 * 特点：
 * - 弹性曲线动画（bounce）
 * - 0.8-1.2s 时长
 * - 位移≤16px，缩放≤5%
 * - 手绘风格卡片
 */
export function ScoreAnimation({ scoreChange, newScore, onComplete }: ScoreAnimationProps) {
  const [visible, setVisible] = useState(false)
  const [currentScore, setCurrentScore] = useState(newScore - scoreChange)

  useEffect(() => {
    setVisible(true)

    // 动画时长 0.8-1.2s（根据分数变化幅度）
    const duration = Math.min(Math.max(800, Math.abs(scoreChange) * 50), 1200)
    const steps = 20
    const stepDuration = duration / steps
    const scoreStep = scoreChange / steps

    let step = 0
    const interval = setInterval(() => {
      step++
      setCurrentScore((prev) => {
        const next = prev + scoreStep
        return scoreChange > 0 ? Math.min(newScore, next) : Math.max(newScore, next)
      })
      
      if (step >= steps) {
        clearInterval(interval)
        setCurrentScore(newScore)
        setTimeout(() => {
          setVisible(false)
          setTimeout(onComplete, 300)
        }, 500)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [scoreChange, newScore, onComplete])

  if (!visible) {
    return null
  }

  return (
    <div 
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce-in"
      role="alert"
      aria-live="polite"
    >
      <PaperCard
        decoration="tape"
        decorationPosition="top-center"
        className="shadow-xl max-w-sm mx-4"
      >
        <div className="text-center space-y-4">
          {/* 标题 */}
          <h3 className="text-xl font-bold text-ink">分数变化</h3>
          
          {/* 分数变化（带缩放动画）*/}
          <div
            className={`text-5xl font-bold score-change ${
              scoreChange > 0 ? 'text-functional-success' : 
              scoreChange < 0 ? 'text-functional-error' : 
              'text-ink'
            }`}
            style={{
              animation: 'scoreChange 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            }}
          >
            {scoreChange > 0 ? '+' : ''}
            {scoreChange}
          </div>
          
          {/* 当前分数 */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-ink-light">当前分数:</span>
            <LabelTab 
              text={Math.round(currentScore).toString()} 
              color={
                currentScore >= 80 ? 'green' : 
                currentScore >= 60 ? 'blue' : 
                currentScore >= 40 ? 'yellow' : 
                'orange'
              }
              size="lg"
            />
          </div>
        </div>
      </PaperCard>
    </div>
  )
}
