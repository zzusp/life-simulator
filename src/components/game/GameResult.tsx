'use client'

import { GameSession, LifeType } from '@/types/game'
import { getScoreLabel } from '@/lib/design-tokens'
import { formatDuration } from '@/lib/utils'
import { PaperCard } from '@/components/cartoon/PaperCard'
import { CartoonButton } from '@/components/cartoon/CartoonButton'
import { LabelTab } from '@/components/cartoon/LabelTab'
import { HandDrawnIcon } from '@/components/cartoon/HandDrawnIcon'

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
  
  const scoreData = getScoreLabel(session.currentScore)

  const getResultTitle = () => {
    if (endingType === 'victory') return '🎉 恭喜！你的人生获得了巨大成功！'
    if (endingType === 'defeat') return '😔 很遗憾，你的人生遇到了重大挫折...'
    if (endingType === 'timeout') return '⏰ 你的人生已经经历了足够多的选择...'
    if (endingType === 'choice') return '🤔 你的人生走到了一个重要的转折点...'
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
    if (isVictory) return '你通过明智的选择和努力，实现了人生的目标！'
    if (isDefeat) return '虽然遇到了一些困难，但这也是人生的一部分。'
    return '你的人生还在进行中，继续努力吧！'
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* 结果标题 */}
      <PaperCard
        decoration="pin"
        decorationPosition="top-center"
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
          {getResultTitle()}
        </h2>
        <p className="text-base md:text-lg text-ink-light leading-relaxed">
          {getResultDescription()}
        </p>
      </PaperCard>

      {/* 游戏统计 - 卡片栅格 */}
      <PaperCard
        decoration="clip"
        decorationPosition="top-left"
        aria-label="结果统计"
      >
        <h3 className="text-xl font-semibold text-ink mb-4 text-center">
          📊 游戏统计
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 最终分数 */}
          <PaperCard
            decoration="none"
            simplified
            className="text-center"
            aria-label="最终分数"
          >
            <div className="text-4xl font-bold text-ink mb-2">
              {session.currentScore}
            </div>
            <LabelTab 
              text={scoreData.label}
              color={
                session.currentScore >= 80 ? 'green' :
                session.currentScore >= 60 ? 'blue' :
                session.currentScore >= 40 ? 'yellow' :
                'orange'
              }
              size="md"
            />
            <div className="text-sm text-ink-light mt-2">最终分数</div>
          </PaperCard>

          {/* 选择次数 */}
          <PaperCard
            decoration="none"
            simplified
            className="text-center"
            aria-label="做出选择次数"
          >
            <div className="text-4xl font-bold text-ink mb-2">
              {session.choicesMade.length}
            </div>
            <div className="text-sm text-ink-light">做出选择</div>
          </PaperCard>

          {/* 游戏时长 */}
          <PaperCard
            decoration="none"
            simplified
            className="text-center"
            aria-label="游戏时长"
          >
            <div className="text-4xl font-bold text-ink mb-2">
              {formatDuration(Math.floor(gameDuration / 1000))}
            </div>
            <div className="text-sm text-ink-light">游戏时长</div>
          </PaperCard>
        </div>
      </PaperCard>

      {/* 人生类型信息 */}
      <PaperCard
        decoration="tape"
        decorationPosition="top-right"
        aria-label="人生类型信息"
      >
        <h3 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
          <span>🎭</span>
          <span>人生类型：{lifeType.name}</span>
        </h3>
        <p className="text-ink-light mb-4 leading-relaxed">{lifeType.description}</p>
        
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-ink mb-1">初始身份</h4>
            <p className="text-sm text-ink-light">{lifeType.initialIdentity}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-ink mb-1">主要目标</h4>
            <ul className="text-sm text-ink-light space-y-1">
              {(lifeType.mainGoals || []).map((goal, index) => (
                <li key={index}>• {goal}</li>
              ))}
            </ul>
          </div>
        </div>
      </PaperCard>

      {/* 成就系统 */}
      {session.achievementsUnlocked && session.achievementsUnlocked.length > 0 && (
        <PaperCard
          decoration="clip"
          decorationPosition="top-center"
          aria-label="解锁成就"
        >
          <h3 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
            <HandDrawnIcon type="trophy" size={24} color="#d9a84a" />
            <span>解锁成就</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.achievementsUnlocked.map((achievementId, index) => (
              <PaperCard
                key={index}
                decoration="none"
                simplified
                className="bg-functional-warning/10"
              >
                <div className="flex items-center gap-3">
                  <HandDrawnIcon 
                    type="trophy" 
                    size={32} 
                    color="#d9a84a"
                    animated
                    animationType="wiggle"
                  />
                  <div>
                    <div className="font-medium text-ink">成就 {index + 1}</div>
                    <div className="text-sm text-ink-light">恭喜解锁新成就！</div>
                  </div>
                </div>
              </PaperCard>
            ))}
          </div>
        </PaperCard>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <CartoonButton
          variant="primary"
          size="lg"
          onClick={onRestart}
        >
          🔄 重新开始
        </CartoonButton>
        
        <CartoonButton
          variant="outline"
          size="lg"
          onClick={onViewHistory}
        >
          📜 查看历史
        </CartoonButton>
        
        {onShare && (
          <CartoonButton
            variant="secondary"
            size="lg"
            onClick={onShare}
          >
            📤 分享结果
          </CartoonButton>
        )}
      </div>
    </div>
  )
}
