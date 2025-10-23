import { supabase } from './supabase'
import { aiService } from './ai'
import { moderator } from './moderator'
import { GameSession, SceneNode, LifeType, Choice, PlayerChoice } from '@/types/game'
import { generateSessionId, clampScore } from './utils'

// 游戏引擎类
export class GameEngine {
  private static instance: GameEngine

  private constructor() {}

  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine()
    }
    return GameEngine.instance
  }

  // 开始新游戏
  async startGame(lifeTypeId: string): Promise<GameSession> {
    try {
      // 获取人生类型信息
      const { data: lifeType, error: lifeTypeError } = await supabase
        .from('life_types')
        .select('*')
        .eq('id', lifeTypeId)
        .eq('is_active', true)
        .single()

      if (lifeTypeError || !lifeType) {
        throw new Error('人生类型不存在或已禁用')
      }

      // 创建游戏会话
      const sessionId = generateSessionId()
      const gameSession: GameSession = {
        id: '', // 将在数据库插入后设置
        sessionId,
        lifeTypeId,
        currentScore: 50,
        gameState: 'playing',
        currentSceneId: null,
        choicesMade: [],
        achievementsUnlocked: [],
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        completedAt: null
      }

      // 保存到数据库
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .insert(gameSession)
        .select()
        .single()

      if (sessionError) {
        throw new Error('创建游戏会话失败')
      }

      // 生成初始场景
      const initialScene = await this.generateInitialScene(lifeType, sessionData.id)
      
      // 更新会话的当前场景
      await supabase
        .from('game_sessions')
        .update({ current_scene_id: initialScene.id })
        .eq('id', sessionData.id)

      return {
        ...sessionData,
        currentSceneId: initialScene.id
      }
    } catch (error) {
      console.error('开始游戏失败:', error)
      throw error
    }
  }

  // 生成初始场景
  private async generateInitialScene(lifeType: LifeType, sessionId: string): Promise<SceneNode> {
    try {
      // 构建AI提示词
      const prompt = `你是一个专业的游戏情节设计师。请为以下人生类型生成初始场景：

人生类型：${lifeType.name}
世界观：${lifeType.worldviewPrompt}
初始身份：${lifeType.initialIdentity}
资源：${JSON.stringify(lifeType.resources)}
限制：${JSON.stringify(lifeType.constraints)}
主要目标：${lifeType.mainGoals.join(', ')}

请生成一个引人入胜的初始场景，包含场景描述和3-5个选择选项。每个选项应该有不同的分数影响。`

      // 使用AI生成场景
      const aiResponse = await aiService.generateScene(prompt, {
        lifeType: lifeType.name,
        currentScore: 50,
        sceneNumber: 1
      })

      // 内容审核
      const moderationResult = await moderator.checkContent(aiResponse.content)
      if (!moderationResult.isSafe) {
        throw new Error('生成的内容包含不当信息')
      }

      // 创建场景节点
      const sceneNode: SceneNode = {
        id: '', // 将在数据库插入后设置
        lifeTypeId: lifeType.id,
        sceneNumber: 1,
        title: '游戏开始',
        description: aiResponse.content,
        aiGeneratedContent: aiResponse.content,
        choices: aiResponse.choices,
        nextSceneRules: {},
        isEndingScene: false,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 保存到数据库
      const { data: sceneData, error: sceneError } = await supabase
        .from('scene_nodes')
        .insert(sceneNode)
        .select()
        .single()

      if (sceneError) {
        throw new Error('保存场景失败')
      }

      return sceneData
    } catch (error) {
      console.error('生成初始场景失败:', error)
      throw error
    }
  }

  // 处理玩家选择
  async makeChoice(sessionId: string, choiceIndex: number): Promise<{
    newScore: number
    reasoning: string
    nextScene: SceneNode | null
    gameState: 'playing' | 'completed' | 'abandoned'
    isEnding: boolean
    achievements: string[]
    scoreChange: number
    endReason: string
    endingType: 'victory' | 'defeat' | 'timeout' | 'choice'
  }> {
    try {
      // 获取当前游戏会话
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (sessionError || !session) {
        throw new Error('游戏会话不存在')
      }

      // 获取当前场景
      const { data: currentScene, error: sceneError } = await supabase
        .from('scene_nodes')
        .select('*')
        .eq('id', session.current_scene_id)
        .single()

      if (sceneError || !currentScene) {
        throw new Error('当前场景不存在')
      }

      // 获取选择信息
      const choice = currentScene.choices[choiceIndex]
      if (!choice) {
        throw new Error('无效的选择')
      }

      // 计算新分数
      const scoreChange = choice.scoreImpact
      const newScore = clampScore(session.current_score + scoreChange)

      // 生成推理分析
      const reasoningPrompt = `请分析以下选择的影响：

选择：${choice.text}
当前分数：${session.current_score}
场景：${currentScene.description}
分数变化：${scoreChange > 0 ? '+' : ''}${scoreChange}

请分析这个选择对游戏进程的影响，并给出分数变化的理由。`

      const reasoning = await aiService.generateReasoning(reasoningPrompt, {
        choice: choice.text,
        currentScore: session.current_score,
        sceneDescription: currentScene.description,
        scoreChange
      })

      // 检查成就
      const achievements = await this.checkAchievements(session, newScore, currentScene)

      // 记录玩家选择
      const playerChoice: PlayerChoice = {
        id: '', // 将在数据库插入后设置
        sessionId,
        sceneId: currentScene.id,
        choiceIndex,
        choiceText: choice.text,
        scoreImpact: choice.scoreImpact,
        reasoningSummary: reasoning,
        aiPromptUsed: reasoningPrompt,
        createdAt: new Date().toISOString()
      }

      // 保存选择记录
      await supabase
        .from('player_choices')
        .insert(playerChoice)

      // 更新游戏会话
      const updatedSession: any = {
        current_score: newScore,
        last_activity_at: new Date().toISOString(),
        choices_made: [...session.choices_made, playerChoice]
      }

      // 检查游戏是否结束
      const endResult = this.checkGameEnding(newScore, currentScene, session)
      const isEnding = endResult.isEnding
      const endReason = endResult.reason
      
      if (isEnding) {
        updatedSession.game_state = 'completed'
        updatedSession.completed_at = new Date().toISOString()
        updatedSession.end_reason = endReason
      }

      await supabase
        .from('game_sessions')
        .update(updatedSession)
        .eq('id', session.id)

      // 生成下一个场景（如果游戏未结束）
      let nextScene: SceneNode | null = null
      if (!isEnding) {
        nextScene = await this.generateNextScene(currentScene, newScore, session.life_type_id)
        
        // 更新会话的当前场景
        await supabase
          .from('game_sessions')
          .update({ current_scene_id: nextScene.id })
          .eq('id', session.id)
      }

      return {
        newScore,
        reasoning,
        nextScene,
        gameState: isEnding ? 'completed' : 'playing',
        isEnding,
        achievements,
        scoreChange,
        endReason: endReason,
        endingType: endResult.endingType
      }
    } catch (error) {
      console.error('处理玩家选择失败:', error)
      throw error
    }
  }

  // 生成下一个场景
  private async generateNextScene(currentScene: SceneNode, currentScore: number, lifeTypeId: string): Promise<SceneNode> {
    try {
      // 构建AI提示词
      const prompt = `你是一个专业的游戏情节设计师。请根据以下信息生成下一个场景：

当前场景：${currentScene.description}
当前分数：${currentScore}
场景编号：${currentScene.sceneNumber + 1}

请生成一个符合游戏主题的新场景，包含场景描述和3-5个选择选项。每个选项应该有不同的分数影响。`

      // 使用AI生成场景
      const aiResponse = await aiService.generateScene(prompt, {
        currentScore,
        sceneNumber: currentScene.sceneNumber + 1
      })

      // 内容审核
      const moderationResult = await moderator.checkContent(aiResponse.content)
      if (!moderationResult.isSafe) {
        throw new Error('生成的内容包含不当信息')
      }

      // 创建场景节点
      const sceneNode: SceneNode = {
        id: '', // 将在数据库插入后设置
        lifeTypeId,
        sceneNumber: currentScene.sceneNumber + 1,
        title: `场景 ${currentScene.sceneNumber + 1}`,
        description: aiResponse.content,
        aiGeneratedContent: aiResponse.content,
        choices: aiResponse.choices,
        nextSceneRules: {},
        isEndingScene: false,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 保存到数据库
      const { data: sceneData, error: sceneError } = await supabase
        .from('scene_nodes')
        .insert(sceneNode)
        .select()
        .single()

      if (sceneError) {
        throw new Error('保存场景失败')
      }

      return sceneData
    } catch (error) {
      console.error('生成下一个场景失败:', error)
      throw error
    }
  }

  // 获取游戏会话
  async getGameSession(sessionId: string): Promise<GameSession | null> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (error || !data) {
        return null
      }

      return data
    } catch (error) {
      console.error('获取游戏会话失败:', error)
      return null
    }
  }

  // 获取当前场景
  async getCurrentScene(sessionId: string): Promise<SceneNode | null> {
    try {
      const session = await this.getGameSession(sessionId)
      if (!session || !session.currentSceneId) {
        return null
      }

      const { data, error } = await supabase
        .from('scene_nodes')
        .select('*')
        .eq('id', session.currentSceneId)
        .single()

      if (error || !data) {
        return null
      }

      return data
    } catch (error) {
      console.error('获取当前场景失败:', error)
      return null
    }
  }

  // 检查成就
  private async checkAchievements(session: any, newScore: number, currentScene: SceneNode): Promise<string[]> {
    try {
      const achievements: string[] = []
      
      // 获取所有成就
      const { data: allAchievements, error } = await supabase
        .from('achievements')
        .select('*')

      if (error || !allAchievements) {
        return achievements
      }

      // 检查每个成就
      for (const achievement of allAchievements) {
        const isUnlocked = await this.evaluateAchievement(achievement, session, newScore, currentScene)
        if (isUnlocked) {
          achievements.push(achievement.id)
          
          // 记录成就解锁
          await supabase
            .from('session_achievements')
            .insert({
              session_id: session.id,
              achievement_id: achievement.id
            })
        }
      }

      return achievements
    } catch (error) {
      console.error('检查成就失败:', error)
      return []
    }
  }

  // 评估成就条件
  private async evaluateAchievement(achievement: any, session: any, newScore: number, currentScene: SceneNode): Promise<boolean> {
    try {
      // 检查是否已经解锁
      const { data: existing } = await supabase
        .from('session_achievements')
        .select('id')
        .eq('session_id', session.id)
        .eq('achievement_id', achievement.id)
        .single()

      if (existing) {
        return false // 已经解锁
      }

      // 根据成就条件评估
      switch (achievement.id) {
        case 'first-choice':
          return session.choices_made.length >= 1
        case 'high-score':
          return newScore >= 80
        case 'low-score':
          return newScore <= 20
        case 'long-game':
          return currentScene.sceneNumber >= 10
        case 'perfect-game':
          return newScore >= 100
        default:
          return false
      }
    } catch (error) {
      console.error('评估成就失败:', error)
      return false
    }
  }

  // 检查游戏结束条件
  private checkGameEnding(score: number, currentScene: SceneNode, session: any): {
    isEnding: boolean
    reason: string
    endingType: 'victory' | 'defeat' | 'timeout' | 'choice'
  } {
    // 分数结束条件
    if (score >= 100) {
      return {
        isEnding: true,
        reason: '恭喜！你的人生获得了巨大成功！',
        endingType: 'victory'
      }
    }
    
    if (score <= 0) {
      return {
        isEnding: true,
        reason: '很遗憾，你的人生遇到了重大挫折...',
        endingType: 'defeat'
      }
    }

    // 场景结束条件
    if (currentScene.isEndingScene) {
      return {
        isEnding: true,
        reason: '你的人生走到了一个重要的转折点...',
        endingType: 'choice'
      }
    }

    // 时间结束条件（可选）
    const maxScenes = 20
    if (currentScene.sceneNumber >= maxScenes) {
      return {
        isEnding: true,
        reason: '你的人生已经经历了足够多的选择，是时候总结一下了...',
        endingType: 'timeout'
      }
    }

    return {
      isEnding: false,
      reason: '',
      endingType: 'choice'
    }
  }
}

// 导出单例实例
export const gameEngine = GameEngine.getInstance()
