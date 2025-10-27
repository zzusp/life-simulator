'use client'

import { useState } from 'react'
import { LifeType } from '@/types/game'
import { cn } from '@/lib/utils'

interface LifeTypeSelectorProps {
  lifeTypes: LifeType[]
  onSelect: (lifeType: LifeType) => void
  isLoading?: boolean
}

export function LifeTypeSelector({ lifeTypes, onSelect, isLoading = false }: LifeTypeSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (lifeType: LifeType) => {
    setSelectedId(lifeType.id)
    onSelect(lifeType)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" aria-label="加载中" />
        <span className="ml-4 text-gray-700 font-semibold">加载中...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lifeTypes.map((lifeType) => (
        <div
          key={lifeType.id}
          className={cn(
            "bg-white rounded-3xl p-6 border-[5px] shadow-lg cursor-pointer transition-all hover:shadow-xl hover:-translate-y-2",
            selectedId === lifeType.id
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-900'
          )}
          role="button"
          tabIndex={0}
          aria-pressed={selectedId === lifeType.id}
          aria-label={`选择人生类型：${lifeType.name}`}
          onClick={() => handleSelect(lifeType)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleSelect(lifeType)
            }
          }}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {lifeType.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {lifeType.description}
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-50 rounded-xl p-3 border-2 border-blue-200">
                <h4 className="text-sm font-bold text-gray-800 mb-1">初始身份</h4>
                <p className="text-xs text-gray-600">{lifeType.initialIdentity}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border-2 border-green-200">
                <h4 className="text-sm font-bold text-gray-800 mb-1">主要目标</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {(lifeType.mainGoals || []).map((goal, index) => (
                    <li key={index}>• {goal}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              className="w-full px-6 py-4 bg-teal-400 hover:bg-teal-500 text-white font-black rounded-2xl border-[5px] border-teal-600 shadow-lg hover:shadow-xl active:translate-y-1 transition-all"
              onClick={(e) => {
                e.stopPropagation()
                handleSelect(lifeType)
              }}
            >
              选择此人生
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
