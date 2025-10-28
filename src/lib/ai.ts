import OpenAI from 'openai'
import { AIPrompt, AIResponse } from '@/types/game'

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-api-key',
  baseURL: process.env.OPENAI_BASE_URL || undefined, // 如果未设置则使用默认的OpenAI API地址
  defaultHeaders: {
    'Authorization': `Bearer ${process.env.OPENAI_AUTH_TOKEN || process.env.OPENAI_API_KEY}`,
  },
  timeout: 60000, // 60秒超时
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
            content: '你是一个专业的游戏设计师。请为场景生成选择选项。\n\n要求：\n- 场景描述：控制在150-300字以内\n- 每个选择选项：控制在20-50字以内，要具体、有意义，并带有一定的趣味性\n- 选择选项应该反映于场景描述的世界中的人生决策，给出具体的行动方案\n- 不要使用"继续前进"、"谨慎行事"、"大胆尝试"等通用词汇\n- 每个选项都应该有明确的行动描述\n- 要给出分值，且分值的加减与选项内容、选择后走向的变化一致\n- 分值范围：-10（高风险高损失）、-5（中等损失）、0（无变化）、5（中等收益）、10（高风险高回报）\n- 确保选项简洁明了，便于玩家快速决策\n\n请严格按以下JSON格式输出场景描述和选项：\n{\n  "description": "场景描述文本",\n  "choices": [\n    {\n      "content": "选项内容",\n      "score": -10,\n      "after": "选择后的走向说明"\n    }\n  ]\n}'
          },
          {
            role: 'user',
            content: this.replaceVariables(prompt, variables)
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: "json_object" }
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
            content: '你是一个专业的游戏设计师。请为给定的场景生成3-5个选择选项。\n\n要求：\n- 每个选择选项：控制在20-50字以内，要具体、有意义，并带有一定的趣味性\n- 选择选项应该反映于场景描述的世界中的人生决策，给出具体的行动方案\n- 不要使用"继续前进"、"谨慎行事"、"大胆尝试"等通用词汇\n- 每个选项都应该有明确的行动描述\n- 要给出分值，且分值的加减与选项内容、选择后走向的变化一致\n- 分值范围：-10（高风险高损失）、-5（中等损失）、0（无变化）、5（中等收益）、10（高风险高回报）\n- 确保选项简洁明了，便于玩家快速决策\n\n请严格按以下JSON格式输出选项数组：\n{\n  "choices": [\n    {\n      "content": "选项内容",\n      "score": -10,\n      "after": "选择后的走向说明"\n    }\n  ]\n}'
          },
          {
            role: 'user',
            content: this.replaceVariables(prompt, variables)
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
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

        // 映射新的JSON结构到现有的Choice类型
        let mappedChoices: any[] = []
        if (parsed.choices && Array.isArray(parsed.choices)) {
          mappedChoices = parsed.choices.map((choice: any) => ({
            text: choice.content || choice.text || '',
            scoreImpact: choice.score !== undefined ? choice.score : (choice.scoreImpact || 0),
            reasoning: choice.after || choice.reasoning || ''
          }))
        }

        return {
          content: parsed.description || parsed.content || content,
          choices: mappedChoices,
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

      console.log('开始解析内容，共', lines.length, '行')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmedLine = line.trim()
        
        console.log(`处理第${i}行:`, trimmedLine)

        // 检查是否是场景描述开始
        if (trimmedLine.match(/^场景描述[：:]|^场景[：:]/)) {
          isInSceneDescription = true
          isInChoices = false
          const sceneText = trimmedLine.replace(/^(场景描述|场景)[：:]\s*/, '')
          if (sceneText) {
            sceneContent = sceneText
          }
          console.log('进入场景描述模式')
          continue
        }
        
        // 检查是否是选择选项开始
        if (trimmedLine.match(/^选择选项[：:]|^选择[：:]|^选项[：:]/)) {
          isInChoices = true
          isInSceneDescription = false
          console.log('进入选择选项模式')
          continue
        }
        
        // 检查是否是选择选项 - 简化匹配逻辑
        const choiceMatch = trimmedLine.match(/^(\d+)[.）)]\s*(.+)/)
        if (choiceMatch && isInChoices) {
          const choiceText = choiceMatch[2].trim()
          console.log('匹配到选择:', choiceText)
          if (choiceText && choiceText !== '*' && choiceText.length > 1) {
            choices.push({
              text: choiceText,
              scoreImpact: 0,
              reasoning: ''
            })
          }
          continue
        }

        // 收集场景描述内容
        if (isInSceneDescription && trimmedLine && !trimmedLine.startsWith('选择') &&
                   !trimmedLine.startsWith('选项') && !trimmedLine.match(/^\d+[.）)]/)) {
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

      // 如果还是没有找到选择，尝试在整个内容中查找编号列表
      if (choices.length === 0) {
        console.log('未找到选择，尝试全局搜索')
        for (const line of lines) {
          const trimmedLine = line.trim()
          const choiceMatch = trimmedLine.match(/^(\d+)[.）)]\s*(.+)/)
          if (choiceMatch) {
            const choiceText = choiceMatch[2].trim()
            console.log('全局匹配到选择:', choiceText)
            if (choiceText && choiceText !== '*' && choiceText.length > 1 &&
                !choiceText.match(/^(继续|谨慎|大胆)/)) {
              choices.push({
                text: choiceText,
                scoreImpact: 0,
                reasoning: ''
              })
            }
          }
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
      // 返回有意义的默认响应，而不是通用词汇
      return {
        content: content || '你来到了人生的十字路口，需要做出决定...',
        choices: [
          { text: '按照计划稳步推进', scoreImpact: 0, reasoning: '你选择了稳健的方式，避免了风险但也错过了机会。' },
          { text: '采取保守策略，降低风险', scoreImpact: -5, reasoning: '过度保守让你失去了宝贵的发展机会。' },
          { text: '敢于冒险，追求突破', scoreImpact: 10, reasoning: '你的大胆尝试获得了丰厚的回报！' }
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
