import OpenAI from 'openai'
import { AIPrompt, AIResponse, ModerationResult } from '@/types/game'

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-api-key',
  baseURL: process.env.OPENAI_BASE_URL || undefined, // 如果未设置则使用默认的OpenAI API地址
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
            content: '你是一个专业的游戏情节设计师。请根据用户提供的信息生成游戏场景，包含场景描述和3-5个选择选项。\n\n要求：\n- 场景描述：控制在150-300字以内\n- 每个选择选项：控制在20-50字以内，要具体、有意义\n- 选择选项应该结合剧情场景，给出具体的行动方案\n- 不要使用"继续前进"、"谨慎行事"、"大胆尝试"等通用词汇\n- 每个选项都应该结合当前场景，给出明确的行动描述\n- 不要显示分值，让玩家根据具体情况判断\n- 确保内容简洁明了，便于玩家快速理解\n\n请按以下格式输出：\n场景描述：[你的场景描述]\n\n选择选项：\n1. [具体行动选项1]\n2. [具体行动选项2]\n3. [具体行动选项3]\n4. [具体行动选项4]\n5. [具体行动选项5]'
          },
          {
            role: 'user',
            content: this.replaceVariables(prompt, variables)
          }
        ],
        temperature: 0.8,
        max_tokens: 2000, // 增加token限制以支持更长的内容
      })

      const content = response.choices[0]?.message?.content || ''
      const result = this.parseAIResponse(content)
      
      // 缓存结果
      this.cache.set(cacheKey, result)
      this.manageCache()
      
      return result
    } catch (error: any) {
      console.error('AI场景生成失败:', error)
      
      // 处理速率限制错误
      if (error.status === 429 || error.code === 429) {
        throw new Error('AI服务暂时繁忙，请稍后重试')
      }
      
      // 处理其他AI错误
      if (error.message?.includes('Rate limit') || error.message?.includes('quota')) {
        throw new Error('AI服务暂时繁忙，请稍后重试')
      }
      
      throw new Error(`场景生成遇到问题，请稍后重试`)
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
            content: '你是一个专业的游戏设计师。请为给定的场景生成3-5个选择选项。\n\n要求：\n- 每个选择选项：控制在20-50字以内，要具体、有意义\n- 选择选项应该反映真实的人生决策，给出具体的行动方案\n- 不要使用"继续前进"、"谨慎行事"、"大胆尝试"等通用词汇\n- 每个选项都应该有明确的行动描述，如"直接申请这个职位"、"先做兼职积累经验"等\n- 不要显示分值，让玩家根据具体情况判断\n- 确保选项简洁明了，便于玩家快速决策'
          },
          {
            role: 'user',
            content: this.replaceVariables(prompt, variables)
          }
        ],
        temperature: 0.7,
        max_tokens: 1500, // 增加token限制以支持更长的选择内容
      })

      const content = response.choices[0]?.message?.content || ''
      const result = this.parseAIResponse(content)
      
      // 缓存结果
      this.cache.set(cacheKey, result)
      this.manageCache()
      
      return result
    } catch (error: any) {
      console.error('AI选择生成失败:', error)
      
      // 处理速率限制错误
      if (error.status === 429 || error.code === 429) {
        throw new Error('AI服务暂时繁忙，请稍后重试')
      }
      
      // 处理其他AI错误
      if (error.message?.includes('Rate limit') || error.message?.includes('quota')) {
        throw new Error('AI服务暂时繁忙，请稍后重试')
      }
      
      throw new Error(`选择生成遇到问题，请稍后重试`)
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
            content: '你是一个专业的游戏分析师。请分析玩家选择的影响，并给出分数变化的理由。\n\n要求：\n- 推理分析：控制在100-200字以内\n- 根据选择的具体内容和当前情况，智能评估分数影响\n- 不要预设固定的分值模式（如"大胆尝试"一定加分）\n- 考虑选择的实际效果：成功的选择加分，失败的选择扣分\n- 确保分析简洁有力，便于玩家理解选择的影响'
          },
          {
            role: 'user',
            content: this.replaceVariables(prompt, variables)
          }
        ],
        temperature: 0.6,
        max_tokens: 800, // 增加token限制以支持更长的推理内容
      })

      const result = response.choices[0]?.message?.content || ''
      
      // 缓存结果
      this.cache.set(cacheKey, result)
      this.manageCache()
      
      return result
    } catch (error: any) {
      console.error('AI推理生成失败:', error)
      
      // 处理速率限制错误
      if (error.status === 429 || error.code === 429) {
        throw new Error('AI服务暂时繁忙，请稍后重试')
      }
      
      // 处理其他AI错误
      if (error.message?.includes('Rate limit') || error.message?.includes('quota')) {
        throw new Error('AI服务暂时繁忙，请稍后重试')
      }
      
      throw new Error(`推理分析遇到问题，请稍后重试`)
    }
  }

  // 内容审核
  async moderateContent(content: string): Promise<ModerationResult> {
    try {
      // 检查是否使用OpenRouter（不支持内容审核）
      if (process.env.OPENAI_BASE_URL && process.env.OPENAI_BASE_URL.includes('openrouter.ai')) {
        console.warn('OpenRouter不支持内容审核API，跳过审核')
        return {
          isSafe: true,
          categories: [],
          confidence: 0,
          details: null
        }
      }

      const response = await openai.moderations.create({
        input: content,
      })

      // 检查响应结构
      if (!response || !response.results || !Array.isArray(response.results) || response.results.length === 0) {
        console.warn('内容审核API返回异常结构，默认认为内容安全')
        return {
          isSafe: true,
          categories: [],
          confidence: 0,
          details: null
        }
      }

      const result = response.results[0]
      
      // 检查结果结构
      if (!result || typeof result.flagged !== 'boolean') {
        console.warn('内容审核结果结构异常，默认认为内容安全')
        return {
          isSafe: true,
          categories: [],
          confidence: 0,
          details: null
        }
      }
      
      return {
        isSafe: !result.flagged,
        categories: Object.keys(result.categories || {}).filter(
          key => result.categories[key as keyof typeof result.categories]
        ),
        confidence: Math.max(...Object.values(result.category_scores || {})),
        details: result
      }
    } catch (error) {
      console.error('内容审核失败:', error)
      // 审核失败时默认通过
      return {
        isSafe: true,
        categories: [],
        confidence: 0,
        details: null
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
      console.log('AI原始响应:', content)
      
      // 尝试解析JSON格式的响应
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        console.log('解析JSON响应:', parsed)
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
      let sceneContent = ''
      let isInChoices = false
      let isInSceneDescription = false

      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // 检查是否是场景描述开始
        if (trimmedLine.startsWith('场景描述') || trimmedLine.startsWith('场景：')) {
          isInSceneDescription = true
          isInChoices = false
          const sceneText = trimmedLine.replace(/^(场景描述|场景)[:：]\s*/, '')
          if (sceneText) {
            sceneContent = sceneText
          }
          continue
        }
        
        // 检查是否是选择选项开始
        if (trimmedLine.startsWith('选择选项') || trimmedLine.startsWith('选择：') || trimmedLine.startsWith('选项：')) {
          isInChoices = true
          isInSceneDescription = false
          continue
        }
        
        // 检查是否是选择选项
        if (isInChoices && trimmedLine.match(/^\d+\./)) {
          const choiceMatch = trimmedLine.match(/(\d+)\.\s*(.+?)(?:\s*\(([+-]?\d+)\))?/)
          if (choiceMatch) {
            const choiceText = choiceMatch[2].trim()
            // 过滤掉无效的选择文本
            if (choiceText && choiceText !== '*' && choiceText.length > 1) {
              choices.push({
                text: choiceText,
                scoreImpact: choiceMatch[3] ? parseInt(choiceMatch[3]) : 0,
                reasoning: ''
              })
            }
          }
        } else if (isInSceneDescription && trimmedLine && !trimmedLine.startsWith('选择')) {
          // 收集场景描述内容
          if (sceneContent) {
            sceneContent += '\n' + trimmedLine
          } else {
            sceneContent = trimmedLine
          }
        } else if (trimmedLine.startsWith('理由') || trimmedLine.startsWith('分析')) {
          reasoning = trimmedLine.replace(/^(理由|分析)[:：]\s*/, '')
        } else if (trimmedLine.startsWith('下一场景')) {
          nextSceneId = trimmedLine.replace(/^下一场景[:：]\s*/, '')
        }
      }

      // 如果没有找到场景内容，使用原始内容
      if (!sceneContent) {
        sceneContent = content
      }

      console.log('解析结果:', { sceneContent, choices, reasoning })

      // 如果解析失败或选择选项无效，抛出错误
      if (choices.length === 0 || choices.every(choice => !choice.text || choice.text === '*')) {
        console.log('AI响应解析失败，选项无效')
        throw new Error('场景内容生成遇到问题，请稍后重试')
      }

      return {
        content: sceneContent,
        choices: choices,
        reasoning: reasoning,
        nextSceneId
      }
    } catch (error) {
      console.error('解析AI响应失败:', error)
      console.log('原始内容:', content)
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
