'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SceneNode, Choice } from '@/types/game'
import { getScoreColor, getScoreLabel } from '@/lib/utils'

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 场景标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {scene.title}
        </h1>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-sm text-gray-500">
            场景 {scene.sceneNumber}
          </div>
          <div className={`text-sm font-medium ${getScoreColor(currentScore)}`}>
            分数: {currentScore} ({getScoreLabel(currentScore)})
          </div>
        </div>
      </div>

      {/* 场景描述 */}
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed text-lg">
            {scene.description}
          </p>
        </div>
      </div>

      {/* 选择选项 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          请选择你的行动：
        </h3>
        
        {scene.choices.map((choice: Choice, index: number) => (
          <div
            key={index}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedChoice === index
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleChoiceSelect(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-800 font-medium">
                  {choice.text}
                </p>
                {choice.reasoning && (
                  <p className="text-sm text-gray-500 mt-1">
                    {choice.reasoning}
                  </p>
                )}
              </div>
              
              <div className={`text-sm font-medium ml-4 ${
                choice.scoreImpact > 0 
                  ? 'text-green-600' 
                  : choice.scoreImpact < 0 
                  ? 'text-red-600' 
                  : 'text-gray-500'
              }`}>
                {choice.scoreImpact > 0 ? '+' : ''}{choice.scoreImpact}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 加载状态 */}
      {(isLoading || isProcessing) && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">
            {isProcessing ? '处理选择中...' : '加载中...'}
          </span>
        </div>
      )}

      {/* 选择禁用状态 */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-gray-700">AI正在生成下一个场景...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
