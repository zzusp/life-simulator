# AI生成个性化人生总结 - 快速开始指南

**Date**: 2025-10-28  
**Feature**: AI生成个性化人生总结功能  
**Purpose**: 帮助开发者快速理解此功能并开始实施

## 功能概述

在游戏结算页面使用AI结合玩家的完整游戏数据（场景描述、选择路径、分数变化等）生成个性化人生总结，替代当前简单的固定文案。

## 核心目标

- 提升用户体验：提供个性化、有意义的总结而非通用消息
- 增强游戏价值：总结应反映玩家的实际游戏历程和关键决策
- 保持性能：总结生成应在3-5秒内完成

## 技术架构

### 数据流

```
玩家完成游戏
    ↓
GameSession (包含完整 choicesMade)
    ↓
构建AI Prompt (包含所有场景+选择+统计)
    ↓
调用 AI 服务生成总结
    ↓
解析并显示总结 (200-400字符)
```

### 关键文件位置

**需要修改的文件**:
- `src/components/game/GameResult.tsx` - 结算页面组件（显示AI总结）
- `src/app/api/game/summary/route.ts` - AI总结生成API（新建）

**可能修改的文件**:
- `src/lib/ai.ts` - AI服务封装（如需新增总结生成方法）
- `src/types/game.ts` - 类型定义（如需新增AIGeneratedSummary类型）

## 实施步骤

### 阶段1: API开发

1. 创建 `/api/game/summary/route.ts`
   - 接收 sessionId
   - 从数据库获取完整游戏数据
   - 构建AI prompt（包含所有场景、选择、统计）
   - 调用AI服务生成总结
   - 缓存生成的总结
   - 返回总结文本

2. 实现Fallback机制
   - AI超时（>5秒）→ 返回预设总结
   - AI错误 → 返回基于统计的智能备用总结
   - 空响应 → 返回模板化总结

### 阶段2: UI集成

1. 修改 `GameResult.tsx`
   - 添加AI总结显示区域（在现有标题下方）
   - 添加加载状态
   - 集成生成的总结
   - 处理异常显示

2. 优化体验
   - 异步加载总结（不阻塞页面）
   - 显示加载占位符
   - 总结生成失败的降级处理

### 阶段3: 优化

1. 性能优化
   - 实施总结缓存（相同session的重复查看）
   - 优化AI prompt长度
   - 减少响应时间

2. 质量优化
   - 测试不同结局类型的总结差异化
   - 验证语言风格一致性
   - 确保无不当内容

## AI Prompt设计

### 基础Prompt结构

```
你是一位人生导师，需要根据玩家的游戏经历生成个性化的人生总结。

游戏信息：
- 人生类型：[lifeType.name]
- 最终分数：[currentScore]/100
- 选择次数：[choicesMade.length]
- 游戏时长：[duration]

玩家的选择路径：
1. 场景1：[scene1.description]
   选择：[choice1.text]
   影响：分数[+/-X]
   
2. 场景2：[scene2.description]
   选择：[choice2.text]
   影响：分数[+/-X]
   
... (继续列出所有场景和选择)

请生成一个200-400字的个性化人生总结，要求：
1. 温暖、积极、富有诗意的语言
2. 体现玩家的关键决策和转折点
3. 避免使用"失败"、"错误"等负面词汇
4. 用"你"、"你的"等人称代词增强代入感
5. 根据最终分数给出合理评价
6. 突出玩家的特质（冒险型/保守型）

请直接返回总结文本，无需其他格式。
```

### 差异化Prompt

根据结局类型调整Prompt基调：
- **胜利**: 强调成就和成功要素
- **失败**: 使用建设性表述，强调成长
- **超时**: 强调经历的丰富性
- **选择**: 突出关键转折的意义

## 测试策略

### 单元测试

```typescript
describe('AI Summary Generation', () => {
  test('should generate summary within 5 seconds', async () => {
    const session = mockGameSession();
    const startTime = Date.now();
    const summary = await generateAISummary(session);
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000);
  });
  
  test('should generate unique summaries for different sessions', async () => {
    const session1 = mockGameSession({ choices: [...] });
    const session2 = mockGameSession({ choices: [...] });
    const summary1 = await generateAISummary(session1);
    const summary2 = await generateAISummary(session2);
    expect(summary1).not.toBe(summary2);
  });
});
```

### 集成测试

- 测试完整的API调用流程
- 测试AI服务异常的降级处理
- 测试缓存机制
- 测试不同游戏数据的总结质量

### 手动测试

- 完成多局不同类型的游戏
- 验证总结的准确性和个性化程度
- 检查语言风格是否符合要求
- 测试不同结局类型的总结差异

## 性能优化建议

1. **Prompt优化**: 压缩场景描述，保留关键信息
2. **缓存策略**: 相同session的总结可复用
3. **异步加载**: 总结生成不阻塞页面渲染
4. **提示词工程**: 使用结构化输出，减少解析时间

## 潜在问题与解决方案

### 问题1: AI响应时间过长
**解决方案**: 
- 限制prompt长度（最多包含5-10个关键场景）
- 使用流式响应
- 设置5秒超时

### 问题2: 生成质量不稳定
**解决方案**:
- 使用严格的提示词模板
- 实施内容验证
- 使用fallback机制

### 问题3: API成本过高
**解决方案**:
- 实施缓存（相同游戏session复用总结）
- 优化prompt减少token使用
- 考虑使用更便宜的模型

## 下一步

1. 创建API路由文件
2. 实现AI生成逻辑
3. 修改UI组件
4. 添加测试
5. 性能优化

## 参考资源

- 现有AI服务: `src/lib/ai.ts`
- 游戏数据模型: `src/types/game.ts`
- 结算页面: `src/components/game/GameResult.tsx`

