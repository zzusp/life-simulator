'use client'

import { Button } from '@/components/ui/button'
import { GameSession, LifeType } from '@/types/game'
import { getScoreColor, getScoreLabel, formatDuration } from '@/lib/utils'

interface GameResultProps {
  session: GameSession
  lifeType: LifeType
  endReason?: string
  endingType?: 'victory' | 'defeat' | 'timeout' | 'choice'
  onRestart: () => void
  onViewHistory: () => void
  onShare?: () => void
}

export function GameResult({ session, lifeType, endReason, endingType, onRestart, onViewHistory, onShare }: GameResultProps) {
  const gameDuration = session.completedAt 
    ? new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()
    : 0

  const isVictory = session.currentScore >= 100
  const isDefeat = session.currentScore <= 0
  const isDraw = session.currentScore > 0 && session.currentScore < 100

  const getResultTitle = () => {
    if (endingType === 'victory') return '🎉 恭喜！你的人生获得了巨大成功！'
    if (endingType === 'defeat') return '😔 很遗憾，你的人生遇到了重大挫折...'
    if (endingType === 'timeout') return '⏰ 你的人生已经经历了足够多的选择...'
    if (endingType === 'choice') return '🤔 你的人生走到了一个重要的转折点...'
    
    // 回退到分数判断
    if (isVictory) return '🎉 恭喜！你的人生获得了成功！'
    if (isDefeat) return '😔 很遗憾，你的人生遇到了挫折...'
    return '🤔 你的人生还在继续...'
  }

  const getResultDescription = () => {
    if (endReason) return endReason
    
    if (endingType === 'victory') return '你通过明智的选择和努力，实现了人生的目标！'
    if (endingType === 'defeat') return '虽然遇到了一些困难，但这也是人生的一部分。'
    if (endingType === 'timeout') return '你的人生已经经历了足够多的选择，是时候总结一下了。'
    if (endingType === 'choice') return '你的人生走到了一个重要的转折点，需要做出关键决定。'
    
    // 回退到分数判断
    if (isVictory) return '你通过明智的选择和努力，实现了人生的目标！'
    if (isDefeat) return '虽然遇到了一些困难，但这也是人生的一部分。'
    return '你的人生还在进行中，继续努力吧！'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 结果标题 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {getResultTitle()}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {getResultDescription()}
        </p>
      </div>

      {/* 游戏统计 */}
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          游戏统计
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(session.currentScore)}`}>
              {session.currentScore}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              最终分数 ({getScoreLabel(session.currentScore)})
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {session.choicesMade.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              做出选择
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatDuration(Math.floor(gameDuration / 1000))}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              游戏时长
            </div>
          </div>
        </div>
      </div>

      {/* 人生类型信息 */}
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          人生类型：{lifeType.name}
        </h2>
        <p className="text-gray-600 mb-4">
          {lifeType.description}
        </p>
        
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">初始身份</h3>
            <p className="text-sm text-gray-500">{lifeType.initialIdentity}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">主要目标</h3>
            <ul className="text-sm text-gray-500 space-y-1">
              {(lifeType.mainGoals || []).map((goal, index) => (
                <li key={index}>• {goal}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 成就系统 */}
      {session.achievementsUnlocked.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            解锁成就
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(session.achievementsUnlocked || []).map((achievementId, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="font-medium text-gray-900">成就 {index + 1}</div>
                  <div className="text-sm text-gray-500">恭喜解锁新成就！</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 选择历史 */}
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          选择历史
        </h2>
        <div className="space-y-3">
          {(session.choicesMade || []).map((choice, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  选择 {index + 1}: {choice.choiceText}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {choice.reasoningSummary}
                </div>
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
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onRestart}
          className="px-8 py-3 text-lg"
        >
          重新开始
        </Button>
        <Button
          onClick={onViewHistory}
          variant="outline"
          className="px-8 py-3 text-lg"
        >
          查看历史
        </Button>
        {onShare && (
          <Button
            onClick={onShare}
            variant="outline"
            className="px-8 py-3 text-lg"
          >
            分享结果
          </Button>
        )}
      </div>
    </div>
  )
}
