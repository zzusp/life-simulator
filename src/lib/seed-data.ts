import { LifeType } from '@/types/game'

// 示例人生类型数据
export const sampleLifeTypes: LifeType[] = [
  {
    id: 'entrepreneur-life',
    name: '创业人生',
    description: '从零开始创业，体验创业者的酸甜苦辣，面对投资、团队、市场等各种挑战。',
    initialIdentity: '刚毕业的大学生，怀揣创业梦想',
    worldviewPrompt: '现代商业社会，竞争激烈，机会与挑战并存',
    resources: {
      initialCapital: 100000,
      skills: ['基础商业知识', '沟通能力'],
      connections: ['大学同学', '导师']
    },
    constraints: {
      timeLimit: '5年内必须成功',
      riskTolerance: '中等',
      ethicalBoundaries: '必须合法合规'
    },
    mainGoals: [
      '建立成功的公司',
      '获得投资认可',
      '带领团队成长',
      '实现财务自由'
    ],
    isActive: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cultivation-life',
    name: '修真人生',
    description: '踏入修真世界，从凡人开始修炼，追求长生不老，体验修仙者的传奇人生。',
    initialIdentity: '普通凡人，意外获得修炼机会',
    worldviewPrompt: '修真世界，灵气充沛，强者为尊，弱肉强食',
    resources: {
      initialCapital: 0,
      skills: ['基础修炼法门'],
      connections: ['同门师兄弟', '师父']
    },
    constraints: {
      timeLimit: '无限制',
      riskTolerance: '极高',
      ethicalBoundaries: '弱肉强食，强者为尊'
    },
    mainGoals: [
      '突破境界',
      '获得强大法宝',
      '建立宗门',
      '追求长生不老'
    ],
    isActive: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ancient-life',
    name: '穿越古代人生',
    description: '穿越到古代，利用现代知识改变历史，体验古代社会的风土人情。',
    initialIdentity: '现代人，意外穿越到古代',
    worldviewPrompt: '古代社会，等级森严，知识就是力量',
    resources: {
      initialCapital: 0,
      skills: ['现代知识', '历史知识'],
      connections: ['无']
    },
    constraints: {
      timeLimit: '无限制',
      riskTolerance: '中等',
      ethicalBoundaries: '不能改变历史走向'
    },
    mainGoals: [
      '在古代立足',
      '传播现代知识',
      '改变历史进程',
      '建立自己的势力'
    ],
    isActive: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'corporate-life',
    name: '职场人生',
    description: '从职场新人开始，通过努力和智慧，在职场中步步高升，体验职场政治和人际关系。',
    initialIdentity: '刚入职的新员工',
    worldviewPrompt: '现代企业环境，竞争激烈，人际关系复杂',
    resources: {
      initialCapital: 5000,
      skills: ['专业技能', '沟通能力'],
      connections: ['同事', '上级']
    },
    constraints: {
      timeLimit: '10年内必须升职',
      riskTolerance: '低',
      ethicalBoundaries: '必须遵守公司规定'
    },
    mainGoals: [
      '获得晋升',
      '建立人脉',
      '提升技能',
      '实现职业目标'
    ],
    isActive: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'artist-life',
    name: '艺术人生',
    description: '追求艺术梦想，从默默无闻到成为知名艺术家，体验艺术创作的艰辛与快乐。',
    initialIdentity: '怀揣艺术梦想的年轻人',
    worldviewPrompt: '艺术世界，创意为王，才华决定一切',
    resources: {
      initialCapital: 2000,
      skills: ['基础艺术技能'],
      connections: ['艺术圈朋友', '导师']
    },
    constraints: {
      timeLimit: '无限制',
      riskTolerance: '高',
      ethicalBoundaries: '追求艺术真实'
    },
    mainGoals: [
      '创作出优秀作品',
      '获得艺术认可',
      '举办个人展览',
      '成为知名艺术家'
    ],
    isActive: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// 示例成就数据
export const sampleAchievements = [
  {
    id: 'first-choice',
    name: '初次选择',
    description: '做出第一个选择',
    points: 10,
    condition: 'choices_made >= 1'
  },
  {
    id: 'high-score',
    name: '高分达人',
    description: '分数达到80分以上',
    points: 50,
    condition: 'current_score >= 80'
  },
  {
    id: 'low-score',
    name: '低分专家',
    description: '分数低于20分',
    points: 30,
    condition: 'current_score <= 20'
  },
  {
    id: 'long-game',
    name: '持久战',
    description: '游戏进行超过10个场景',
    points: 40,
    condition: 'scene_count >= 10'
  },
  {
    id: 'perfect-game',
    name: '完美游戏',
    description: '分数达到100分',
    points: 100,
    condition: 'current_score >= 100'
  }
]
