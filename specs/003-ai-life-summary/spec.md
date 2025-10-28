# Feature Specification: AI生成个性化人生总结

**Feature Branch**: `003-ai-life-summary`  
**Created**: 2025-10-28  
**Status**: Draft  
**Input**: User description: "游戏结算页面我希望能够使用AI，结合所有场景描述和玩家做出的选择，生成一个人生总结，而不是一句简单的'你通过明智的选择和努力，实现了人生的目标！'之类的"

## 目标与范围

- **目标**：使用AI结合玩家的所有游戏数据（场景描述、选择路径、分数变化等）生成一个个性化、有意义的人生总结，替代当前简单的固定文案。
- **范围内**：
  - 在游戏结算页面使用AI生成个性化人生总结
  - 总结应基于玩家的选择路径、场景描述、分数变化轨迹、成就解锁情况
  - 总结应体现玩家在游戏中的关键决策点和人生转折
  - 支持不同游戏结局类型（胜利/失败/超时/选择）的差异化总结
- **范围外**：修改游戏逻辑、修改其他页面、调整数据库结构、实现内容审核功能。

## 假设

- 玩家已完成游戏，`GameSession` 包含完整的 `choicesMade` 数组
- AI服务可用，能够处理长文本输入（包含所有场景和选择的上下文）
- 总结生成时间需要在3秒内完成，以避免用户体验问题
- 生成的总结需要符合人生模拟器的主题，且内容积极正面
- 首版仅支持中文总结生成

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 查看AI生成的人生总结 (Priority: P1)

玩家完成游戏后，在结算页面看到基于其具体游戏经历生成的个性化人生总结，而不是通用文案。

**Why this priority**: 这是核心功能，没有个性化总结就失去用户价值。

**Independent Test**: 完成一局游戏，验证结算页面显示的总结是否基于玩家的实际选择而生成，且内容独特、有意义。

**Acceptance Scenarios**:

1. **Given** 玩家完成一局"创业人生"，**When** 进入结算页面，**Then** 显示基于该玩家具体选择生成的人生总结，内容提及玩家的关键选择
2. **Given** 玩家在游戏中做出高风险高收益的选择，**When** 生成总结，**Then** 总结中提到玩家勇于冒险的特质
3. **Given** 玩家走保守路线，**When** 生成总结，**Then** 总结中提到玩家谨慎稳重的特点
4. **Given** 玩家分数最终为90分，**When** 生成总结，**Then** 总结中体现玩家取得高分的成功要素
5. **Given** 玩家分数为20分，**When** 生成总结，**Then** 总结以积极的角度回顾玩家的选择，而非单纯否定

---

### User Story 2 - 总结反映游戏历程 (Priority: P1)

生成的总结应准确反映玩家的游戏历程，包括选择的先后顺序、关键转折点、分数变化趋势等。

**Why this priority**: 总结必须与游戏历程相关，否则失去个性化意义。

**Independent Test**: 对比10局不同选择的游戏记录，验证每局生成的总结是否不同，且与各自的选择路径相关。

**Acceptance Scenarios**:

1. **Given** 玩家在游戏早期做出高风险选择导致分数下降，**When** 生成总结，**Then** 提到"开局的不利"或类似的早期困境
2. **Given** 玩家在后期做出关键选择导致分数大幅提升，**When** 生成总结，**Then** 重点强调这一关键转折点
3. **Given** 玩家选择路径体现出风险偏好，**When** 生成总结，**Then** 总结中多次使用"冒险"、"挑战"等词汇
4. **Given** 玩家选择路径偏向保守，**When** 生成总结，**Then** 总结中强调"稳健"、"谨慎"等特点
5. **Given** 玩家完成所有选择，**When** 生成总结，**Then** 总结涵盖从开始到结束的完整历程，而非仅仅开头或结尾

---

### User Story 3 - 总结语言风格与质量 (Priority: P1)

生成的总结应采用温暖、积极、富有诗意的语言风格，符合人生模拟器的主题，避免负面用语。

**Why this priority**: 语言风格直接影响用户体验和游戏情感价值。

**Independent Test**: 阅读100份生成的总结，检验语言是否符合温暖积极风格，避免使用贬义词、失败描述等。

**Acceptance Scenarios**:

1. **Given** 生成人生总结，**When** 检查用词，**Then** 总结中避免使用"失败"、"错误"、"糟糕"等负面词汇
2. **Given** 玩家最终分数偏低，**When** 生成总结，**Then** 使用"虽然评分不高，但你在关键节点展现了勇气"等积极表述
3. **Given** 生成总结，**When** 检查语气，**Then** 使用"你"、"你的"等人称代词，增强代入感
4. **Given** 生成总结，**When** 检查句式，**Then** 采用富有感情的句子，而非干巴巴的事实描述
5. **Given** 生成总结，**When** 检查内容，**Then** 每份总结都是独特且言之有物的，避免空泛的"很好"、"不错"等词汇

---

### User Story 4 - 不同结局的差异化总结 (Priority: P2)

不同游戏结局类型应生成不同风格的总结。

**Why this priority**: 增强游戏多样性，提升重玩价值。

**Independent Test**: 分别触发胜利、失败、超时、选择类结局，验证生成的总结风格是否与结局类型匹配。

**Acceptance Scenarios**:

1. **Given** 玩家以胜利结局结束（分数≥100），**When** 生成总结，**Then** 总结语言更加庆祝性，强调成就
2. **Given** 玩家以失败结局结束（分数≤0），**When** 生成总结，**Then** 总结以反思和建议为主，而非打击玩家
3. **Given** 玩家因超时而结束（达到最大回合数），**When** 生成总结，**Then** 总结强调玩家经历的丰富性和选择的多样性
4. **Given** 玩家遇到关键选择而结束，**When** 生成总结，**Then** 总结突出这一选择的重大意义和后续可能

---

### User Story 5 - AI服务异常处理 (Priority: P2)

当AI生成失败时，系统应优雅降级，使用高质量备用总结，而非显示错误。

**Why this priority**: 保障用户体验的连续性，即使AI服务异常也能提供良好的结算体验。

**Independent Test**: 模拟AI服务返回错误，验证系统是否使用备用总结，用户感觉不到异常。

**Acceptance Scenarios**:

1. **Given** AI服务超时（>5秒），**When** 系统处理，**Then** 使用预设的备用总结，并记录错误日志
2. **Given** AI服务返回错误，**When** 系统处理，**Then** 使用基于游戏统计数据的智能备用总结（基于分数、选择数量等生成）
3. **Given** AI返回空内容或格式错误，**When** 系统处理，**Then** 降级使用模板化总结模板，确保用户始终看到总结

---

### Edge Cases

- 当玩家只做了一次选择就结束游戏时，总结应如何生成？系统应基于那一次关键选择生成总结，强调其重要性
- 当所有玩家选择都是中性（分数不变）时，总结应如何表述？系统应强调玩家保持平衡的特质，而非强调无变化
- 当AI生成的内容过长（>500字）时如何处理？系统应将总结长度限制在200-400字，确保可读性
- 当AI生成的内容包含不当内容或敏感信息时如何处理？系统使用与游戏主题一致的提示词，并定期审核生成内容的质量
- 当玩家在游戏中遇到很多失败选择但最终高分时如何处理？系统应强调玩家的韧性和从失败中学习的能力
- 当玩家选择的多样性很低（总是选择类似选项）时如何处理？系统应强调玩家的坚持性，而非批评缺乏多样性

## Requirements *(mandatory)*

### Functional Requirements

#### 核心功能需求

- **FR-001**: System MUST generate personalized life summary for completed game sessions using AI
- **FR-002**: System MUST include all scene descriptions, player choices, score changes, and achievements in the summary context
- **FR-003**: System MUST generate summaries that are 200-400 Chinese characters (汉字) in length for optimal readability
- **FR-004**: System MUST ensure generated summaries reflect the player's actual game journey and choices
- **FR-005**: System MUST use warm, positive, and inspirational language that matches the life simulator theme
- **FR-006**: System MUST generate different summaries for different game outcome types (victory/defeat/timeout/choice)
- **FR-007**: System MUST avoid negative vocabulary such as "failure", "error", "terrible" in generated summaries
- **FR-008**: System MUST personalize summary based on player's risk-taking tendencies (conservative vs. adventurous)
- **FR-009**: System MUST identify and highlight key decision points and turning points in the summary
- **FR-010**: System MUST generate unique summaries for each playthrough, even with similar choices

#### AI生成与处理需求

- **FR-011**: System MUST call AI service with complete game context including ALL scenes and choices from the game session (no filtering or truncation needed due to limited total scenes per game)
- **FR-012**: System MUST include game session metadata (life type, duration, final score) in AI prompt
- **FR-013**: System MUST generate and cache summary when game session first completes, and reuse cached summary for all subsequent views of that session
- **FR-014**: System MUST validate AI response before displaying to user
- **FR-015**: System MUST parse AI response in expected format (summary text)

#### 用户界面需求

- **FR-016**: System MUST display generated summary in place of the existing resultDescription (below the result title) in the game result page
- **FR-017**: System MUST maintain existing UI layout and components when adding summary feature
- **FR-018**: System MUST show loading state while generating summary when user first enters result page (real-time generation)
- **FR-019**: System MUST handle summary generation gracefully without disrupting user experience, and display cached summary immediately if available (from previous visits to same session)
- **FR-020**: System MUST provide fallback summary when AI generation fails

#### 性能与可靠性需求

- **FR-021**: System MUST complete summary generation within 5 seconds for 95% of requests
- **FR-022**: System MUST handle AI service timeouts gracefully with retry logic
- **FR-023**: System MUST implement fallback mechanism when AI service is unavailable
- **FR-024**: System MUST not block user from viewing game results if summary generation fails
- **FR-025**: System MUST log all summary generation attempts for monitoring and debugging

#### 内容质量需求

- **FR-026**: System MUST ensure generated summaries do not contain inappropriate content
- **FR-027**: System MUST generate summaries that maintain consistent tone and style
- **FR-028**: System MUST ensure summaries are contextually relevant to the game journey
- **FR-029**: System MUST avoid generating repetitive or generic summaries
- **FR-030**: System MUST generate summaries that provide meaningful insights, not platitudes

### Narrative Integrity & Validation (Derived from Learnings)

- **FR-031**: Summary MUST explicitly cite at least two in-session elements using these formats: 《scene title》 and/or “choice text”.
- **FR-032**: Summary MUST describe at least one key turning point and its consequence in natural language, reflecting the player’s actual sequence and post-choice outcome.
- **FR-033**: Summary MUST be a single paragraph of 200–400 Chinese characters; lists, headings, bullets, or multiple paragraphs are NOT allowed.
- **FR-034**: Summary MUST NOT contain meta/instructional wording (e.g., “要求/提示词/AI/模型/指令/token/长度/格式/生成/本文/重试/系统/用户”等相关表述)。
- **FR-035**: All citations MUST come exclusively from the completed session’s context; references to non-existent places, times, or entities are NOT allowed (zero hallucination).
- **FR-036**: For each completed session, the System MUST generate the summary at most once and persist it; subsequent views MUST reuse the stored text (idempotent per session).
- **FR-037**: The System MUST avoid duplicate concurrent generation for the same session and return a consistent summary to all requesters.
- **FR-038**: The System MUST validate each summary against FR-031/FR-033/FR-034/FR-035; if validation fails, the System MUST reattempt generation once with stricter constraints.
- **FR-039**: If the second attempt still fails validation, the System MUST deliver a deterministic fallback summary built only from real choices and score changes, avoiding generic platitudes.
- **FR-040**: On first view, the summary MUST be available within 5 seconds perceived time; while unavailable, the UI MUST show a friendly “organizing journey” message; on subsequent views, the summary MUST render immediately from storage.

### Key Entities

- **GameSession**: 游戏会话实体，包含完整的 `choicesMade` 数组，每个选择包含 `sceneId`, `choiceText`, `scoreImpact`, `reasoningSummary`
- **AIGeneratedSummary**: AI生成的总结实体，包含 `summaryText`, `generatedAt`, `promptUsed`, `cacheKey`
- **SceneContext**: 场景上下文实体，包含场景描述、选项内容、分数变化用于生成总结
- **SummaryPrompt**: AI提示词实体，包含用于生成总结的prompt模板和变量

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### 用户体验指标

- **SC-001**: 95% of completed game sessions display AI-generated personalized summary within 5 seconds
- **SC-002**: 90% of users report that the generated summary accurately reflects their game journey
- **SC-003**: 85% of users find the summary more meaningful than the previous generic messages
- **SC-004**: 80% of users can identify their key choices mentioned in the summary

#### 内容质量指标

- **SC-005**: 100% of generated summaries are between 200-400 Chinese characters (汉字) in length
- **SC-006**: 95% of summaries use warm, positive language appropriate for the life simulator theme
- **SC-007**: 90% of summaries are unique for different game sessions (even with similar choices)
- **SC-008**: 85% of summaries correctly identify and highlight key decision points in the game journey
- **SC-009**: Zero instances of inappropriate or negative content in generated summaries

#### 技术性能指标

- **SC-010**: Summary generation completes within 5 seconds for 95% of game completions
- **SC-011**: 99% of game sessions display a summary (either AI-generated or fallback)
- **SC-012**: AI service failure rate is less than 2% (calculated as failures / total requests)
- **SC-013**: Fallback summary activation rate is less than 5% (AI failures)

#### 差异化指标

- **SC-014**: Victory summaries emphasize achievement for 95% of cases
- **SC-015**: Defeat summaries use constructive and positive framing for 95% of cases  
- **SC-016**: Timeout summaries emphasize journey richness for 90% of cases
- **SC-017**: 90% of summaries reflect the player's risk-taking profile (conservative vs. adventurous)

## Clarifications

### Session 2025-10-28

- Q: 总结的字数限制应该如何理解？200-400字符的含义是什么？ → A: 200-400个汉字（不考虑标点、空格），这样便于估算token消耗和确保用户体验的一致性。
- Q: 当玩家重新查看之前的游戏结果时，系统应该如何处理总结生成？ → A: 使用缓存策略，仅在首次完成游戏时生成并存储总结，后续查看直接复用（保证一致体验、降低成本和API调用）。
- Q: 生成的总结在结算页面中应该显示在什么位置？ → A: 替换现有的resultDescription区域（标题下方的描述文本），这样能最小化布局变更同时提供更好的体验。
- Q: 当玩家的游戏经历很长时，应该如何构建AI prompt以控制token消耗？ → A: 包含所有场景和选择的完整信息，因为总场景数是有限制的（游戏设计本身限制了场景数量），无需担心token问题。
- Q: 总结应该在什么时候生成？ → A: 在用户进入结算页面时实时生成，显示加载状态。避免后台生成的时序问题（可能用户进入时总结还未准备好）。

## Development Learnings & Experience *(mandatory)*

### 项目初期洞察

这是一个增强游戏体验的功能，需要在保持现有游戏流程完整性的同时，增加AI生成个性化总结的能力。主要挑战在于平衡AI生成质量、响应时间和用户体验。

### 潜在风险

- **AI响应延迟**: 长游戏上下文可能导致AI处理时间延长，需要优化prompt长度和内容
- **生成质量不稳定**: AI可能生成不符合要求的内容，需要严格的提示词工程和内容验证
- **成本考虑**: AI API调用成本随游戏长度增加，需要实现合理的缓存策略
- **Fallback机制**: 当AI服务不可用时，需要优雅的降级方案

### 实施经验（基于本次对话）

- **引用为王**：高质量总结必须显式引用真实证据（至少2处），如《场景标题》或“选择内容”，否则玩家会觉得无关痛痒。
- **连贯叙事**：总结应基于实际选择顺序与关键转折点呈现因果与走向，避免空泛的形容词堆砌。
- **语言边界**：对玩家只说“结果”，绝不说“过程”；严禁出现“要求/提示/AI/模型/指令/生成/长度/重试”等元话语。
- **一次生成，多次复用**：一局只生成一次总结并固化，后续访问应直接复用；这能保持体验一致性并避免叙事漂移。
- **并发友好**：要防止重复生成与双重请求引发的多份结果或不一致体验；同一会话在同一时刻只应产出一个可用总结。
- **真实来源**：总结只允许引用玩家真实发生的场景与选择，严禁跨题材、跨世界观的“臆造”细节。
- **失败兜底**：当无法满足质量门槛（如缺少引用）时，使用基于真实选择与分数变化的可读兜底文本，胜于通用鸡汤。
- **易读性**：200–400字的一段自然中文文本；禁止清单/小标题；语气温暖、积极但不过度夸饰。
- **体验节奏**：首次生成可提示“正在整理”；再次进入应即时出现，不打断玩家的闭环体验。
- **可验证性**：玩家应能在5秒内指出“2个我确实做过的选择/场景”和“1个关键转折”，这是检验总结是否真正相关的有效信号。

