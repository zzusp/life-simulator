// 游戏相关类型定义

export interface LifeType {
  id: string
  name: string
  description: string
  worldviewPrompt: string
  initialIdentity: string
  resources: Record<string, any>
  constraints: Record<string, any>
  mainGoals: string[]
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export interface GameSession {
  id: string
  sessionId: string
  lifeTypeId: string
  currentScore: number
  gameState: 'playing' | 'completed' | 'abandoned'
  currentSceneId: string | null
  choicesMade: PlayerChoice[]
  achievementsUnlocked: string[]
  startedAt: string
  lastActivityAt: string
  completedAt: string | null
  endReason?: string
  endingType?: 'victory' | 'defeat' | 'timeout' | 'choice'
}

export interface SceneNode {
  id: string
  lifeTypeId: string
  sceneNumber: number
  title: string
  description: string
  aiGeneratedContent: string
  choices: Choice[]
  nextSceneRules: Record<string, any>
  isEndingScene: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export interface Choice {
  text: string
  scoreImpact: number
  reasoning: string
  nextSceneId?: string
}

export interface PlayerChoice {
  id: string
  sessionId: string
  sceneId: string
  choiceIndex: number
  choiceText: string
  scoreImpact: number
  reasoningSummary: string
  aiPromptUsed: string
  createdAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  iconUrl: string | null
  unlockConditions: Record<string, any>
  rewardType: 'badge' | 'title' | 'unlock_content'
  isActive: boolean
  createdAt: string
}

export interface SessionAchievement {
  id: string
  sessionId: string
  achievementId: string
  unlockedAt: string
  progressData: Record<string, any>
}

export interface LeaderboardEntry {
  rank: number
  sessionId: string
  score: number
  gameDuration: number
  achievementsCount: number
  updatedAt: string
}

export interface SharedResult {
  id: string
  sessionId: string
  shareToken: string
  shareContent: Record<string, any>
  viewCount: number
  createdAt: string
  expiresAt: string
}

export interface AIPrompt {
  id: string
  name: string
  promptType: 'scene_generation' | 'choice_generation' | 'reasoning' | 'moderation'
  content: string
  variables: Record<string, any>
  version: number
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  actionType: 'create' | 'update' | 'delete' | 'view'
  entityType: string
  entityId: string
  oldValues: Record<string, any>
  newValues: Record<string, any>
  adminUserId: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

// 游戏状态类型
export interface GameState {
  session: GameSession | null
  currentScene: SceneNode | null
  isLoading: boolean
  error: string | null
}

// AI响应类型
export interface AIResponse {
  content: string
  choices: Choice[]
  reasoning: string
  nextSceneId?: string
}

// 分数计算类型
export interface ScoreImpact {
  value: number
  reasoning: string
  conditions?: Record<string, any>
}

// 内容审核类型
export interface ModerationResult {
  isSafe: boolean
  categories: string[]
  confidence: number
  details: Record<string, any>
}
