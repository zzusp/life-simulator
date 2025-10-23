'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LifeType } from '@/types/game'

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">加载中...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lifeTypes.map((lifeType) => (
        <div
          key={lifeType.id}
          className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedId === lifeType.id
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleSelect(lifeType)}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {lifeType.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {lifeType.description}
              </p>
            </div>
            
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">初始身份</h4>
                <p className="text-xs text-gray-500">{lifeType.initialIdentity}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">主要目标</h4>
                <ul className="text-xs text-gray-500 space-y-1">
                  {lifeType.mainGoals.map((goal, index) => (
                    <li key={index}>• {goal}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                handleSelect(lifeType)
              }}
            >
              选择此人生
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
