import { callGemini, parseJSONSafe, transcribeAudio } from '../../shared/gemini.client'

export interface GeneratedQuestion {
  question: string
  hint: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export interface SpeechEvaluation {
  score: number
  feedback: string
  tips: string[]
  transcript?: string
}

export interface CVFeedback {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  keywords: string[]
}

export const generateInterviewQuestions = async (
  role: string,
  category: string,
  count: number,
): Promise<GeneratedQuestion[]> => {
  if (!role?.trim() || !category?.trim()) throw new Error('role and category are required')
  const safeCount = Math.min(Math.max(Number(count) || 5, 1), 20)

  const prompt = `
You are an expert technical recruiter. Generate exactly ${safeCount} unique interview questions for a "${role}" candidate.
Category: ${category}

Rules:
- Each question must be specific and thoughtful
- Vary the difficulty naturally across Easy, Medium, Hard
- Hints should be actionable 1-sentence coaching tips
- Do NOT repeat questions

Return ONLY a valid JSON array with no explanation, no markdown, no code blocks:
[
  {
    "question": "the interview question text",
    "hint": "a concise tip on how to best answer it",
    "difficulty": "Easy"
  }
]
`.trim()

  const raw = await callGemini([{ role: 'user', parts: [{ text: prompt }] }], { maxOutputTokens: 2048 })
  const parsed = parseJSONSafe<GeneratedQuestion[]>(raw)
  if (!Array.isArray(parsed)) throw new Error('Could not parse questions response')
  return parsed.slice(0, safeCount)
}

export const evaluateAnswer = async (question: string, answer: string): Promise<SpeechEvaluation> => {
  if (!question?.trim() || !answer?.trim()) throw new Error('question and answer are required')

  const prompt = `
You are an expert interview coach. Evaluate this interview answer honestly and constructively.

Question: "${question}"
Candidate's Answer: "${answer}"

Scoring guide:
- 80-100: Excellent, uses structure, specific examples, clear communication
- 60-79: Good but missing depth or examples
- 40-59: Adequate but vague
- 0-39: Poor, off-topic, or too short

Return ONLY a valid JSON object with no explanation, no markdown, no code blocks:
{
  "score": <integer 0-100>,
  "feedback": "<2-3 sentence constructive evaluation>",
  "tips": ["<specific tip 1>", "<specific tip 2>", "<specific tip 3>"]
}
`.trim()

  const raw = await callGemini([{ role: 'user', parts: [{ text: prompt }] }])
  const parsed = parseJSONSafe<any>(raw)
  return {
    score: Number(parsed.score) || 0,
    feedback: parsed.feedback ?? '',
    tips: Array.isArray(parsed.tips) ? parsed.tips : [],
  }
}

export const transcribeAndEvaluate = async (
  question: string,
  base64Audio: string,
  mimeType: string = 'm4a',
): Promise<SpeechEvaluation> => {
  if (!question?.trim() || !base64Audio) throw new Error('question and audio are required')

  try {
    const transcript = await transcribeAudio(base64Audio, mimeType)
    if (!transcript.trim()) {
      throw new Error('Empty transcript')
    }
    const evaluation = await evaluateAnswer(question, transcript)
    return { ...evaluation, transcript }
  } catch {
    return evaluateAnswer(question, '[Audio could not be transcribed — no spoken content detected]')
  }
}

export const improveText = async (text: string, context: string): Promise<string> => {
  if (!text?.trim()) throw new Error('text is required')

  const prompt = `
You are an expert resume writer. Rewrite the following resume ${context || 'text'} to be more impactful, concise, and ATS-friendly.

Rules:
- Use strong action verbs and quantify impact where plausible
- Keep it truthful — do not invent facts, numbers, or achievements not implied by the original
- Keep roughly the same length (don't pad or over-expand)
- Return ONLY the rewritten text, no quotes, no markdown, no explanation

Original:
"${text}"
`.trim()

  const raw = await callGemini([{ role: 'user', parts: [{ text: prompt }] }], { temperature: 0.5, maxOutputTokens: 300 })
  return raw.trim().replace(/^["']|["']$/g, '')
}

export const analyzeCV = async (cvText: string): Promise<CVFeedback> => {
  if (!cvText?.trim()) throw new Error('cvText is required')

  const prompt = `
You are an expert resume reviewer for tech industry jobs. Analyze this CV/resume content:

"${cvText.slice(0, 4000)}"

Return ONLY a valid JSON object with no explanation, no markdown, no code blocks:
{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>", "<improvement 4>"],
  "keywords": ["<important keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
}
`.trim()

  const raw = await callGemini([{ role: 'user', parts: [{ text: prompt }] }])
  return parseJSONSafe<CVFeedback>(raw)
}

/**
 * Analyzes a CV sent as a raw document (PDF/Word) instead of extracted text —
 * used when the mobile app couldn't extract readable text locally. Replaces
 * the mobile app's old client-side `analyzeCVFromFile`, which had a
 * placeholder API key that was never filled in and silently failed.
 */
/**
 * Extracts text from a raw PDF or Word document server-side, then runs it
 * through the same text-based analyzer as everything else. This is local
 * parsing (pdf-parse / mammoth) — no AI provider involved, so it works
 * regardless of which LLM backend is configured.
 */
export const analyzeCVFromFile = async (
  base64: string,
  mimeType: string,
  fileName: string,
): Promise<CVFeedback> => {
  if (!base64) throw new Error('file data is required')

  const buffer = Buffer.from(base64, 'base64')
  let text = ''

  try {
    if (mimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: buffer })
      const parsed = await parser.getText()
      await parser.destroy()
      text = parsed.text
    } else if (
      mimeType.includes('wordprocessingml') ||
      mimeType.includes('msword') ||
      fileName.toLowerCase().endsWith('.docx')
    ) {
      const mammoth = await import('mammoth')
      const parsed = await mammoth.extractRawText({ buffer })
      text = parsed.value
    }
  } catch (err: any) {
    throw new Error(`Could not parse "${fileName}": ${err.message}`)
  }

  if (!text?.trim() || text.trim().length < 50) {
    throw new Error(
      `Could not extract readable text from "${fileName}" (it may be a scanned/image-based PDF with no selectable text). Please paste your CV text directly, or upload a plain .txt file.`,
    )
  }

  return analyzeCV(text)
}