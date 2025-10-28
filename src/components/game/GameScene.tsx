'use client'

import { useState, useEffect } from 'react'
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

  // 当场景变化时，重置选择状态
  useEffect(() => {
    setSelectedChoice(null)
    setIsProcessing(false)
  }, [scene.id])

  const handleChoiceSelect = async (choiceIndex: number) => {
    if (isProcessing) return
    
    // 设置选择并立即显示加载动画（含结果）
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
          你会如何选择？
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
                 </div>

                 <button
                   disabled={disabled}
                   className={cn(
                     "px-6 py-3 rounded-2xl font-bold text-white border-[4px] shadow-md whitespace-nowrap transition-all",
                     !disabled && "hover:shadow-lg active:translate-y-1",
                     isSelected && choice.scoreImpact > 0 && "bg-teal-400 border-teal-600",
                     isSelected && choice.scoreImpact < 0 && "bg-red-400 border-red-600",
                     isSelected && choice.scoreImpact === 0 && "bg-gray-400 border-gray-600",
                     !isSelected && "bg-blue-400 border-blue-600"
                   )}
                   onClick={(e) => {
                     e.stopPropagation()
                     if (!disabled) handleChoiceSelect(index)
                   }}
                 >
                   {isSelected 
                     ? `${choice.scoreImpact > 0 ? '+' : ''}${choice.scoreImpact}分` 
                     : "选择"}
                 </button>
               </div>

               {/* 只在选择后显示选择后的说明 */}
               {isSelected && choice.reasoning && (
                 <div className="mt-3 pt-3 border-t-2 border-gray-200">
                   <p className="text-sm text-gray-700 leading-relaxed">
                     💭 <span className="font-semibold">结果：</span>{choice.reasoning}
                   </p>
                 </div>
               )}
            </div>
          )
        })}
      </div>

      {/* 处理中遮罩 - 显示选择结果 */}
      {isProcessing && selectedChoice !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 border-[5px] border-gray-900 shadow-2xl max-w-2xl w-full mx-4">
            <div className="flex flex-col space-y-6">
              {/* 加载动画和标题 */}
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="w-16 h-16 border-[6px] border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xl md:text-2xl font-black text-gray-900">AI正在生成下一个场景...</p>
              </div>

              {/* 分割线 */}
              <div className="border-t-2 border-gray-300"></div>

              {/* 你的选择 */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-800 text-center">📝 你的选择</h3>
                <div className="bg-blue-50 rounded-2xl p-4 border-[3px] border-blue-200">
                  <p className="text-base font-bold text-gray-900">
                    {scene.choices[selectedChoice].text}
                  </p>
                </div>
              </div>

              {/* 分数变化 */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-semibold text-gray-700">分数变化：</span>
                <div className={cn(
                  "px-4 py-2 rounded-xl font-black text-lg border-[3px]",
                  scene.choices[selectedChoice].scoreImpact > 0 && "bg-teal-100 border-teal-400 text-teal-700",
                  scene.choices[selectedChoice].scoreImpact < 0 && "bg-red-100 border-red-400 text-red-700",
                  scene.choices[selectedChoice].scoreImpact === 0 && "bg-gray-100 border-gray-400 text-gray-700"
                )}>
                  {scene.choices[selectedChoice].scoreImpact > 0 ? '+' : ''}
                  {scene.choices[selectedChoice].scoreImpact} 分
                </div>
              </div>

              {/* 选择后的走向说明 */}
              {scene.choices[selectedChoice].reasoning && (
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-gray-800 text-center">💭 结果</h3>
                  <div className="bg-amber-50 rounded-2xl p-4 border-[3px] border-amber-200">
                    <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                      {scene.choices[selectedChoice].reasoning}
                    </p>
                  </div>
                </div>
              )}

              {/* 提示文字 */}
              <p className="text-xs text-center text-gray-500 italic">
                请稍候，马上就好 ✨
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
