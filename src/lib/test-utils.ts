// 测试工具函数
import { gameEngine } from './game-engine'
import { aiService } from './ai'
import { moderator } from './moderator'

export class TestUtils {
  // 测试AI服务
  static async testAIService(): Promise<{
    success: boolean
    errors: string[]
    results: any
  }> {
    const errors: string[] = []
    const results: any = {}

    try {
      // 测试场景生成
      const scenePrompt = '你是一个专业的游戏情节设计师。请生成一个创业人生的初始场景。'
      const sceneResult = await aiService.generateScene(scenePrompt, {
        lifeType: '创业人生',
        currentScore: 50,
        sceneNumber: 1
      })
      results.sceneGeneration = sceneResult

      // 测试选择生成
      const choicePrompt = '请为以下场景生成3个选择选项：你正在考虑是否接受一个投资机会。'
      const choiceResult = await aiService.generateChoices(choicePrompt, {
        currentScore: 50
      })
      results.choiceGeneration = choiceResult

      // 测试推理分析
      const reasoningPrompt = '请分析选择"接受投资"的影响。'
      const reasoningResult = await aiService.generateReasoning(reasoningPrompt, {
        choice: '接受投资',
        currentScore: 50
      })
      results.reasoning = reasoningResult

      // 测试内容审核
      const content = '这是一个正常的游戏内容，没有任何问题。'
      const moderationResult = await moderator.checkContent(content)
      results.moderation = moderationResult

    } catch (error) {
      errors.push(`AI服务测试失败: ${error}`)
    }

    return {
      success: errors.length === 0,
      errors,
      results
    }
  }

  // 测试游戏引擎
  static async testGameEngine(): Promise<{
    success: boolean
    errors: string[]
    results: any
  }> {
    const errors: string[] = []
    const results: any = {}

    try {
      // 测试开始游戏
      const gameSession = await gameEngine.startGame('entrepreneur-life')
      results.gameStart = gameSession

      // 测试获取游戏会话
      const session = await gameEngine.getGameSession(gameSession.sessionId)
      results.sessionRetrieval = session

      // 测试获取当前场景
      const scene = await gameEngine.getCurrentScene(gameSession.sessionId)
      results.sceneRetrieval = scene

    } catch (error) {
      errors.push(`游戏引擎测试失败: ${error}`)
    }

    return {
      success: errors.length === 0,
      errors,
      results
    }
  }

  // 测试完整游戏流程
  static async testFullGameFlow(): Promise<{
    success: boolean
    errors: string[]
    results: any
  }> {
    const errors: string[] = []
    const results: any = {}

    try {
      // 1. 开始游戏
      const gameSession = await gameEngine.startGame('entrepreneur-life')
      results.gameStart = gameSession

      // 2. 获取初始场景
      const initialScene = await gameEngine.getCurrentScene(gameSession.sessionId)
      results.initialScene = initialScene

      // 3. 做出选择
      const choiceResult = await gameEngine.makeChoice(gameSession.sessionId, 0)
      results.firstChoice = choiceResult

      // 4. 检查游戏状态
      const updatedSession = await gameEngine.getGameSession(gameSession.sessionId)
      results.updatedSession = updatedSession

      // 5. 检查是否结束
      if (choiceResult.isEnding) {
        results.gameEnded = true
        results.endReason = choiceResult.endReason
        results.endingType = choiceResult.endingType
      }

    } catch (error) {
      errors.push(`完整游戏流程测试失败: ${error}`)
    }

    return {
      success: errors.length === 0,
      errors,
      results
    }
  }

  // 测试性能
  static async testPerformance(): Promise<{
    success: boolean
    errors: string[]
    results: any
  }> {
    const errors: string[] = []
    const results: any = {}

    try {
      // 测试AI调用性能
      const startTime = Date.now()
      await aiService.generateScene('测试场景生成', {})
      const aiTime = Date.now() - startTime
      results.aiGenerationTime = aiTime

      // 测试内容审核性能
      const moderationStartTime = Date.now()
      await moderator.checkContent('测试内容审核')
      const moderationTime = Date.now() - moderationStartTime
      results.moderationTime = moderationTime

      // 测试游戏引擎性能
      const gameStartTime = Date.now()
      await gameEngine.startGame('entrepreneur-life')
      const gameTime = Date.now() - gameStartTime
      results.gameStartTime = gameTime

    } catch (error) {
      errors.push(`性能测试失败: ${error}`)
    }

    return {
      success: errors.length === 0,
      errors,
      results
    }
  }

  // 运行所有测试
  static async runAllTests(): Promise<{
    success: boolean
    results: any
    summary: {
      totalTests: number
      passedTests: number
      failedTests: number
      testResults: any[]
    }
  }> {
    const testResults: any[] = []
    let totalTests = 0
    let passedTests = 0
    let failedTests = 0

    // AI服务测试
    totalTests++
    const aiTest = await this.testAIService()
    testResults.push({ name: 'AI服务测试', ...aiTest })
    if (aiTest.success) passedTests++; else failedTests++

    // 游戏引擎测试
    totalTests++
    const engineTest = await this.testGameEngine()
    testResults.push({ name: '游戏引擎测试', ...engineTest })
    if (engineTest.success) passedTests++; else failedTests++

    // 完整游戏流程测试
    totalTests++
    const flowTest = await this.testFullGameFlow()
    testResults.push({ name: '完整游戏流程测试', ...flowTest })
    if (flowTest.success) passedTests++; else failedTests++

    // 性能测试
    totalTests++
    const performanceTest = await this.testPerformance()
    testResults.push({ name: '性能测试', ...performanceTest })
    if (performanceTest.success) passedTests++; else failedTests++

    return {
      success: failedTests === 0,
      results: {
        aiTest: aiTest.results,
        engineTest: engineTest.results,
        flowTest: flowTest.results,
        performanceTest: performanceTest.results
      },
      summary: {
        totalTests,
        passedTests,
        failedTests,
        testResults
      }
    }
  }
}
