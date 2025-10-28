import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateLifeSummary } from '@/lib/ai'

interface GenerateSummaryRequestBody {
  sessionId: string
  regenerate?: boolean
}

// 简易的会话级并发去重（同一会话的生成任务只跑一次）
const inflight = new Map<string, Promise<void>>()

function countChineseChars(text: string): number {
  let count = 0
  for (const ch of text) {
    if (/[\u4e00-\u9fff]/.test(ch)) count++
  }
  return count
}

function enforceChineseLength(summary: string): string {
  let total = 0
  let out = ''
  for (const ch of summary) {
    if (/[\u4e00-\u9fff]/.test(ch)) total++
    out += ch
    if (total >= 400) break
  }
  return out
}

function sanitizeMeta(text?: string | null, maxLen?: number): string {
  if (!text) return ''
  let t = String(text)
  // 去除常见元信息/指令语句和段落标题
  const patterns = [
    /因此首先用户要求[\s\S]*/g,
    /用户要求[\s\S]*/g,
    /要求[:：][\s\S]*/g,
    /关键点[:：][\s\S]*/g,
    /场景描述[:：][\s\S]*/g,
    /分析选择的影响[:：]?[\s\S]*/g,
    /推理分析[\s\S]*/g,
    /不要预设[\s\S]*/g,
    /控制在\s*\d+[-—~~]?\d*\s*字[\s\S]*/g,
    /\n-\s.*$/gm,
  ]
  for (const p of patterns) t = t.replace(p, '')
  // 去除明显的元词
  t = t.replace(/(提示词|AI|模型|指令|token|长度|格式|生成|本文|以上内容|本次|重试|系统|用户)/g, '')
  // 压缩空白
  t = t.replace(/[\t ]+/g, ' ').replace(/\n{2,}/g, '\n').trim()
  if (maxLen && t.length > maxLen) t = t.slice(0, maxLen)
  return t
}

function buildFallbackSummary(params: { lifeTypeName: string; score: number; choiceCount: number }) {
  const { lifeTypeName, score, choiceCount } = params
  const tone = score >= 80 ? '闪耀着成就的光芒' : score >= 60 ? '稳步地前行' : score >= 40 ? '在起伏中积累力量' : '依旧握紧希望的火种'
  return `你完成了一段关于「${lifeTypeName}」的人生旅程。${choiceCount} 次选择让你见过风雨，也收获晴朗。你的最终得分为 ${score} 分，说明你在关键时刻${tone}。每一步都留下了属于你的印记，愿这段经历成为下一程的底气与勇气。`
}

function buildDeterministicCitedSummary(args: {
  lifeTypeName: string
  finalScore: number
  turningSamples: { sceneTitle?: string | null; choiceText: string; delta: number; after?: string }[]
}) {
  const { lifeTypeName, finalScore, turningSamples } = args
  const parts = turningSamples.slice(0, 2).map(s => {
    const scene = s.sceneTitle ? `在《${s.sceneTitle}》中` : '在某个关键节点'
    const delta = `${s.delta >= 0 ? '提升' : '下降'}${Math.abs(s.delta)}分`
    const afterSanitized = sanitizeMeta(s.after, 40)
    const after = afterSanitized ? `，因此${afterSanitized}` : ''
    return `${scene}你选择了“${s.choiceText}”，分数${delta}${after}`
  })
  return `回望这段「${lifeTypeName}」旅程，你用真实的抉择织就了独一无二的路径：${parts.join('；')}。这些具体的决定共同推动你抵达现在的终点，最终分数为 ${finalScore} 分。`
}

function countCitations(text: string, titles: string[], choices: string[]): number {
  const seen = new Set<string>()
  for (const t of titles) {
    if (!t) continue
    const mark = `《${t}》`
    if (text.includes(mark)) seen.add(mark)
  }
  for (const c of choices) {
    if (!c) continue
    const mark = `“${c}”`
    if (text.includes(mark)) seen.add(mark)
  }
  return seen.size
}

function isPromptEcho(text: string): boolean {
  const bad = /(要求|提示词|AI|模型|系统|用户|指令|token|长度|格式|生成|本文|以上内容|本次|重试)/
  return bad.test(text)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateSummaryRequestBody
    const { sessionId, regenerate } = body || {}

    if (!sessionId || typeof sessionId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing sessionId' }), { status: 400 })
    }

    const { data: sessionRow, error: sessionErr } = await supabaseAdmin
      .from('game_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (sessionErr || !sessionRow) {
      return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 })
    }

    if (sessionRow.game_state !== 'completed') {
      return new Response(JSON.stringify({ error: 'Session not completed' }), { status: 404 })
    }

    if (!regenerate) {
      const { data: cached, error: cacheErr } = await supabaseAdmin
        .from('ai_summaries')
        .select('*')
        .eq('session_id', sessionRow.id)
        .single()

      if (!cacheErr && cached?.summary_text) {
        return new Response(
          JSON.stringify({
            summaryText: cached.summary_text,
            cached: true,
            generatedAt: cached.generated_at,
            model: cached.model,
            tokensPrompt: cached.tokens_prompt,
            tokensOutput: cached.tokens_output,
          }),
          { status: 200 }
        )
      }
    }

    const inflightKey = String(sessionRow.id)
    if (inflight.has(inflightKey)) {
      await inflight.get(inflightKey)!
      const { data: cached2 } = await supabaseAdmin
        .from('ai_summaries')
        .select('*')
        .eq('session_id', sessionRow.id)
        .single()
      if (cached2?.summary_text) {
        return new Response(
          JSON.stringify({ summaryText: cached2.summary_text, cached: true, generatedAt: cached2.generated_at, model: cached2.model, tokensPrompt: cached2.tokens_prompt, tokensOutput: cached2.tokens_output }),
          { status: 200 }
        )
      }
    }

    const { data: lifeType } = await supabaseAdmin
      .from('life_types')
      .select('id, name, description')
      .eq('id', sessionRow.life_type_id)
      .single()

    const { data: choicesRows } = await supabaseAdmin
      .from('player_choices')
      .select('choice_text, score_impact, reasoning_summary, created_at, scene_id, scene_nodes:scene_id(title, description)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    let choices = (choicesRows || []).map(r => ({
      choiceText: r.choice_text as string,
      scoreImpact: r.score_impact as number,
      createdAt: r.created_at as string,
      reasoningAfter: sanitizeMeta((r as any)?.reasoning_summary, 80) || undefined,
      sceneTitle: (r as any)?.scene_nodes?.[0]?.title || (r as any)?.scene_nodes?.title || null,
      sceneDescription: (r as any)?.scene_nodes?.[0]?.description || (r as any)?.scene_nodes?.description || null,
    }))

    if (!choices || choices.length === 0) {
      const arr = Array.isArray(sessionRow.choices_made) ? sessionRow.choices_made : []
      choices = arr.map((c: any, idx: number) => ({
        choiceText: c?.choiceText || c?.text || `第${idx + 1}次选择`,
        scoreImpact: Number(c?.scoreImpact ?? 0),
        createdAt: c?.createdAt || sessionRow.started_at,
        reasoningAfter: sanitizeMeta(c?.reasoningSummary || c?.reasoning, 80) || undefined,
        sceneTitle: c?.sceneTitle || null,
        sceneDescription: c?.sceneDescription || null,
      }))
    }

    const durationMs = sessionRow.completed_at && sessionRow.started_at
      ? new Date(sessionRow.completed_at).getTime() - new Date(sessionRow.started_at).getTime()
      : 0

    const keyTurningPoints = [...choices]
      .map((c, idx) => ({ ...c, idx, abs: Math.abs(c.scoreImpact || 0) }))
      .sort((a, b) => b.abs - a.abs)
      .slice(0, Math.min(3, choices.length))
      .map(c => ({
        index: c.idx + 1,
        sceneTitle: c.sceneTitle,
        choiceText: c.choiceText,
        delta: c.scoreImpact,
        after: c.reasoningAfter,
      }))

    const allowedTitles = Array.from(new Set(choices.map(c => c.sceneTitle).filter(Boolean))) as string[]
    const allowedChoiceTexts = Array.from(new Set(choices.map(c => c.choiceText).filter(Boolean))) as string[]

    const MAX_ATTEMPTS = Math.max(
      1,
      parseInt(process.env.AI_SUMMARY_MAX_ATTEMPTS || (process.env.AI_SUMMARY_RETRY === 'false' ? '1' : '2'))
    )

    const task = (async () => {
      let summaryText: string | null = null
      let model: string | null = null
      let tokensPrompt: number | null = null
      let tokensOutput: number | null = null
      let promptUsed: string | null = null

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const result = await generateLifeSummary({
            lifeTypeName: lifeType?.name || '人生',
            finalScore: sessionRow.current_score ?? 0,
            choiceCount: choices.length,
            durationSeconds: Math.max(0, Math.floor(durationMs / 1000)),
            choices: choices.map(c => ({
              choiceText: c.choiceText,
              scoreImpact: c.scoreImpact,
              createdAt: c.createdAt,
              sceneTitle: c.sceneTitle || undefined,
              sceneDescription: c.sceneDescription || undefined,
              reasoningAfter: c.reasoningAfter || undefined,
            })),
            outcome: sessionRow.ending_type || null,
            keyTurningPoints,
            allowedTitles,
            allowedChoiceTexts,
            attempt,
          } as any)
          let candidate = result.summaryText
          // 生成后先做元信息去除
          candidate = sanitizeMeta(candidate)
          const citations = countCitations(candidate, allowedTitles, allowedChoiceTexts)
          const looksLikePrompt = isPromptEcho(candidate)
          if (citations >= 2 && !looksLikePrompt) {
            summaryText = candidate
            model = result.model || null
            tokensPrompt = result.tokensPrompt ?? null
            tokensOutput = result.tokensOutput ?? null
            promptUsed = result.promptUsed
            break
          }
        } catch (_) {
          // ignore
        }
      }

      if (!summaryText) {
        const samples = keyTurningPoints.length > 0 ? keyTurningPoints : choices.slice(0, 2)
        summaryText = buildDeterministicCitedSummary({
          lifeTypeName: lifeType?.name || '人生',
          finalScore: sessionRow.current_score ?? 0,
          turningSamples: samples.map(s => ({
            sceneTitle: (s as any).sceneTitle || null,
            choiceText: (s as any).choiceText,
            delta: (s as any).delta ?? (s as any).scoreImpact ?? 0,
            after: (s as any).after || (s as any).reasoningAfter,
          })),
        })
      }

      const zhLen = countChineseChars(summaryText)
      if (zhLen > 400) {
        summaryText = enforceChineseLength(summaryText)
      }

      const { error: upsertErr } = await supabaseAdmin
        .from('ai_summaries')
        .upsert(
          {
            session_id: sessionRow.id,
            life_type_id: sessionRow.life_type_id,
            summary_text: summaryText!,
            model,
            tokens_prompt: tokensPrompt,
            tokens_output: tokensOutput,
            generated_at: new Date().toISOString(),
            prompt_used: promptUsed || undefined,
            cached: false,
          },
          { onConflict: 'session_id' }
        )

      if (upsertErr) {
        console.warn('ai_summaries upsert failed:', upsertErr)
      }
    })()

    inflight.set(inflightKey, task)
    try {
      await task
    } finally {
      inflight.delete(inflightKey)
    }

    const { data: cached3 } = await supabaseAdmin
      .from('ai_summaries')
      .select('*')
      .eq('session_id', sessionRow.id)
      .single()

    return new Response(
      JSON.stringify({
        summaryText: cached3?.summary_text || buildFallbackSummary({ lifeTypeName: lifeType?.name || '人生', score: sessionRow.current_score ?? 0, choiceCount: choices.length }),
        cached: false,
        generatedAt: cached3?.generated_at || new Date().toISOString(),
        model: cached3?.model || null,
        tokensPrompt: cached3?.tokens_prompt ?? null,
        tokensOutput: cached3?.tokens_output ?? null,
      }),
      { status: 200 }
    )
  } catch (err: any) {
    console.error('summary api error', err)
    return new Response(JSON.stringify({ error: 'Summary generation failed' }), { status: 500 })
  }
}
