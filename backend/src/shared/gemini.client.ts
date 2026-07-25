// NOTE: filename kept as "gemini.client.ts" so no other file in the codebase
// needs an import path change — but this now calls Groq, not Gemini.
// Google's Gemini API key rollout (AIza -> AQ.) was broken/unstable enough
// to block shipping, so this was swapped to Groq (OpenAI-compatible,
// genuinely free, no card required, https://console.groq.com/keys).

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'

const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

export interface GeminiPart {
  text?: string
  inline_data?: { mime_type: string; data: string }
}

export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

interface GroqChatResponse {
  choices?: { message?: { content?: string } }[]
}

const toGroqRole = (role: 'user' | 'model'): 'user' | 'assistant' =>
  role === 'model' ? 'assistant' : 'user'

/**
 * Text-only chat completion. Any `inline_data` parts (audio/documents) are
 * dropped here — Groq's chat endpoint doesn't accept inline binary data the
 * way Gemini's did. Audio goes through `transcribeAudio` below instead;
 * see aiTools.service.ts's `transcribeAndEvaluate` for how the two combine.
 */
export const callGemini = async (
  contents: GeminiContent[],
  options: { model?: string; temperature?: number; maxOutputTokens?: number } = {},
): Promise<string> => {
  const { model = DEFAULT_MODEL, temperature = 0.7, maxOutputTokens = 1024 } = options

  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured on the server')
  }

  const messages = contents.map(c => ({
    role: toGroqRole(c.role),
    content: c.parts.map(p => p.text ?? '').filter(Boolean).join('\n'),
  }))

  const response = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxOutputTokens,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq error ${response.status}: ${err}`)
  }

  const data = (await response.json()) as GroqChatResponse
  return data.choices?.[0]?.message?.content ?? ''
}

/**
 * Transcribes base64 audio via Groq's hosted Whisper. Used for the voice
 * interview-practice feature — see aiTools.service.ts.
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured on the server')
  }

  const buffer = Buffer.from(base64Audio, 'base64')
  const isM4a = mimeType.includes('mp4') || mimeType.includes('m4a')
  const ext = isM4a ? 'm4a' : 'webm'
  const audioMimeType = isM4a ? 'audio/mp4' : 'audio/webm'

  const form = new FormData()
  form.append('file', new Blob([buffer], { type: audioMimeType }), `audio.${ext}`)
  form.append('model', 'whisper-large-v3-turbo')

  const response = await fetch(GROQ_TRANSCRIBE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    body: form,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq transcription error ${response.status}: ${err}`)
  }

  const data = (await response.json()) as { text?: string }
  return data.text ?? ''
}

/** Strips markdown code fences that the model sometimes wraps JSON in. */
export const cleanJSON = (raw: string): string =>
  raw
    .replace(/```json[\s\S]*?```/g, m => m.replace(/```json\n?/, '').replace(/```$/, ''))
    .replace(/```[\s\S]*?```/g, m => m.replace(/```\n?/, '').replace(/```$/, ''))
    .trim()

export const parseJSONSafe = <T>(raw: string): T => {
  const cleaned = cleanJSON(raw)
  try {
    return JSON.parse(cleaned) as T
  } catch {
    const match = cleaned.match(/\{[\s\S]+\}/)
    if (match) return JSON.parse(match[0]) as T
    throw new Error('Could not parse AI response as JSON')
  }
}
