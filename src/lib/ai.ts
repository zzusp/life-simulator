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

// 生成总结 —— 对外函数（供 API 使用）
export interface LifeSummaryChoice {
  choiceText: string
  scoreImpact: number
  createdAt?: string
  sceneTitle?: string
  sceneDescription?: string
  reasoningAfter?: string
}

export interface LifeSummaryInput {
  lifeTypeName: string
  finalScore: number
  choiceCount: number
  durationSeconds: number
  choices: LifeSummaryChoice[]
  outcome: string | null
  keyTurningPoints?: { index: number; sceneTitle?: string | null; choiceText: string; delta: number }[]
  allowedTitles?: string[]
  allowedChoiceTexts?: string[]
  attempt?: number
}

export async function generateLifeSummary(input: LifeSummaryInput): Promise<{
  summaryText: string
  model?: string
  tokensPrompt?: number
  tokensOutput?: number
  promptUsed: string
}> {
  const { lifeTypeName, finalScore, choiceCount, durationSeconds, choices, outcome, keyTurningPoints = [], allowedTitles = [], allowedChoiceTexts = [], attempt = 1 } = input

  const outcomeTone = outcome === 'victory'
    ? '以庆祝与成就的语气'
    : outcome === 'defeat'
    ? '以建设性与鼓励的语气'
    : outcome === 'timeout'
    ? '以旅程丰厚与多元的语气'
    : '以温暖与启发的语气'

  const contextDigest = choices
    .map((c, idx) => {
      const title = c.sceneTitle ? `《${c.sceneTitle}》` : '（无标题场景）'
      const desc = (c.sceneDescription || '').trim().slice(0, 40)
      const delta = `${c.scoreImpact >= 0 ? '+' : ''}${c.scoreImpact}`
      const after = c.reasoningAfter ? c.reasoningAfter.trim().slice(0, 60) : ''
      return `#${idx + 1} 场景${title}：${desc}… | 选择：“${c.choiceText}” | 分数：${delta} | 结果：${after}`
    })
    .join('\n')

  const turningLines = keyTurningPoints
    .map(t => `#${t.index} 「${t.choiceText}」(Δ${t.delta >= 0 ? '+' : ''}${t.delta})${t.sceneTitle ? `，场景「${t.sceneTitle}」` : ''}`)
    .join('；')

  const allowedHints = `可引用的合法标题（任选）：${allowedTitles.slice(0, 8).map(t => `《${t}》`).join('、') || '（无）'}；可引用的合法选择内容（任选）：${allowedChoiceTexts.slice(0, 8).map(c => `“${c}”`).join('、') || '（无）'}`

  const retryNote = attempt > 1 ? '（注意：上一版没有足够的具体引用，这一次必须在正文中点名至少 2 处具体证据）' : ''

  const prompt = `你是一位温暖的人生导师，需要根据玩家的完整游戏经历生成个性化的人生总结。${retryNote}\n\n【游戏信息】\n- 人生类型：${lifeTypeName}\n- 最终分数：${finalScore}/100\n- 选择次数：${choiceCount}\n- 游戏时长：${durationSeconds} 秒\n- 结局基调：${outcomeTone}\n\n【完整上下文（按时间顺序）】\n${contextDigest || '无记录'}\n\n【关键转折】${turningLines || '无'}\n\n【可引用提示】${allowedHints}\n\n【严格输出要求】\n- 只返回一个 JSON 对象，不要任何多余文本；\n- JSON 结构必须为：{\"summary\": \"……\"}；\n- summary 必须为 200–400 个汉字的一段连续中文文本；\n- 在 summary 正文中至少点名 2 处具体证据，使用以下两种方式之一：\n  1) 引用场景标题：形如《场景标题》；\n  2) 引用原“选择内容”：用中文引号“”括起；\n- 结合“结果”(reasoningAfter) 描述选择后的走向；\n- 语气积极温暖，避免负面词（失败/错误/糟糕 等）；\n- 严禁在 summary 中出现任何与要求/提示词/AI/模型/系统/用户/指令/token/长度/格式/生成/本文/重试等相关的元信息。`

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: '你是一个温暖而克制的中文写作者。必须仅返回 JSON 对象 {"summary":"..."}；不得包含与写作要求、AI、提示词或指令相关的任何元信息。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 700,
    response_format: { type: 'json_object' } as any,
  })

  const raw = response.choices?.[0]?.message?.content?.trim() || ''
  let extracted = raw
  try {
    // 尝试直接解析 JSON
    const obj = JSON.parse(raw)
    if (obj && typeof obj.summary === 'string') {
      extracted = obj.summary.trim()
    }
  } catch {
    // 兼容某些模型返回 JSON 前后带文字的情况
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const obj = JSON.parse(match[0])
        if (obj && typeof obj.summary === 'string') {
          extracted = obj.summary.trim()
        }
      } catch {
        // ignore
      }
    }
  }

  return {
    summaryText: extracted,
    model: (response as any)?.model,
    tokensPrompt: (response as any)?.usage?.prompt_tokens,
    tokensOutput: (response as any)?.usage?.completion_tokens,
    promptUsed: prompt,
  }
}
