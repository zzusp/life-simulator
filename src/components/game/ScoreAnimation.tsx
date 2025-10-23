'use client'

import { useEffect, useState } from 'react'

interface ScoreAnimationProps {
  scoreChange: number
  newScore: number
  onComplete: () => void
}

export function ScoreAnimation({ scoreChange, newScore, onComplete }: ScoreAnimationProps) {
  const [visible, setVisible] = useState(false)
  const [currentScore, setCurrentScore] = useState(newScore - scoreChange)

  useEffect(() => {
    setVisible(true)
    
    // 分数动画
    const duration = 1000
    const steps = 20
    const stepDuration = duration / steps
    const scoreStep = scoreChange / steps
    
    let step = 0
    const interval = setInterval(() => {
      step++
      setCurrentScore(prev => Math.min(newScore, prev + scoreStep))
      
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
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            分数变化
          </div>
          <div className={`text-4xl font-bold ${
            scoreChange > 0 ? 'text-green-600' : 
            scoreChange < 0 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {scoreChange > 0 ? '+' : ''}{scoreChange}
          </div>
          <div className="text-lg text-gray-600 mt-2">
            当前分数: {Math.round(currentScore)}
          </div>
        </div>
      </div>
    </div>
  )
}
