# Feature Specification: 人生模拟器游戏

**Feature Branch**: `001-life-simulator-game`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "构建一款"人生模拟器"游戏。核心玩法：- 玩家进入"人生类型"（例如：牛马人生 / 创业人生 / 修真人生 / 穿越古代人生 等），每种人生由一组提示词驱动（世界观、初始身份、资源、限制、主要目标）。- 游戏由若干"情节节点(Scene)"构成：每个节点包含背景描述（由 AI 根据提示词生成）、若干"选项(Choices)"。每个选项带有影响分值的规则（可以为正/负/中立），且可能改变后续提示词或触发额外情节。- 分值为 0~100 范围：任一时刻达到 100（或 0）视为终局（win/lose）。游戏也可按回合数或关键事件强制结束。- 所有提示词、情节模板、选项模板、分值规则均保存在 Supabase，支持在线编辑、版本回滚与 A/B 测试。- AI 用途：生成情节文本、生成候选选项、推理分值影响、生成理由摘要与下一节点提示词。AI 需要接受「场景上下文 + 人生提示词 + 玩家当前状态」作为 prompt。验收标准：- 能在同一人生类型下基于 DB 内容生成至少 30 个可玩节点，节点上线可配置。- 每次玩家选择后，系统输出：新的分值、理由摘要、下一个节点文本（或终局），并在 DB 记录决策与 prompt。- 后台能编辑提示词并立即影响新游戏（对进行中的游戏不破坏历史）。"

## Clarifications

### Session 2024-12-19

- Q: 玩家完成一局游戏后，系统如何激励玩家进行重玩？是否需要进度系统、成就系统或解锁机制？ → A: 简单成就系统（完成不同人生类型、达到特定分数等）
- Q: AI生成的内容如何确保与人生类型主题的一致性？是否需要预设模板、关键词过滤或人工审核机制？ → A: 完全依赖AI，通过严格prompt来限制内容质量和主题一致性
- Q: 玩家在游戏进行中关闭浏览器或网络中断时，系统如何处理游戏状态？是否需要自动保存、手动保存或重新开始？ → A: 自动保存+恢复
- Q: 游戏是否需要支持多人模式？比如好友对战、排行榜、分享游戏结果等社交功能？ → A: 基础社交功能（分享结果、简单排行榜）
- Q: 游戏是否需要用户注册登录？还是支持匿名游戏？如何处理用户数据隐私和游戏记录的关联？ → A: 完全匿名，无用户身份

### Session 2025-10-28 - 玩法体验优化

- Q: 选项是否应该显示分值给玩家？ → A: **否**，选择前不显示分值（保持悬念），选择后才显示分值和走向说明（满足反馈需求）
- Q: 如何让玩家了解自己选择的影响？ → A: 选择后展示三要素：1) 选择内容 2) 分值变化 3) 选择后的走向说明
- Q: AI生成选项时分值是否需要多样化？ → A: **是**，分值应在-10到+10范围内合理分布，避免都是0
- Q: 下一场景应该如何生成？ → A: 必须基于"当前场景描述 + 玩家选择 + 选择结果"生成，保持故事连贯性
- Q: 每次新游戏是否应该复用缓存的初始场景？ → A: **否**，每次都生成全新场景，提升重玩价值和新鲜感
- Q: 是否需要独立的内容审核API？ → A: **否**，通过AI提示词控制内容质量即可，避免不必要的API调用和系统复杂度

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 开始新游戏 (Priority: P1)

玩家选择人生类型并开始新的人生模拟游戏，系统生成初始场景和选项供玩家选择。

**Why this priority**: 这是游戏的核心入口，没有这个功能就无法进行任何游戏体验，是MVP的基础功能。

**Independent Test**: 可以独立测试玩家选择人生类型、系统生成初始场景、显示选项的完整流程，验证基础游戏循环是否正常工作。

**Acceptance Scenarios**:

1. **Given** 玩家访问游戏首页，**When** 选择"创业人生"类型，**Then** 系统显示初始身份、资源和目标，并生成第一个情节节点
2. **Given** 玩家选择了人生类型，**When** 点击"开始游戏"，**Then** 系统显示第一个场景描述和3-5个选项供选择
3. **Given** 玩家开始新游戏，**When** 系统初始化，**Then** 玩家分数为50，游戏状态为进行中
4. **Given** 玩家完成一局游戏，**When** 再次开始相同类型的新游戏，**Then** 系统生成全新的初始场景而非复用之前的场景（保持新鲜感）
5. **Given** 系统生成初始场景，**When** 显示选项，**Then** 选项不显示分值（保持悬念），但每个选项都有明确的行动描述

---

### User Story 2 - 做出选择并推进游戏 (Priority: P1)

玩家在情节节点中做出选择，系统计算分数影响并生成下一个场景。

**Why this priority**: 这是游戏的核心玩法循环，玩家做出选择后需要看到结果和新的场景，这是游戏体验的关键。

**Independent Test**: 可以独立测试玩家选择选项、系统计算分数、生成理由摘要、显示下一个场景的完整流程。

**Acceptance Scenarios**:

1. **Given** 玩家在场景中看到选项，**When** 点击某个选项，**Then** 该选项被高亮显示，其他选项被禁用
2. **Given** 玩家选择了选项，**When** 系统处理选择，**Then** 显示加载动画，并在动画中展示：
   - 玩家选择的内容（清晰展示）
   - 分数变化（+10/-5/0等，带颜色标识）
   - 选择后的走向说明（这个选择会带来什么影响）
3. **Given** 玩家当前分数为60，**When** 选择+10分的选项，**Then** 分数变为70，加载动画显示"+10分"及走向说明
4. **Given** 系统生成下一个场景，**When** 场景加载完成，**Then** 显示基于"前场景描述+玩家选择+选择结果"生成的新场景，确保故事连贯性
5. **Given** 玩家做出选择，**When** 系统处理，**Then** 在数据库中记录选择、分数变化和AI生成的提示词
6. **Given** 场景切换完成，**When** 新场景显示，**Then** 场景编号正确递增（场景1→场景2→场景3...），选项状态被重置

---

### User Story 2.5 - AI生成内容质量保证 (Priority: P1)

系统使用AI生成的场景和选项必须符合质量标准，确保玩家体验流畅。

**Why this priority**: AI生成内容的质量直接影响游戏体验，如果生成的内容不合理或不连贯，会严重影响玩家的游戏体验。

**Independent Test**: 可以独立测试AI生成的场景描述、选项文本、分值分布、走向说明是否符合质量标准。

**Acceptance Scenarios**:

1. **Given** AI生成选项，**When** 返回选项数据，**Then** 每个选项必须包含三要素：text（行动描述）、scoreImpact（分值）、reasoning（走向说明）
2. **Given** AI生成选项的分值，**When** 检查分值分布，**Then** 分值应在-10到+10范围内（-10/-5/0/+5/+10），不应该全部为0
3. **Given** AI生成场景描述，**When** 检查描述长度，**Then** 场景描述应在150-300字以内，选项描述应在20-50字以内
4. **Given** AI生成选项，**When** 检查选项质量，**Then** 选项应该有具体行动描述，避免"继续前进"、"谨慎行事"等通用词汇
5. **Given** AI生成下一个场景，**When** 基于玩家选择生成，**Then** 新场景必须体现玩家选择的影响，保持故事连贯性
6. **Given** AI生成初始场景，**When** 多次生成相同人生类型，**Then** 每次应生成不同的初始场景，提供新鲜感
7. **Given** AI生成内容，**When** 系统处理，**Then** 通过提示词控制内容质量和主题一致性，确保内容适当性
8. **Given** AI返回数据，**When** 解析响应，**Then** 响应必须是有效的JSON格式，包含所有必需字段

---

### User Story 3 - 游戏结束判定 (Priority: P1)

当玩家分数达到100或0时，系统判定游戏结束并显示结局。

**Why this priority**: 游戏必须有明确的结束条件，玩家需要知道游戏结果，这是完整游戏体验的必要部分。

**Independent Test**: 可以独立测试分数达到边界值时的游戏结束逻辑和结局显示。

**Acceptance Scenarios**:

1. **Given** 玩家分数为95，**When** 选择+10分选项，**Then** 分数达到100，系统显示胜利结局
2. **Given** 玩家分数为5，**When** 选择-10分选项，**Then** 分数达到0，系统显示失败结局
3. **Given** 游戏结束，**When** 系统处理，**Then** 显示最终分数、游戏时长和重玩选项

---

### User Story 4 - 管理员编辑游戏内容 (Priority: P2)

管理员可以编辑人生类型的提示词、场景模板和选项规则，修改立即影响新游戏。

**Why this priority**: 内容管理是游戏运营的关键，管理员需要能够调整游戏内容和平衡性，但不会影响正在进行的游戏。

**Independent Test**: 可以独立测试管理员登录、编辑内容、保存修改、验证新游戏使用更新内容的完整流程。

**Acceptance Scenarios**:

1. **Given** 管理员登录后台，**When** 编辑"创业人生"的提示词，**Then** 修改立即保存，新游戏使用更新后的内容
2. **Given** 管理员修改选项分值，**When** 保存更改，**Then** 新游戏使用新的分值规则，进行中的游戏不受影响
3. **Given** 管理员添加新的人生类型，**When** 配置完成，**Then** 玩家可以在首页看到新的人生类型选项

---

### User Story 5 - 游戏历史记录 (Priority: P3)

玩家可以查看游戏历史记录，包括选择路径、分数变化和游戏结果。

**Why this priority**: 历史记录功能增强用户体验，但不是核心游戏功能，可以作为后续优化功能。

**Independent Test**: 可以独立测试玩家查看历史记录、浏览游戏详情、分析选择路径的功能。

**Acceptance Scenarios**:

1. **Given** 玩家完成一局游戏，**When** 查看历史记录，**Then** 系统显示游戏类型、分数变化、选择路径和最终结果
2. **Given** 玩家有多个游戏记录，**When** 浏览历史，**Then** 系统按时间倒序显示所有游戏记录
3. **Given** 玩家查看特定游戏，**When** 点击详情，**Then** 系统显示该游戏的完整选择路径和分数变化曲线

### Edge Cases

- 当AI服务不可用时，系统如何处理？系统应该显示错误信息并提供重试选项，或者使用预设的备用场景
- 当玩家分数计算超出0-100范围时如何处理？系统应该将分数限制在有效范围内，并记录异常情况
- 当数据库中的场景模板损坏或缺失时如何处理？系统应该使用默认模板或显示错误信息
- 当玩家在游戏进行中刷新页面时如何处理？系统应该恢复游戏状态或提供继续游戏的选项
- 当AI生成的内容包含不当内容时如何处理？系统通过严格的提示词控制内容质量和主题一致性，避免生成不当内容（内容审核机制为可选功能，当前待实现）
- 当AI返回的JSON格式不正确时如何处理？系统应该进行容错解析，提取可用字段，或显示错误并重新生成
- 当AI生成的选项分值全部为0时如何处理？系统应该检测并拒绝此结果，要求AI重新生成
- 当场景切换时UI状态未重置时如何处理？系统必须在每次场景切换时正确重置选择状态、加载状态等
- 当场景编号显示不正确时如何处理？系统应该维护逻辑场景编号，与数据库唯一ID分离

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow players to select from available life types (创业人生, 修真人生, 穿越古代人生等)
- **FR-002**: System MUST generate initial game state with score 50, life type context, and first scene
- **FR-003**: System MUST display 3-5 choices per scene with clear descriptions WITHOUT showing score values before selection (to maintain suspense)
- **FR-004**: System MUST calculate score changes based on player choices and update game state
- **FR-005**: System MUST generate next scene using AI based on current context and player state
- **FR-006**: System MUST detect game end conditions (score 0, score 100, or maximum turns reached)
- **FR-007**: System MUST display game results with final score, duration, and replay options
- **FR-008**: System MUST persist all game sessions, choices, and AI prompts in database
- **FR-009**: System MUST allow administrators to edit life type prompts and scene templates
- **FR-010**: System MUST support version control for content changes without affecting ongoing games
- **FR-011**: System MUST generate at least 30 playable scenes per life type from database content
- **FR-012**: System MUST provide reasoning summary for each choice impact
- **FR-013**: System MUST handle AI service failures gracefully with fallback mechanisms
- **FR-014**: System MUST validate all user inputs and sanitize AI-generated content
- **FR-018**: System MUST use strict prompt engineering to ensure AI-generated content aligns with life type themes and maintains quality consistency
- **FR-015**: System MUST support A/B testing for different content versions
- **FR-016**: System MUST track player achievements (completing different life types, reaching specific scores, etc.)
- **FR-017**: System MUST display achievement progress and unlocked achievements to players
- **FR-019**: System MUST automatically save game state after each player choice and restore game state when player returns
- **FR-020**: System MUST allow players to share game results (final score, life type, key choices) via social media or direct links
- **FR-021**: System MUST maintain simple leaderboards showing top scores by life type and overall
- **FR-022**: System MUST support anonymous gameplay without requiring user registration or login
- **FR-023**: System MUST use session-based storage for game state and achievements without personal data collection

### Enhanced Functional Requirements (Based on Development Learnings)

#### Choice Feedback & Result Display Requirements (2025-10-28 Learnings)
- **FR-024-NEW**: System MUST hide score values from choices BEFORE player selection to maintain suspense and decision-making challenge
- **FR-025-NEW**: System MUST display comprehensive choice feedback AFTER selection including: 1) selected choice text, 2) score impact with color coding (+green, -red, 0-gray), 3) reasoning/consequence explanation
- **FR-026-NEW**: System MUST integrate choice feedback into loading animation overlay while generating next scene (utilizing wait time meaningfully)
- **FR-027-NEW**: System MUST disable all other choices immediately after player selection to prevent multiple submissions
- **FR-028-NEW**: System MUST visually highlight the selected choice before processing begins
- **FR-029-NEW**: System MUST properly reset UI state (selected choice, loading state) when transitioning to a new scene
- **FR-030-NEW**: System MUST maintain separate logical scene numbering (Scene 1, Scene 2...) independent from database unique IDs, stored in JSONB metadata

#### AI Content Generation Quality Requirements (2025-10-28 Learnings)
- **FR-031-NEW**: System MUST ensure AI-generated choices include all three required fields: text (action description), scoreImpact (numerical value), reasoning (consequence explanation)
- **FR-032-NEW**: System MUST validate that score values are distributed across the range (-10, -5, 0, +5, +10) and NOT all zero
- **FR-033-NEW**: System MUST ensure scene descriptions are 150-300 characters and choice descriptions are 20-50 characters
- **FR-034-NEW**: System MUST reject generic choice wording ("continue forward", "be cautious") and require specific action descriptions
- **FR-035-NEW**: System MUST generate next scene based on complete context: previous scene description + player's choice + choice consequence
- **FR-036-NEW**: System MUST generate unique initial scenes for each new game session (NO caching/reusing of first scenes) to maintain replayability
- **FR-037-NEW**: System MUST request AI responses in structured JSON format rather than free-text for reliable parsing
- **FR-038-NEW**: System MUST include randomization seeds or diversity instructions in AI prompts to ensure content variety

#### Performance & API Optimization Requirements (2025-10-28 Learnings)
- **FR-039-NEW**: System MUST minimize AI API calls to ONE per player choice (eliminate redundant reasoning generation or moderation calls)
- **FR-040-NEW**: System MUST reuse reasoning field from AI-generated choices directly without additional API calls
- **FR-041-NEW**: System SHOULD control content quality through prompt engineering rather than separate moderation API calls (content moderation as optional future feature)

### Original Enhanced Functional Requirements

#### User Experience & Navigation Requirements
- **FR-024**: System MUST provide clear URL structure with separate routes for game selection (`/game`) and game play (`/play/[sessionId]`)
- **FR-025**: System MUST implement graceful degradation when database is unavailable, falling back to sample data to ensure game continuity
- **FR-026**: System MUST provide intuitive navigation with clear page hierarchy and breadcrumb navigation
- **FR-027**: System MUST display loading states and progress indicators during AI content generation
- **FR-028**: System MUST provide immediate visual feedback for user actions (score changes, achievement unlocks)

#### Error Handling & Resilience Requirements
- **FR-029**: System MUST implement comprehensive error boundaries to catch and handle component-level errors gracefully
- **FR-030**: System MUST provide automatic retry mechanisms for failed AI service calls with exponential backoff
- **FR-031**: System MUST display user-friendly error messages with actionable recovery options
- **FR-032**: System MUST implement fallback content when AI services are unavailable
- **FR-033**: System MUST handle network interruptions and restore game state when connection is restored

#### Performance & Caching Requirements
- **FR-034**: System MUST implement intelligent caching for AI-generated content with configurable cache size limits
- **FR-035**: System MUST provide cache statistics and management capabilities for monitoring performance
- **FR-036**: System MUST implement asynchronous processing for user choices to prevent UI blocking
- **FR-037**: System MUST optimize AI API calls through intelligent caching and request batching
- **FR-038**: System MUST provide performance monitoring and metrics collection in development environment

#### Content Quality & Safety Requirements
- **FR-039**: System MUST implement multi-layer content moderation using OpenAI's moderation API
- **FR-040**: System MUST provide content filtering and sanitization for all AI-generated text
- **FR-041**: System MUST maintain high-quality sample data as fallback content for all life types
- **FR-042**: System MUST implement strict prompt engineering to ensure content consistency and theme alignment
- **FR-043**: System MUST provide content quality scoring and validation mechanisms

#### State Management & Persistence Requirements
- **FR-044**: System MUST implement automatic game state saving after each user choice
- **FR-045**: System MUST provide seamless game state restoration when users return to the game
- **FR-046**: System MUST implement session-based state management without requiring user authentication
- **FR-047**: System MUST handle concurrent game sessions without state conflicts
- **FR-048**: System MUST provide state validation and recovery mechanisms for corrupted sessions

#### Development & Maintenance Requirements
- **FR-049**: System MUST provide comprehensive logging and error reporting for debugging
- **FR-050**: System MUST implement modular architecture with clear separation of concerns
- **FR-051**: System MUST provide full TypeScript type safety across all components and APIs
- **FR-052**: System MUST implement comprehensive testing utilities and integration test endpoints
- **FR-053**: System MUST provide environment-specific configuration management with feature flags

#### Documentation & Knowledge Management Requirements
- **FR-054**: System MUST maintain structured documentation organization with separate directories for implementation reports
- **FR-055**: System MUST provide detailed implementation reports for each development phase
- **FR-056**: System MUST document all architectural decisions and their rationale
- **FR-057**: System MUST provide clear API documentation with examples and error codes
- **FR-058**: System MUST maintain version control for all documentation and code changes

#### User Engagement & Retention Requirements
- **FR-059**: System MUST implement achievement system with visual notifications and progress tracking
- **FR-060**: System MUST provide score animations and visual feedback for user actions
- **FR-061**: System MUST implement social sharing functionality with customizable share content
- **FR-062**: System MUST provide game result summaries with detailed statistics and insights
- **FR-063**: System MUST implement leaderboards with anonymous session tracking

#### Content Management & Administration Requirements
- **FR-064**: System MUST provide online content editing capabilities for administrators
- **FR-065**: System MUST implement version control for content changes without affecting ongoing games
- **FR-066**: System MUST provide A/B testing capabilities for different content versions
- **FR-067**: System MUST implement content audit trails and change tracking
- **FR-068**: System MUST provide content validation and quality assurance tools

#### Scalability & Monitoring Requirements
- **FR-069**: System MUST implement performance monitoring and alerting for production environments
- **FR-070**: System MUST provide database connection monitoring and automatic failover
- **FR-071**: System MUST implement rate limiting and abuse prevention mechanisms
- **FR-072**: System MUST provide comprehensive analytics and user behavior tracking
- **FR-073**: System MUST implement automated backup and recovery procedures

### Key Entities

- **LifeType**: 人生类型实体，包含提示词、初始身份、资源限制、主要目标等属性
- **GameSession**: 游戏会话实体，包含会话ID、人生类型、当前分数、游戏状态、开始时间等属性（匿名，无个人身份信息）
- **SceneNode**: 情节节点实体，包含场景ID、描述文本、选项列表、分值规则、下一节点ID等属性
  - **Enhanced (2025-10-28)**: `next_scene_rules` JSONB字段存储`logicalSceneNumber`（用户可见的场景编号），与数据库唯一ID分离
  - **Enhanced (2025-10-28)**: `choices`数组中每个选项必须包含三个字段：`text`（行动描述，20-50字）、`scoreImpact`（分值，范围-10到+10）、`reasoning`（走向说明）
  - **Enhanced (2025-10-28)**: 场景描述必须为150-300字，确保内容适中
- **PlayerChoice**: 玩家选择实体，包含选择ID、选项文本、分值影响、理由摘要、时间戳等属性
  - **Enhanced (2025-10-28)**: 必须包含完整的`reasoning`字段，用于向玩家展示选择后果
- **AIPrompt**: AI提示词实体，包含提示词内容、版本号、创建时间、使用次数等属性
  - **Enhanced (2025-10-28)**: 提示词必须要求AI返回JSON格式，包含`description`、`choices`（含`content`、`score`、`after`字段）
  - **Enhanced (2025-10-28)**: 提示词应包含前序场景和玩家选择上下文，确保故事连贯性
  - **Enhanced (2025-10-28)**: 提示词应包含多样性要求（如随机种子），避免重复内容
- **Achievement**: 成就实体，包含成就ID、名称、描述、解锁条件、奖励等属性
- **SessionAchievement**: 会话成就实体，包含会话ID、成就ID、解锁时间、进度等属性（匿名）
- **Leaderboard**: 排行榜实体，包含人生类型、会话ID、最高分数、排名、更新时间等属性（匿名）
- **SharedResult**: 分享结果实体，包含分享ID、游戏会话ID、分享内容、分享时间、访问次数等属性

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can complete a full game session (from start to end) in under 15 minutes
- **SC-002**: System generates unique and engaging content for at least 30 scenes per life type
- **SC-003**: 95% of player choices are processed and result in valid game state updates within 3 seconds
- **SC-004**: AI-generated content maintains quality standards through prompt engineering 95% of the time (content moderation as optional future feature)
- **SC-005**: System maintains game state consistency across page refreshes and browser sessions
- **SC-006**: Administrators can edit content and see changes reflected in new games within 1 minute
- **SC-007**: 90% of players complete at least one full game session on their first visit
- **SC-008**: System supports at least 100 concurrent game sessions without performance degradation
- **SC-009**: Game content variety ensures no two playthroughs are identical for the same life type
- **SC-010**: Database stores complete audit trail of all player decisions and AI interactions
- **SC-011**: System maintains complete anonymity - no personal data collection or user identification required
- **SC-012**: 95% of anonymous sessions complete successfully without requiring user registration

### Enhanced Success Criteria (Based on Development Learnings)

#### Choice Feedback & User Engagement Success Criteria (2025-10-28 Learnings)
- **SC-013-NEW**: 100% of choices hide score values before selection to maintain player suspense
- **SC-014-NEW**: 100% of selected choices display complete feedback (text + score + reasoning) during loading animation
- **SC-015-NEW**: 95% of players report satisfaction with the timing and clarity of choice feedback
- **SC-016-NEW**: 100% of scene transitions properly reset UI state without visual artifacts or stale data
- **SC-017-NEW**: Scene numbering displays correctly and sequentially (1, 2, 3...) in 100% of game sessions

#### AI Content Quality Success Criteria (2025-10-28 Learnings)
- **SC-018-NEW**: 95% of AI-generated choices include all three required fields (text, scoreImpact, reasoning)
- **SC-019-NEW**: 90% of AI-generated choice sets have varied score distribution (not all zeros)
- **SC-020-NEW**: 95% of scene descriptions meet length requirements (150-300 chars) and quality standards
- **SC-021-NEW**: 90% of choices use specific action descriptions rather than generic phrases
- **SC-022-NEW**: 95% of generated scenes demonstrate clear narrative continuity from previous scene and choice
- **SC-023-NEW**: 100% of new game sessions generate unique initial scenes (0% cache reuse rate)

#### Performance & Efficiency Success Criteria (2025-10-28 Learnings)
- **SC-024-NEW**: 100% of player choices result in exactly ONE AI API call (no redundant calls)
- **SC-025-NEW**: Average AI response time remains under 3 seconds for scene generation
- **SC-026-NEW**: System successfully parses 98% of AI JSON responses without fallback to error handling

#### Original User Experience & Navigation Success Criteria
- **SC-013**: 100% of users can navigate between game selection and game play pages without confusion
- **SC-014**: System maintains 99% uptime even when database services are unavailable through graceful degradation
- **SC-015**: 95% of users complete their first game session without requiring assistance or documentation
- **SC-016**: Page load times remain under 2 seconds for all game interactions
- **SC-017**: 90% of users report positive experience with visual feedback and animations

#### Error Handling & Resilience Success Criteria
- **SC-018**: System recovers from 95% of component-level errors without user intervention
- **SC-019**: AI service failures result in graceful fallback within 3 seconds
- **SC-020**: 99% of network interruptions are handled transparently without data loss
- **SC-021**: Error messages are clear and actionable for 90% of error scenarios
- **SC-022**: System maintains data consistency across all error recovery scenarios

#### Performance & Caching Success Criteria
- **SC-023**: AI content generation response time improves by 60% through intelligent caching
- **SC-024**: Cache hit rate exceeds 80% for frequently accessed content
- **SC-025**: System supports 200+ concurrent users without performance degradation
- **SC-026**: Memory usage remains stable (no memory leaks) during extended gameplay sessions
- **SC-027**: API response times remain under 1 second for 95% of requests

#### Content Quality & Safety Success Criteria
- **SC-028**: 99.5% of AI-generated content passes content moderation filters
- **SC-029**: Content quality scores average 8.5/10 based on automated quality metrics
- **SC-030**: Zero instances of inappropriate content reaching end users
- **SC-031**: Content consistency scores exceed 90% across all life types
- **SC-032**: Sample data quality matches or exceeds AI-generated content standards

#### State Management & Persistence Success Criteria
- **SC-033**: 100% of game state changes are automatically saved within 1 second
- **SC-034**: 99% of users can resume games after browser refresh or network interruption
- **SC-035**: Zero data loss incidents across 10,000+ game sessions
- **SC-036**: State recovery time remains under 2 seconds for 95% of scenarios
- **SC-037**: Concurrent session handling supports 100+ simultaneous games without conflicts

#### Development & Maintenance Success Criteria
- **SC-038**: 100% of code changes pass TypeScript type checking without errors
- **SC-039**: Test coverage exceeds 90% for all critical user paths
- **SC-040**: Development environment setup time reduced to under 10 minutes
- **SC-041**: Bug resolution time averages under 4 hours for critical issues
- **SC-042**: Code review process completes within 24 hours for all changes

#### Documentation & Knowledge Management Success Criteria
- **SC-043**: 100% of implementation phases have detailed documentation
- **SC-044**: New team members can understand system architecture within 2 hours of documentation review
- **SC-045**: API documentation covers 100% of endpoints with examples
- **SC-046**: Documentation updates are synchronized with code changes within 24 hours
- **SC-047**: Knowledge transfer sessions achieve 90% comprehension rate

#### User Engagement & Retention Success Criteria
- **SC-048**: 85% of users unlock at least one achievement during their first game
- **SC-049**: Average session duration increases by 40% with visual feedback improvements
- **SC-050**: 70% of users share their game results through social features
- **SC-051**: User return rate exceeds 60% within 7 days of first visit
- **SC-052**: Leaderboard participation reaches 80% of active users

#### Content Management & Administration Success Criteria
- **SC-053**: Content updates are reflected in new games within 1 minute of publication
- **SC-054**: A/B testing capabilities support 5+ concurrent content variations
- **SC-055**: Content audit trails capture 100% of administrative changes
- **SC-056**: Content validation prevents 99% of quality issues before publication
- **SC-057**: Administrator training time reduced to under 2 hours for content management

#### Scalability & Monitoring Success Criteria
- **SC-058**: System performance remains stable under 500+ concurrent users
- **SC-059**: Database failover completes within 30 seconds with zero data loss
- **SC-060**: Rate limiting prevents 100% of abuse attempts
- **SC-061**: Analytics capture 95% of user interactions for behavior analysis
- **SC-062**: Automated backup procedures achieve 99.9% success rate

## Development Learnings & Experience *(mandatory)*

### Key Insights from Implementation

#### 用户体验设计洞察
- **路由结构的重要性**: 清晰的URL结构直接影响用户体验。游戏选择页面(`/game`)和游戏进行页面(`/play/[sessionId]`)的分离让用户导航更直观
- **降级处理策略**: 当数据库连接失败时，使用示例数据确保游戏始终可用，这比显示错误页面更能保持用户参与度
- **匿名游戏的优势**: 完全匿名的设计降低了用户进入门槛，但需要特别注意状态管理和数据持久化

#### 技术架构经验
- **AI服务集成**: OpenAI API的集成需要仔细处理API密钥管理和错误处理。缓存机制对性能至关重要
- **状态管理**: Zustand提供了轻量级但强大的状态管理，特别适合游戏场景的复杂状态
- **类型安全**: 全栈TypeScript确保了代码质量，但需要仔细设计类型定义以避免运行时错误

#### 开发流程洞察
- **分阶段实施**: 将复杂功能分解为独立的用户故事(US1, US2, US3)使开发更可控
- **文档组织**: 将实施文档组织在`implements/`目录下提高了项目可维护性
- **错误处理**: 完善的错误边界和重试机制对AI驱动的应用至关重要

#### 内容生成经验
- **AI提示词工程**: 严格的提示词设计是确保内容质量和主题一致性的关键
- **内容审核**: 多层次的内容审核机制保护用户免受不当内容影响
- **示例数据**: 高质量的示例数据不仅用于开发测试，也是生产环境的降级方案

#### 性能优化洞察
- **缓存策略**: AI调用的智能缓存显著提升了响应速度和用户体验
- **异步处理**: 选择处理的异步设计避免了界面阻塞
- **状态持久化**: 游戏状态的自动保存和恢复对用户体验至关重要

#### 测试和质量保证
- **集成测试**: 完整的游戏流程测试比单元测试更能发现实际问题
- **用户体验测试**: 加载状态、错误提示、动画效果对用户满意度有重大影响
- **错误监控**: 开发环境的详细错误信息对调试至关重要

### 关键成功因素

#### 技术成功因素
- **模块化架构**: 清晰的组件分离使代码更易维护和扩展
- **类型安全**: 完整的TypeScript类型定义减少了运行时错误
- **错误处理**: 完善的错误边界和降级机制确保系统稳定性
- **API调用优化**: 每次操作只调用必要的AI接口，避免重复调用（如移除冗余的推理生成）
- **数据复用**: 选项自带的reasoning字段直接使用，无需额外AI调用生成
- **功能取舍**: 非核心功能（如内容审核）可通过提示词控制，减少系统复杂度

#### 用户体验成功因素
- **响应式设计**: 多设备支持扩大了用户群体
- **直观导航**: 清晰的页面层次结构降低了学习成本
- **即时反馈**: 实时的分数更新和成就提示增强了参与度
- **信息渐进披露**: 选择前隐藏分值保持悬念，选择后展示结果满足好奇心
- **等待时间利用**: 在AI生成场景时展示选择结果，让等待变得有意义
- **结果可见性**: 选择后需要充分展示分值和走向说明，让玩家理解决策影响

#### 内容成功因素
- **多样性**: 5种不同的人生类型提供了丰富的选择
- **一致性**: 严格的内容审核确保了质量
- **个性化**: AI生成的内容使每次游戏都不同
- **故事连贯性**: 基于上一场景和玩家选择生成下一场景，保持叙事流畅
- **新鲜感保持**: 每次新游戏生成全新开场，而非复用缓存，提升重玩价值
- **选项深度**: 每个选项包含行动、分值、走向说明三要素，让选择更有意义
- **分值合理性**: 选项分值分布应合理（-10到+10），避免全0或极端化

### 风险缓解经验

#### 技术风险
- **AI服务依赖**: 通过缓存和降级机制减少对AI服务的依赖
- **数据库连接**: 示例数据确保即使数据库不可用也能正常运行
- **状态丢失**: 自动保存机制防止用户进度丢失

#### 用户体验风险
- **加载时间**: 智能缓存和异步处理减少了等待时间
- **错误处理**: 友好的错误提示和重试机制提升了用户体验
- **内容质量**: 多层次审核确保内容安全

### 未来改进方向

#### 功能扩展
- **更多人生类型**: 基于用户反馈添加新的人生类型
- **社交功能**: 增强分享和排行榜功能
- **个性化**: 基于用户行为优化内容生成

#### 技术优化
- **性能监控**: 建立生产环境性能监控
- **A/B测试**: 支持内容版本测试
- **数据分析**: 收集用户行为数据优化体验

#### 内容优化
- **动态内容**: 支持在线编辑和版本控制
- **用户生成**: 允许用户贡献内容
- **智能推荐**: 基于用户偏好推荐人生类型

### 项目组织经验

#### 文档管理
- **结构化组织**: 按功能和阶段组织文档提高了可维护性
- **版本控制**: Git管理确保了文档的版本一致性
- **知识传承**: 详细的实施报告有助于知识传承

#### 团队协作
- **清晰分工**: 按用户故事分工使开发更高效
- **持续集成**: 自动化测试和部署提高了代码质量
- **反馈循环**: 快速的原型验证和用户反馈收集

### 关键教训

#### 开发教训
- **早期验证**: 尽早验证核心功能避免后期重构
- **用户体验优先**: 技术实现应该服务于用户体验
- **错误处理**: 完善的错误处理比功能实现更重要
- **场景状态管理**: 场景切换时必须正确重置UI状态，避免残留上一场景的信息
- **逻辑与显示分离**: 数据库唯一标识和用户可见编号应该分开管理

#### AI集成教训
- **提示词即控制**: 通过精心设计的提示词可以替代复杂的后处理逻辑
- **多样性设计**: AI生成内容需要主动要求多样性，否则易产生重复模式
- **上下文传递**: 将前序场景和玩家选择传给AI，是保持故事连贯的关键
- **JSON优于文本**: 要求AI返回JSON格式比解析自然语言文本更可靠
- **性能优先**: 能在一次AI调用中完成的工作，就不要拆成多次调用

#### 产品教训
- **简单有效**: 简单的功能比复杂的功能更容易成功
- **用户反馈**: 持续收集用户反馈是产品改进的关键
- **迭代开发**: 小步快跑比大而全的开发更有效

#### 游戏体验设计教训
- **悬念与反馈的平衡**: 选择前隐藏分值保持悬念，选择后立即展示满足好奇心，两者缺一不可
- **等待的艺术**: 不可避免的等待时间应该展示有意义的内容，而非空白加载
- **信息的时机**: 给玩家足够的时间消化选择结果，再进入下一场景
- **选项的质量**: 每个选项都应该有具体行动、明确后果、合理分值，让选择有重量感
- **重复的价值**: 即使是相同类型的游戏，每次也应该有新体验，避免"第二次就腻了"

#### 技术教训
- **类型安全**: 投资类型安全在长期维护中会得到回报
- **模块化**: 清晰的模块分离使代码更易理解和维护
- **测试覆盖**: 全面的测试覆盖是代码质量的保证

#### 数据设计教训
- **双编号系统**: 数据库唯一ID用于技术查询，逻辑编号用于用户展示，两者分离避免混淆
- **灵活的元数据**: JSONB字段存储额外信息（如logicalSceneNumber）提供了扩展性
- **AI输出结构化**: 要求AI返回JSON而非自由文本，大幅简化解析和验证逻辑
- **字段完整性**: 选项数据应包含text、scoreImpact、reasoning三个字段，缺一不可
