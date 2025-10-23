import { aiService } from './ai'
import { ModerationResult } from '@/types/game'

// 内容审核服务类
export class ModeratorService {
  private static instance: ModeratorService
  private cache = new Map<string, ModerationResult>()

  private constructor() {}

  static getInstance(): ModeratorService {
    if (!ModeratorService.instance) {
      ModeratorService.instance = new ModeratorService()
    }
    return ModeratorService.instance
  }

  // 检查内容是否安全
  async checkContent(content: string): Promise<ModerationResult> {
    // 检查缓存
    const cacheKey = `moderation_${content}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // 使用AI服务进行内容审核
      const result = await aiService.moderateContent(content)
      
      // 缓存结果
      this.cache.set(cacheKey, result)
      
      return result
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

  // 检查内容是否安全（同步方法）
  isContentSafe(result: ModerationResult): boolean {
    return result.isSafe
  }

  // 获取内容标签
  getContentTags(result: ModerationResult): string[] {
    return result.categories
  }

  // 检查内容是否包含敏感词
  checkSensitiveWords(content: string): boolean {
    const sensitiveWords = [
      '暴力', '血腥', '色情', '赌博', '毒品', '仇恨', '歧视',
      '政治', '宗教', '恐怖', '自杀', '自残', '虐待'
    ]

    return sensitiveWords.some(word => content.includes(word))
  }

  // 检查内容长度
  checkContentLength(content: string, maxLength: number = 1000): boolean {
    return content.length <= maxLength
  }

  // 检查内容格式
  checkContentFormat(content: string): boolean {
    // 检查是否包含必要的游戏元素
    const hasChoices = content.includes('选择') || content.includes('选项')
    const hasDescription = content.length > 50
    const hasValidStructure = content.includes('：') || content.includes(':')

    return hasChoices && hasDescription && hasValidStructure
  }

  // 综合内容检查
  async comprehensiveCheck(content: string): Promise<{
    isSafe: boolean
    isAppropriate: boolean
    isWellFormatted: boolean
    issues: string[]
    suggestions: string[]
  }> {
    const issues: string[] = []
    const suggestions: string[] = []

    // 安全检查
    const moderationResult = await this.checkContent(content)
    if (!moderationResult.isSafe) {
      issues.push('内容包含不当信息')
      suggestions.push('请修改内容，避免包含敏感信息')
    }

    // 敏感词检查
    if (this.checkSensitiveWords(content)) {
      issues.push('内容包含敏感词汇')
      suggestions.push('请移除敏感词汇，使用更合适的表达')
    }

    // 长度检查
    if (!this.checkContentLength(content)) {
      issues.push('内容过长')
      suggestions.push('请缩短内容，保持在1000字以内')
    }

    // 格式检查
    if (!this.checkContentFormat(content)) {
      issues.push('内容格式不符合要求')
      suggestions.push('请确保内容包含场景描述和选择选项')
    }

    return {
      isSafe: moderationResult.isSafe,
      isAppropriate: !this.checkSensitiveWords(content),
      isWellFormatted: this.checkContentFormat(content),
      issues,
      suggestions
    }
  }

  // 过滤不当内容
  filterContent(content: string): string {
    let filteredContent = content

    // 替换敏感词
    const sensitiveWords = [
      '暴力', '血腥', '色情', '赌博', '毒品', '仇恨', '歧视'
    ]

    sensitiveWords.forEach(word => {
      const regex = new RegExp(word, 'gi')
      filteredContent = filteredContent.replace(regex, '***')
    })

    // 移除HTML标签
    filteredContent = filteredContent.replace(/<[^>]*>/g, '')

    // 移除特殊字符
    filteredContent = filteredContent.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s.,!?]/g, '')

    return filteredContent
  }

  // 生成安全的内容建议
  generateSafeContent(content: string): string {
    const suggestions = [
      '请确保内容积极向上，传递正能量',
      '避免涉及暴力、色情等不当内容',
      '保持内容的趣味性和教育性',
      '确保选择选项有意义，能够影响游戏进程'
    ]

    return suggestions.join('\n')
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear()
  }

  // 获取缓存大小
  getCacheSize(): number {
    return this.cache.size
  }
}

// 导出单例实例
export const moderator = ModeratorService.getInstance()
