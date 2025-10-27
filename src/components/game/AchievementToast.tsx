'use client'

import { useEffect, useRef, useState } from 'react'
import { PaperCard } from '@/components/cartoon/PaperCard'
import { HandDrawnIcon } from '@/components/cartoon/HandDrawnIcon'

interface AchievementToastProps {
  achievements: string[]
  onClose: () => void
}

/**
 * AchievementToast 成就提示组件
 * 
 * 特点：
 * - 手绘风格卡片
 * - 严格串行显示（并发=1）
 * - 单条展示约3s
 * - 条间间隔≥300ms
 * - 不遮挡主交互区（右上角）
 * - 滑入/滑出动画
 */
export function AchievementToast({ achievements, onClose }: AchievementToastProps) {
  const [visibleQueue, setVisibleQueue] = useState<string[]>([])
  const indexRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!achievements || achievements.length === 0) return
    
    // 严格串行：一次只显示一个
    indexRef.current = 0
    setVisibleQueue([achievements[0]])

    const runQueue = () => {
      timerRef.current && clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        indexRef.current += 1
        if (indexRef.current >= achievements.length) {
          setVisibleQueue([])
          // 留出淡出与间隔（≥300ms）
          setTimeout(onClose, 300)
          return
        }
        setVisibleQueue([achievements[indexRef.current]])
        runQueue()
      }, 3000 + 300) // 单条3s + 间隔300ms
    }

    runQueue()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [achievements, onClose])

  if (visibleQueue.length === 0) {
    return null
  }

  return (
    <div 
      className="fixed top-4 right-4 z-40 space-y-2 max-w-sm"
      role="status"
      aria-live="polite"
    >
      {visibleQueue.map((achievementId) => (
        <div
          key={achievementId}
          className="toast-enter"
        >
          <PaperCard
            decoration="pin"
            decorationPosition="top-right"
            className="bg-functional-warning/10 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <HandDrawnIcon 
                type="trophy" 
                size={40} 
                color="#d9a84a"
                animated
                animationType="bounce"
              />
              <div className="flex-1">
                <div className="font-bold text-ink text-base">
                  🎉 成就解锁！
                </div>
                <div className="text-sm text-ink-light mt-1">
                  {getAchievementName(achievementId)}
                </div>
              </div>
            </div>
          </PaperCard>
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
    'perfect-game': '完美游戏',
  }
  return names[achievementId] || '未知成就'
}
