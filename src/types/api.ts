// API相关类型定义
import { GameSession, SceneNode, LifeType, SharedResult, LeaderboardEntry } from './game'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 游戏API请求类型
export interface StartGameRequest {
  lifeTypeId: string
}

export interface StartGameResponse {
  sessionId: string
  gameSession: GameSession
  initialScene: SceneNode
}

export interface MakeChoiceRequest {
  choiceIndex: number
}

export interface MakeChoiceResponse {
  newScore: number
  reasoning: string
  nextScene: SceneNode | null
  gameState: 'playing' | 'completed' | 'abandoned'
  isEnding: boolean
}

export interface GetSceneResponse {
  scene: SceneNode
  gameSession: GameSession
}

// 管理员API请求类型
export interface CreateLifeTypeRequest {
  name: string
  description: string
  worldviewPrompt: string
  initialIdentity: string
  resources?: Record<string, any>
  constraints?: Record<string, any>
  mainGoals?: string[]
}

export interface UpdateLifeTypeRequest {
  name?: string
  description?: string
  worldviewPrompt?: string
  initialIdentity?: string
  resources?: Record<string, any>
  constraints?: Record<string, any>
  mainGoals?: string[]
  isActive?: boolean
}

// 成就API请求类型
export interface UnlockAchievementRequest {
  sessionId: string
  achievementId: string
  progressData?: Record<string, any>
}

// 分享API请求类型
export interface CreateShareRequest {
  sessionId: string
  shareContent: Record<string, any>
  expiresIn?: number // 小时
}

export interface CreateShareResponse {
  shareToken: string
  shareUrl: string
  expiresAt: string
}

export interface GetSharedResultResponse {
  shareResult: SharedResult
  gameSession: GameSession
  lifeType: LifeType
}

// 排行榜API请求类型
export interface GetLeaderboardRequest {
  lifeTypeId: string
  limit?: number
  offset?: number
}

export interface GetLeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  totalCount: number
}

// 分析API请求类型
export interface GetAnalyticsRequest {
  lifeTypeId?: string
  dateFrom?: string
  dateTo?: string
  groupBy?: 'day' | 'week' | 'month'
}

export interface AnalyticsResponse {
  totalSessions: number
  averageScore: number
  completionRate: number
  averageDuration: number
  popularChoices: Array<{
    choice: string
    count: number
    percentage: number
  }>
  scoreDistribution: Array<{
    range: string
    count: number
    percentage: number
  }>
}

// 错误类型
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  statusCode: number
}

// 验证错误类型
export interface ValidationError {
  field: string
  message: string
  value?: any
}

// 分页参数类型
export interface PaginationQuery {
  page?: string
  limit?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 搜索参数类型
export interface SearchQuery {
  q?: string
  filters?: Record<string, any>
  dateRange?: {
    from: string
    to: string
  }
}
