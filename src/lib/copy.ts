/**
 * 全站文案统一管理
 * 按功能模块组织，便于维护与国际化扩展
 */

export const COPY = {
  // 通用文案
  common: {
    loading: '加载中...',
    loadingFailed: '加载失败',
    retry: '重试',
    back: '返回',
    backToHome: '返回首页',
    confirm: '确认',
    cancel: '取消',
  },

  // 首页
  home: {
    title: '人生模拟器',
    subtitle: '体验不同的人生，做出关键选择，看看你的选择会带你走向何方',
    startGame: '开始游戏',
    startGameAriaLabel: '开始游戏，前往选择人生类型页面',
  },

  // 游戏主页（选择人生类型）
  gameHome: {
    title: '人生模拟器',
    subtitle: '体验不同的人生，做出关键选择，看看你的选择会带你走向何方',
    selectLifeType: '选择你的人生类型',
    loadingLifeTypes: '加载人生类型中...',
    selectThisLife: '选择此人生',
    
    // 玩法说明
    gameplay: {
      title: '玩法说明',
      step1Title: '选择人生类型',
      step1Desc: '从创业人生、修真人生、穿越古代人生等多种类型中选择',
      step2Title: 'AI生成情节',
      step2Desc: '基于AI智能生成的情节节点和选择，每次都有不同的体验',
      step3Title: '分数系统',
      step3Desc: '0-100分系统，你的选择会影响分数，最终决定游戏结局',
    },

    // 游戏说明
    rules: {
      title: '游戏说明',
      rule1: '游戏完全匿名，无需注册登录',
      rule2: '每次选择都会影响你的分数（0-100分）',
      rule3: '分数达到100分或0分时游戏结束',
      rule4: '游戏状态会自动保存，可以随时继续',
      rule5: '所有内容都经过AI内容审核，确保安全',
    },
  },

  // 游戏场景
  scene: {
    scenePrefix: '场景',
    scoreLabel: '分数',
    chooseAction: '请选择你的行动：',
    processing: '处理选择中...',
    generatingNextScene: 'AI正在生成下一个场景...',
  },

  // 游戏结果
  result: {
    victory: '🎉 恭喜！你的人生获得了巨大成功！',
    defeat: '😔 很遗憾，你的人生遇到了重大挫折...',
    timeout: '⏰ 你的人生已经经历了足够多的选择...',
    draw: '🤔 你的人生还在继续...',
    
    victoryDesc: '你通过明智的选择和努力，实现了人生的目标！',
    defeatDesc: '虽然遇到了一些困难，但这也是人生的一部分。',
    timeoutDesc: '你的人生已经经历了足够多的选择，是时候总结一下了。',
    drawDesc: '你的人生还在进行中，继续努力吧！',
    
    gameStats: '游戏统计',
    finalScore: '最终分数',
    choicesMade: '做出选择',
    gameDuration: '游戏时长',
    
    lifeTypeInfo: '人生类型',
    initialIdentity: '初始身份',
    mainGoals: '主要目标',
    
    achievements: '解锁成就',
    choiceHistory: '选择历史',
    
    restart: '重新开始',
    viewHistory: '查看历史',
    shareResult: '分享结果',
  },

  // 分享页
  share: {
    title: '人生模拟器 - 游戏总结',
    subtitle: '看看这个玩家的人生选择结果',
    aboutGame: '关于人生模拟器',
    aboutDesc: '人生模拟器是一款基于AI的互动游戏，让你体验不同的人生选择。每次选择都会影响你的分数，最终决定你的人生结局。',
    features: {
      multipleTypes: '多种人生类型',
      aiGenerated: 'AI智能生成',
      scoreSystem: '分数系统',
    },
    startYourGame: '开始你的游戏',
    shareNotFound: '分享链接不存在或已过期',
    checkShareLink: '请检查分享链接是否正确',
  },

  // 历史页
  history: {
    title: '游戏历史',
    subtitle: '查看你的所有游戏记录',
    loadingHistory: '加载历史记录中...',
    
    emptyTitle: '暂无游戏记录',
    emptyDesc: '开始你的第一个游戏，体验不同的人生选择',
    
    completedAt: '完成时间',
    duration: '游戏时长',
    choices: '选择次数',
    
    loadMore: '点击加载更多',
    loadingMore: '加载更多...',
    allLoaded: '已显示全部记录',
    
    backToList: '返回历史列表',
    viewDetail: '查看游戏记录',
  },

  // 历史详情
  historyDetail: {
    title: '游戏详情',
    loadingDetail: '加载游戏详情中...',
    lifeSetup: '人生设定',
    choiceJourney: '选择历程',
    yourChoice: '你的选择',
    scoreChange: '分数',
    playAgain: '再来一局',
    recordNotFound: '游戏记录不存在',
  },

  // 错误处理
  error: {
    loadFailed: '加载失败',
    startGameFailed: '开始游戏失败',
    processingFailed: '处理失败',
    shareFailed: '分享失败',
    notFound: '内容不存在',
    networkError: '网络错误，请检查网络连接',
    unknownError: '未知错误',
  },

  // 分数标签
  scoreLabel: {
    excellent: '卓越',      // >= 90
    good: '优秀',          // >= 80
    average: '良好',       // >= 70
    passing: '及格',       // >= 60
    belowAverage: '一般',  // >= 40
    poor: '需要努力',      // < 40
  },
} as const

export type CopyKeys = typeof COPY

