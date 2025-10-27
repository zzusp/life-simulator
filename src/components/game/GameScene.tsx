'use client'

import { useState } from 'react'
import { SceneNode, Choice } from '@/types/game'
import { getScoreLabel } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface GameSceneProps {
  scene: SceneNode
  currentScore: number
  onChoiceSelect: (choiceIndex: number) => void
  isLoading?: boolean
}

export function GameScene({ scene, currentScore, onChoiceSelect, isLoading = false }: GameSceneProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleChoiceSelect = async (choiceIndex: number) => {
    if (isProcessing) return
    setSelectedChoice(choiceIndex)
    setIsProcessing(true)
    try {
      await onChoiceSelect(choiceIndex)
    } finally {
      setIsProcessing(false)
    }
  }

  const scoreData = getScoreLabel(currentScore)

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
      {/* 分数和场景信息卡片 - 浅蓝色卡片 */}
      <div className="bg-sky-200 rounded-3xl p-5 border-[5px] border-sky-500 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-sm text-gray-800 font-bold">场景 {scene.sceneNumber}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 px-4 py-1 rounded-xl border-3 border-green-400">
              <span className="text-xs text-gray-700 font-semibold">{scoreData.label}</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-700">当前分数</div>
              <div className="text-2xl font-black text-gray-900">{currentScore}</div>
            </div>
          </div>
        </div>
        
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3">
          {scene.title}
        </h2>
        
        <p className="text-base text-gray-800 leading-relaxed">
          {scene.description}
        </p>
      </div>

      {/* 选择提示 */}
      <div className="text-center py-2">
        <h3 className="text-lg font-bold text-gray-800">
          这次打算开发什么类型的游戏呢？
        </h3>
      </div>

      {/* 选择卡片列表 */}
      <div className="space-y-3">
        {scene.choices.map((choice: Choice, index: number) => {
          const isSelected = selectedChoice === index
          const disabled = isProcessing || isLoading
          
          return (
            <div
              key={index}
              className={cn(
                "bg-white rounded-2xl p-5 border-[5px] shadow-lg transition-all",
                !disabled && "hover:shadow-xl hover:-translate-y-1 cursor-pointer",
                disabled && "opacity-60 cursor-not-allowed",
                isSelected ? "border-teal-500" : "border-gray-900"
              )}
              onClick={() => !disabled && handleChoiceSelect(index)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900 mb-1">
                    {choice.text}
                  </p>
                  {choice.reasoning && (
                    <p className="text-sm text-gray-600">
                      {choice.reasoning}
                    </p>
                  )}
                </div>
                
                <button
                  disabled={disabled}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-bold text-white border-[4px] shadow-md whitespace-nowrap transition-all",
                    !disabled && "hover:shadow-lg active:translate-y-1",
                    choice.scoreImpact > 0 && "bg-teal-400 border-teal-600",
                    choice.scoreImpact < 0 && "bg-red-400 border-red-600",
                    choice.scoreImpact === 0 && "bg-gray-400 border-gray-600"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!disabled) handleChoiceSelect(index)
                  }}
                >
                  {isSelected ? "已选择" : "选择"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 处理中遮罩 */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 border-[5px] border-gray-900 shadow-2xl max-w-md mx-4">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-20 h-20 border-[6px] border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-2xl font-black text-gray-900">AI正在生成下一个场景...</p>
              <p className="text-sm text-gray-600">请稍候，马上就好 ✨</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
