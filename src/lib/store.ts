import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GameSession, SceneNode, LifeType, Achievement } from '@/types/game'

// 游戏状态接口
interface GameState {
  // 当前游戏会话
  currentSession: GameSession | null
  // 当前场景
  currentScene: SceneNode | null
  // 当前人生类型
  currentLifeType: LifeType | null
  // 游戏状态
  gameState: 'idle' | 'playing' | 'completed' | 'error'
  // 加载状态
  isLoading: boolean
  // 错误信息
  error: string | null
  // 成就列表
  achievements: Achievement[]
  // 已解锁的成就
  unlockedAchievements: string[]
}

// 游戏操作接口
interface GameActions {
  // 开始新游戏
  startGame: (lifeType: LifeType) => void
  // 设置当前会话
  setCurrentSession: (session: GameSession) => void
  // 设置当前场景
  setCurrentScene: (scene: SceneNode) => void
  // 更新游戏状态
  updateGameState: (state: GameState['gameState']) => void
  // 设置加载状态
  setLoading: (loading: boolean) => void
  // 设置错误
  setError: (error: string | null) => void
  // 更新分数
  updateScore: (newScore: number) => void
  // 添加选择记录
  addChoice: (choice: any) => void
  // 解锁成就
  unlockAchievement: (achievementId: string) => void
  // 重置游戏
  resetGame: () => void
  // 保存游戏状态
  saveGame: () => void
  // 加载游戏状态
  loadGame: (sessionId: string) => void
}

// 创建游戏状态管理
export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentSession: null,
      currentScene: null,
      currentLifeType: null,
      gameState: 'idle',
      isLoading: false,
      error: null,
      achievements: [],
      unlockedAchievements: [],

      // 开始新游戏
      startGame: (lifeType: LifeType) => {
        set({
          currentLifeType: lifeType,
          gameState: 'playing',
          isLoading: true,
          error: null
        })
      },

      // 设置当前会话
      setCurrentSession: (session: GameSession) => {
        set({ currentSession: session })
      },

      // 设置当前场景
      setCurrentScene: (scene: SceneNode) => {
        set({ currentScene: scene })
      },

      // 更新游戏状态
      updateGameState: (state: GameState['gameState']) => {
        set({ gameState: state })
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // 设置错误
      setError: (error: string | null) => {
        set({ error })
      },

      // 更新分数
      updateScore: (newScore: number) => {
        const { currentSession } = get()
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              currentScore: Math.max(0, Math.min(100, newScore))
            }
          })
        }
      },

      // 添加选择记录
      addChoice: (choice: any) => {
        const { currentSession } = get()
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              choicesMade: [...currentSession.choicesMade, choice]
            }
          })
        }
      },

      // 解锁成就
      unlockAchievement: (achievementId: string) => {
        const { unlockedAchievements } = get()
        if (!unlockedAchievements.includes(achievementId)) {
          set({
            unlockedAchievements: [...unlockedAchievements, achievementId]
          })
        }
      },

      // 重置游戏
      resetGame: () => {
        set({
          currentSession: null,
          currentScene: null,
          currentLifeType: null,
          gameState: 'idle',
          isLoading: false,
          error: null,
          unlockedAchievements: []
        })
      },

      // 保存游戏状态
      saveGame: () => {
        const { currentSession } = get()
        if (currentSession) {
          // 这里可以调用API保存到服务器
          console.log('保存游戏状态:', currentSession)
        }
      },

      // 加载游戏状态
      loadGame: (sessionId: string) => {
        set({ isLoading: true, error: null })
        // 这里可以调用API从服务器加载
        console.log('加载游戏状态:', sessionId)
      }
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        currentSession: state.currentSession,
        currentLifeType: state.currentLifeType,
        unlockedAchievements: state.unlockedAchievements
      })
    }
  )
)

// 选择器函数
export const useGameSession = () => useGameStore(state => state.currentSession)
export const useCurrentScene = () => useGameStore(state => state.currentScene)
export const useGameState = () => useGameStore(state => state.gameState)
export const useIsLoading = () => useGameStore(state => state.isLoading)
export const useGameError = () => useGameStore(state => state.error)
export const useAchievements = () => useGameStore(state => state.achievements)
export const useUnlockedAchievements = () => useGameStore(state => state.unlockedAchievements)
