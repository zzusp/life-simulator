import { supabase, supabaseAdmin } from './supabase'
import { aiService } from './ai'
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
      // 每次都生成新的初始场景，给玩家新鲜感
      console.log('生成全新的初始场景')
      
      // 添加随机种子以增加场景多样性
      const randomSeed = Math.floor(Math.random() * 10000)
      
      // 构建AI提示词
      const prompt = `[场景生成请求 #${randomSeed}]

请为以下人生类型生成一个全新的、独特的初始场景：

【人生类型设定】
- 名称：${lifeType.name}
- 世界观：${lifeType.worldviewPrompt}
- 初始身份：${lifeType.initialIdentity}
- 初始资源：${JSON.stringify(lifeType.resources)}
- 限制条件：${JSON.stringify(lifeType.constraints)}
- 主要目标：${lifeType.mainGoals.join(', ')}

【重要：多样性要求】
- 请发挥创意，生成一个与众不同的开场情节
- 可以从不同的时间点、不同的事件、不同的场景氛围切入
- 确保每次生成的场景都有新鲜感和独特性
- 场景应该引人入胜，让玩家快速代入角色

【生成要求】
- 场景描述：控制在150-300字以内，要具体生动
- 生成3-5个选择选项，每个选项20-50字
- 每个选项都要有明确的行动描述和对应的分数影响（-10, -5, 0, 5, 10）
- 每个选项要有"选择后的走向说明"，描述这个选择会带来什么结果
- 不要使用"继续前进"、"谨慎行事"、"大胆尝试"等通用词汇`

      // 使用AI生成场景
      const aiResponse = await aiService.generateScene(prompt, {
        lifeType: lifeType.name,
        currentScore: 50,
        sceneNumber: 1
      })

      // 内容审核已移除，减少API调用

      // 为初始场景生成唯一的scene_number（使用时间戳+随机数）
      const timestamp = Date.now()
      const randomSuffix = Math.floor(Math.random() * 10000)
      const uniqueSceneNumber = 1 * 100000 + timestamp % 100000 + randomSuffix

      // 创建场景节点
      const sceneNode = {
        life_type_id: lifeType.id,
        scene_number: uniqueSceneNumber,
        title: '游戏开始',
        description: aiResponse.content,
        ai_generated_content: aiResponse.content,
        choices: aiResponse.choices,
        next_scene_rules: { logicalSceneNumber: 1 },
        is_ending_scene: false,
        version: 1
      }

      // 插入新场景
      console.log('准备插入新场景...')
      const { data: sceneData, error: sceneError } = await supabaseAdmin
        .from('scene_nodes')
        .insert(sceneNode)
        .select()
        .single()

      if (sceneError) {
        console.error('保存场景失败:', sceneError)
        console.error('场景节点内容:', JSON.stringify(sceneNode, null, 2))
        throw new Error(`保存场景失败: ${sceneError.message || '未知错误'}`)
      }
      
      console.log('场景保存成功，ID:', sceneData?.id)

      // 转换数据库字段名为前端期望的格式
      return {
        id: sceneData.id,
        lifeTypeId: sceneData.life_type_id,
        sceneNumber: sceneData.next_scene_rules?.logicalSceneNumber || 1,
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

      // 使用选项自带的reasoning（AI生成选项时已提供）
      const reasoning = choice.reasoning || '你做出了选择'

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
        aiPromptUsed: '', // 不再需要AI推理
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
        nextScene = await this.generateNextScene(
          currentScene, 
          newScore, 
          session.life_type_id,
          choice
        )
        
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
  private async generateNextScene(
    currentScene: SceneNode, 
    currentScore: number, 
    lifeTypeId: string,
    playerChoice?: { text: string; scoreImpact: number; reasoning: string }
  ): Promise<SceneNode> {
    try {
      // 确保场景编号有效
      const currentSceneNumber = currentScene.sceneNumber || 1
      const nextSceneNumber = currentSceneNumber + 1
      
      // 构建AI提示词，包含玩家选择的信息
      let choiceContext = ''
      if (playerChoice) {
        choiceContext = `
玩家的选择：${playerChoice.text}
选择结果：${playerChoice.reasoning}
分数变化：${playerChoice.scoreImpact > 0 ? '+' : ''}${playerChoice.scoreImpact}分

`
      }
      
      const prompt = `请根据以下信息生成下一个场景：

【上一个场景】
${currentScene.description}

${choiceContext}【当前状态】
- 当前分数：${currentScore}
- 场景编号：${nextSceneNumber}

【生成要求】
- 新场景必须基于玩家在上个场景的选择和结果来展开，确保故事的连贯性
- 场景描述应该体现出玩家选择的影响和后续发展
- 场景描述：控制在150-300字以内，要具体生动
- 生成3-5个选择选项，每个选项20-50字
- 每个选项都要有明确的行动描述和对应的分数影响（-10, -5, 0, 5, 10）
- 每个选项要有"选择后的走向说明"，描述这个选择会带来什么结果`

      // 使用AI生成场景
      const aiResponse = await aiService.generateScene(prompt, {
        currentScore,
        sceneNumber: nextSceneNumber
      })

      // 内容审核已移除，减少API调用

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
        next_scene_rules: { logicalSceneNumber: nextSceneNumber },
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
        sceneNumber: data.next_scene_rules?.logicalSceneNumber || data.scene_number,
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
