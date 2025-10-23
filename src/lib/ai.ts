import OpenAI from 'openai'
import { AIPrompt, AIResponse, ModerationResult } from '@/types/game'

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-api-key',
})

// AI服务类
export class AIService {
  private static instance: AIService
  private cache = new Map<string, any>()

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  // 生成场景内容
  async generateScene(prompt: string, variables: Record<string, any> = {}): Promise<AIResponse> {
    const cacheKey = `scene_${JSON.stringify({ prompt, variables })}`
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的游戏情节设计师。请根据用户提供的信息生成游戏场景，包含场景描述和3-5个选择选项。每个选项应该有不同的分数影响。'
          },
          {
            role: 'user',
            content: this.replaceVariables(prompt, variables)
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content || ''
      const result = this.parseAIResponse(content)
      
      // 缓存结果
      this.cache.set(cacheKey, result)
      this.manageCache()
      
      return result
    } catch (error) {
      console.error('AI场景生成失败:', error)
      throw new Error('AI场景生成失败')
    }
  }

  // 生成选择选项
  async generateChoices(prompt: string, variables: Record<string, any> = {}): Promise<AIResponse> {
    const cacheKey = `choices_${JSON.stringify({ prompt, variables })}`
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的游戏设计师。请为给定的场景生成3-5个选择选项，每个选项应该有不同的分数影响和理由。'
          },
          {
            role: 'user',
            content: this.replaceVariables(prompt, variables)
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      })

      const content = response.choices[0]?.message?.content || ''
      const result = this.parseAIResponse(content)
      
      // 缓存结果
      this.cache.set(cacheKey, result)
      this.manageCache()
      
      return result
    } catch (error) {
      console.error('AI选择生成失败:', error)
      throw new Error('AI选择生成失败')
    }
  }

  // 生成推理分析
  async generateReasoning(prompt: string, variables: Record<string, any> = {}): Promise<string> {
    const cacheKey = `reasoning_${JSON.stringify({ prompt, variables })}`
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的游戏分析师。请分析玩家选择的影响，并给出分数变化的理由。'
          },
          {
            role: 'user',
            content: this.replaceVariables(prompt, variables)
          }
        ],
        temperature: 0.6,
        max_tokens: 500,
      })

      const result = response.choices[0]?.message?.content || ''
      
      // 缓存结果
      this.cache.set(cacheKey, result)
      this.manageCache()
      
      return result
    } catch (error) {
      console.error('AI推理生成失败:', error)
      throw new Error('AI推理生成失败')
    }
  }

  // 内容审核
  async moderateContent(content: string): Promise<ModerationResult> {
    try {
      const response = await openai.moderations.create({
        input: content,
      })

      const result = response.results[0]
      
      return {
        isSafe: !result.flagged,
        categories: Object.keys(result.categories).filter(
          key => result.categories[key as keyof typeof result.categories]
        ),
        confidence: Math.max(...Object.values(result.category_scores)),
        details: result
      }
    } catch (error) {
      console.error('内容审核失败:', error)
      // 审核失败时默认通过
      return {
        isSafe: true,
        categories: [],
        confidence: 0,
        details: {}
      }
    }
  }

  // 替换变量
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`
      result = result.replace(new RegExp(placeholder, 'g'), String(value))
    }
    
    return result
  }

  // 解析AI响应
  private parseAIResponse(content: string): AIResponse {
    try {
      // 尝试解析JSON格式的响应
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          content: parsed.content || content,
          choices: parsed.choices || [],
          reasoning: parsed.reasoning || '',
          nextSceneId: parsed.nextSceneId
        }
      }

      // 解析文本格式的响应
      const lines = content.split('\n').filter(line => line.trim())
      const choices: any[] = []
      let reasoning = ''
      let nextSceneId: string | undefined

      for (const line of lines) {
        if (line.startsWith('选择') || line.startsWith('选项')) {
          const choiceMatch = line.match(/(\d+)\.\s*(.+?)\s*\(([+-]?\d+)\)/)
          if (choiceMatch) {
            choices.push({
              text: choiceMatch[2],
              scoreImpact: parseInt(choiceMatch[3]),
              reasoning: ''
            })
          }
        } else if (line.startsWith('理由') || line.startsWith('分析')) {
          reasoning = line.replace(/^(理由|分析)[:：]\s*/, '')
        } else if (line.startsWith('下一场景')) {
          nextSceneId = line.replace(/^下一场景[:：]\s*/, '')
        }
      }

      return {
        content: content,
        choices: choices.length > 0 ? choices : [
          { text: '继续前进', scoreImpact: 0, reasoning: '' },
          { text: '谨慎行事', scoreImpact: -5, reasoning: '谨慎的选择' },
          { text: '大胆尝试', scoreImpact: 10, reasoning: '勇敢的选择' }
        ],
        reasoning: reasoning,
        nextSceneId
      }
    } catch (error) {
      console.error('解析AI响应失败:', error)
      // 返回默认响应
      return {
        content: content,
        choices: [
          { text: '继续前进', scoreImpact: 0, reasoning: '' },
          { text: '谨慎行事', scoreImpact: -5, reasoning: '谨慎的选择' },
          { text: '大胆尝试', scoreImpact: 10, reasoning: '勇敢的选择' }
        ],
        reasoning: 'AI响应解析失败，使用默认选项',
        nextSceneId: undefined
      }
    }
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear()
  }

  // 获取缓存大小
  getCacheSize(): number {
    return this.cache.size
  }

  // 智能缓存管理
  private manageCache(): void {
    const maxCacheSize = 100
    if (this.cache.size > maxCacheSize) {
      // 清除最旧的缓存项
      const keys = Array.from(this.cache.keys())
      const keysToDelete = keys.slice(0, this.cache.size - maxCacheSize)
      keysToDelete.forEach(key => this.cache.delete(key))
    }
  }

  // 获取缓存统计
  getCacheStats(): {
    size: number
    hitRate: number
    maxSize: number
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // 可以添加命中率统计
      maxSize: 100
    }
  }
}

// 导出单例实例
export const aiService = AIService.getInstance()
