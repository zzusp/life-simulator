'use client'

import { useEffect, useState } from 'react'
import { Achievement } from '@/types/game'

interface AchievementToastProps {
  achievements: string[]
  onClose: () => void
}

export function AchievementToast({ achievements, onClose }: AchievementToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (achievements.length > 0) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300) // 等待动画完成
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [achievements, onClose])

  if (!visible || achievements.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {achievements.map((achievementId, index) => (
        <div
          key={achievementId}
          className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg transform transition-all duration-300 ${
            visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
          style={{ animationDelay: `${index * 200}ms` }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏆</div>
            <div>
              <div className="font-semibold text-yellow-800">
                成就解锁！
              </div>
              <div className="text-sm text-yellow-600">
                {getAchievementName(achievementId)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function getAchievementName(achievementId: string): string {
  const names: Record<string, string> = {
    'first-choice': '初次选择',
    'high-score': '高分达人',
    'low-score': '低分专家',
    'long-game': '持久战',
    'perfect-game': '完美游戏'
  }
  return names[achievementId] || '未知成就'
}
