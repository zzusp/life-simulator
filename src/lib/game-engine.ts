import { supabase, supabaseAdmin } from './supabase'
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
      const { data: lifeTypeData, error: lifeTypeError } = await supabase
        .from('life_types')
        .select('*')
        .eq('id', lifeTypeId)
        .eq('is_active', true)
        .single()

      if (lifeTypeError || !lifeTypeData) {
        throw new Error('人生类型不存在或已禁用')
      }

      // 转换数据库字段名为前端期望的格式
      const lifeType: LifeType = {
        id: lifeTypeData.id,
        name: lifeTypeData.name,
        description: lifeTypeData.description,
        worldviewPrompt: lifeTypeData.worldview_prompt,
        initialIdentity: lifeTypeData.initial_identity,
        resources: lifeTypeData.resources,
        constraints: lifeTypeData.constraints,
        mainGoals: lifeTypeData.main_goals || [], // 确保是数组
        isActive: lifeTypeData.is_active,
        version: lifeTypeData.version,
        createdAt: lifeTypeData.created_at,
        updatedAt: lifeTypeData.updated_at
      }

      // 创建游戏会话
      const sessionId = generateSessionId()
      const gameSession = {
        session_id: sessionId,
        life_type_id: lifeTypeId,
        current_score: 50,
        game_state: 'playing',
        current_scene_id: null,
        choices_made: [],
        achievements_unlocked: [],
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        completed_at: null
      }

      // 保存到数据库（匿名用户可以创建游戏会话）
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
      
      // 更新会话的当前场景（匿名用户可以更新自己的游戏会话）
      await supabase
        .from('game_sessions')
        .update({ current_scene_id: initialScene.id })
        .eq('id', sessionData.id)

      // 转换数据库字段名为前端期望的格式
      return {
        id: sessionData.id,
        sessionId: sessionData.session_id,
        lifeTypeId: sessionData.life_type_id,
        currentScore: sessionData.current_score,
        gameState: sessionData.game_state,
        currentSceneId: initialScene.id,
        choicesMade: sessionData.choices_made || [],
        achievementsUnlocked: sessionData.achievements_unlocked || [],
        startedAt: sessionData.started_at,
        lastActivityAt: sessionData.last_activity_at,
        completedAt: sessionData.completed_at
      }
    } catch (error) {
      console.error('开始游戏失败:', error)
      throw error
    }
  }

  // 生成初始场景
  private async generateInitialScene(lifeType: LifeType, sessionId: string): Promise<SceneNode> {
    try {
      // 首先检查是否已存在该人生类型的初始场景
      const { data: existingScene, error: queryError } = await supabase
        .from('scene_nodes')
        .select('*')
        .eq('life_type_id', lifeType.id)
        .eq('scene_number', 1)
        .single()

      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = 没有找到记录
        console.error('查询现有场景失败:', queryError)
        throw new Error('查询现有场景失败')
      }

      // 如果已存在初始场景，直接返回
      if (existingScene) {
        console.log('使用现有初始场景:', existingScene.id)
        return {
          id: existingScene.id,
          lifeTypeId: existingScene.life_type_id,
          sceneNumber: existingScene.scene_number,
          title: existingScene.title,
          description: existingScene.description,
          aiGeneratedContent: existingScene.ai_generated_content,
          choices: existingScene.choices,
          nextSceneRules: existingScene.next_scene_rules,
          isEndingScene: existingScene.is_ending_scene,
          version: existingScene.version,
          createdAt: existingScene.created_at,
          updatedAt: existingScene.updated_at
        }
      }

      // 如果不存在，则创建新的初始场景
      console.log('创建新的初始场景')
      
      // 构建AI提示词
      const prompt = `你是一个专业的游戏情节设计师。请为以下人生类型生成初始场景：

人生类型：${lifeType.name}
世界观：${lifeType.worldviewPrompt}
初始身份：${lifeType.initialIdentity}
资源：${JSON.stringify(lifeType.resources)}
限制：${JSON.stringify(lifeType.constraints)}
主要目标：${lifeType.mainGoals.join(', ')}

请生成一个引人入胜的初始场景，包含场景描述和3-5个选择选项。

要求：
- 场景描述：控制在150-300字以内
- 每个选择选项：控制在20-50字以内，要具体、有意义
- 选择选项应该结合剧情场景，给出具体的行动方案
- 不要使用"继续前进"、"谨慎行事"、"大胆尝试"等通用词汇
- 每个选项都应该结合当前场景，给出明确的行动描述
- 不要显示分值，让玩家根据具体情况判断
- 确保内容简洁明了，便于玩家快速理解

请按以下格式输出：
场景描述：[你的场景描述]

选择选项：
1. [具体行动选项1]
2. [具体行动选项2]
3. [具体行动选项3]
4. [具体行动选项4]
5. [具体行动选项5]`

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
      const sceneNode = {
        life_type_id: lifeType.id,
        scene_number: 1,
        title: '游戏开始',
        description: aiResponse.content,
        ai_generated_content: aiResponse.content,
        choices: aiResponse.choices,
        next_scene_rules: {},
        is_ending_scene: false,
        version: 1
      }

      // 保存到数据库（匿名用户可以创建场景节点）
      const { data: sceneData, error: sceneError } = await supabase
        .from('scene_nodes')
        .insert(sceneNode)
        .select()
        .single()

      if (sceneError) {
        console.error('保存场景失败:', sceneError)
        throw new Error(`保存场景失败: ${sceneError.message || '未知错误'}`)
      }

      // 转换数据库字段名为前端期望的格式
      return {
        id: sceneData.id,
        lifeTypeId: sceneData.life_type_id,
        sceneNumber: sceneData.scene_number,
        title: sceneData.title,
        description: sceneData.description,
        aiGeneratedContent: sceneData.ai_generated_content,
        choices: sceneData.choices,
        nextSceneRules: sceneData.next_scene_rules,
        isEndingScene: sceneData.is_ending_scene,
        version: sceneData.version,
        createdAt: sceneData.created_at,
        updatedAt: sceneData.updated_at
      }
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
      // 确保场景编号有效
      const currentSceneNumber = currentScene.sceneNumber || 1
      const nextSceneNumber = currentSceneNumber + 1
      
      // 构建AI提示词
      const prompt = `你是一个专业的游戏情节设计师。请根据以下信息生成下一个场景：

当前场景：${currentScene.description}
当前分数：${currentScore}
场景编号：${nextSceneNumber}

请生成一个符合游戏主题的新场景，包含场景描述和3-5个选择选项。

要求：
- 场景描述：控制在150-300字以内
- 每个选择选项：控制在20-50字以内，要具体、有意义
- 选择选项应该结合剧情场景，给出具体的行动方案
- 不要使用"继续前进"、"谨慎行事"、"大胆尝试"等通用词汇
- 每个选项都应该结合当前场景，给出明确的行动描述
- 不要显示分值，让玩家根据具体情况判断
- 确保内容简洁明了，便于玩家快速理解

请按以下格式输出：
场景描述：[你的场景描述]

选择选项：
1. [具体行动选项1]
2. [具体行动选项2]
3. [具体行动选项3]
4. [具体行动选项4]
5. [具体行动选项5]`

      // 使用AI生成场景
      const aiResponse = await aiService.generateScene(prompt, {
        currentScore,
        sceneNumber: nextSceneNumber
      })

      // 内容审核
      const moderationResult = await moderator.checkContent(aiResponse.content)
      if (!moderationResult.isSafe) {
        throw new Error('生成的内容包含不当信息')
      }

      // 为后续场景使用唯一的场景编号，避免冲突
      // 使用重试机制确保唯一性
      let uniqueSceneNumber: number
      let attempts = 0
      const maxAttempts = 10
      
      do {
        const timestamp = Date.now()
        const randomSuffix = Math.floor(Math.random() * 10000)
        uniqueSceneNumber = nextSceneNumber * 100000 + timestamp % 100000 + randomSuffix
        
        // 检查是否已存在相同的场景编号
        const { data: existingScene } = await supabase
          .from('scene_nodes')
          .select('id')
          .eq('life_type_id', lifeTypeId)
          .eq('scene_number', uniqueSceneNumber)
          .single()
        
        if (!existingScene) {
          break // 找到了唯一的场景编号
        }
        
        attempts++
        if (attempts >= maxAttempts) {
          throw new Error('无法生成唯一的场景编号')
        }
      } while (attempts < maxAttempts)

      // 创建场景节点（使用数据库字段名）
      const sceneNode = {
        life_type_id: lifeTypeId,
        scene_number: uniqueSceneNumber,
        title: `场景 ${nextSceneNumber}`,
        description: aiResponse.content,
        ai_generated_content: aiResponse.content,
        choices: aiResponse.choices,
        next_scene_rules: {},
        is_ending_scene: false,
        version: 1
      }

      // 保存到数据库
      const { data: sceneData, error: sceneError } = await supabase
        .from('scene_nodes')
        .insert(sceneNode)
        .select()
        .single()

      if (sceneError) {
        console.error('保存场景失败:', sceneError)
        throw new Error(`保存场景失败: ${sceneError.message || '未知错误'}`)
      }

      // 转换数据库字段名为前端期望的格式
      return {
        id: sceneData.id,
        lifeTypeId: sceneData.life_type_id,
        sceneNumber: nextSceneNumber, // 返回逻辑场景编号
        title: sceneData.title,
        description: sceneData.description,
        aiGeneratedContent: sceneData.ai_generated_content,
        choices: sceneData.choices,
        nextSceneRules: sceneData.next_scene_rules,
        isEndingScene: sceneData.is_ending_scene,
        version: sceneData.version,
        createdAt: sceneData.created_at,
        updatedAt: sceneData.updated_at
      }
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

      // 转换数据库字段名为前端期望的格式
      return {
        id: data.id,
        sessionId: data.session_id,
        lifeTypeId: data.life_type_id,
        currentScore: data.current_score,
        gameState: data.game_state,
        currentSceneId: data.current_scene_id,
        choicesMade: data.choices_made || [],
        achievementsUnlocked: data.achievements_unlocked || [],
        startedAt: data.started_at,
        lastActivityAt: data.last_activity_at,
        completedAt: data.completed_at
      }
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

      // 转换数据库字段名为前端期望的格式
      return {
        id: data.id,
        lifeTypeId: data.life_type_id,
        sceneNumber: data.scene_number,
        title: data.title,
        description: data.description,
        aiGeneratedContent: data.ai_generated_content,
        choices: data.choices,
        nextSceneRules: data.next_scene_rules,
        isEndingScene: data.is_ending_scene,
        version: data.version,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
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

      // 根据数据库中的成就条件评估
      const conditions = achievement.unlock_conditions
      if (!conditions || typeof conditions !== 'object') {
        return false
      }

      // 根据成就类型评估条件
      switch (conditions.type) {
        case 'first_game':
          return session.choices_made && session.choices_made.length >= 1
        case 'high_score':
          return newScore >= (conditions.score || 80)
        case 'perfect_score':
          return newScore >= (conditions.score || 100)
        case 'multiple_life_types':
          // 这里需要查询用户玩过的人生类型数量
          // 暂时返回false，需要实现用户历史查询
          return false
        case 'consecutive_games':
          // 这里需要查询用户连续游戏次数
          // 暂时返回false，需要实现用户历史查询
          return false
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
