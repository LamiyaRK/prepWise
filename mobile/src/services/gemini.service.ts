const GEMINI_API_KEY=`AIzaSyBv0oeQn73HZahMsSviMfNBe6dajj-w064`

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`

const ask = async (prompt: string): Promise<string> => {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  })
 
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini error ${response.status}: ${err}`)
  }
 
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
 
// Strips markdown code fences that Gemini sometimes adds
const cleanJSON = (raw: string): string =>
  raw.replace(/```json[\s\S]*?```/g, m => m.replace(/```json\n?/, '').replace(/```$/, ''))
     .replace(/```[\s\S]*?```/g, m => m.replace(/```\n?/, '').replace(/```$/, ''))
     .trim()
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
export interface GeminiQuestion {
  question:   string
  hint:       string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}
 
export interface SpeechEvaluation {
  score:      number
  feedback:   string
  tips:       string[]
  transcript?: string  // included when evaluating voice
}
 
export interface CVFeedback {
  score:        number
  summary:      string
  strengths:    string[]
  improvements: string[]
  keywords:     string[]
}
 
// ─── Question Generator ───────────────────────────────────────────────────────
 
export const generateInterviewQuestions = async (
  role:     string,
  category: string,
  count:    number,
): Promise<GeminiQuestion[]> => {
  const prompt = `
You are an expert technical recruiter. Generate exactly ${count} unique interview questions for a "${role}" candidate.
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
 
  const raw = await ask(prompt)
  const cleaned = cleanJSON(raw)
 
  try {
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    return parsed.slice(0, count)
  } catch {
    // Fallback: try to extract JSON array from the response
    const match = cleaned.match(/\[[\s\S]+\]/)
    if (match) return JSON.parse(match[0]).slice(0, count)
    throw new Error('Could not parse Gemini response as JSON')
  }
}
 
// ─── Text Answer Evaluator ────────────────────────────────────────────────────
 
export const evaluateAnswer = async (
  question: string,
  answer:   string,
): Promise<SpeechEvaluation> => {
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
 
  const raw = await ask(prompt)
  const cleaned = cleanJSON(raw)
 
  try {
    const parsed = JSON.parse(cleaned)
    return {
      score:    Number(parsed.score) || 0,
      feedback: parsed.feedback ?? '',
      tips:     Array.isArray(parsed.tips) ? parsed.tips : [],
    }
  } catch {
    const match = cleaned.match(/\{[\s\S]+\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return {
        score:    Number(parsed.score) || 0,
        feedback: parsed.feedback ?? '',
        tips:     Array.isArray(parsed.tips) ? parsed.tips : [],
      }
    }
    throw new Error('Could not parse evaluation response')
  }
}
 
// ─── Voice / Audio Transcription + Evaluation ────────────────────────────────
 
export const transcribeAndEvaluate = async (
  question:   string,
  base64Audio: string,
  mimeType:   string = 'm4a',
): Promise<SpeechEvaluation> => {
  // Gemini supports inline audio in base64 format
  const audioMime = mimeType === 'm4a' ? 'audio/mp4' : `audio/${mimeType}`
 
  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: audioMime,
              data: base64Audio,
            },
          },
          {
            text: `
You are an expert interview coach. The audio above is a candidate answering this interview question:
"${question}"
 
Do two things:
1. Transcribe exactly what the candidate said.
2. Evaluate the answer quality.
 
Return ONLY a valid JSON object with no explanation, no markdown, no code blocks:
{
  "transcript": "<exact words spoken in the audio>",
  "score": <integer 0-100>,
  "feedback": "<2-3 sentence constructive evaluation>",
  "tips": ["<specific tip 1>", "<specific tip 2>", "<specific tip 3>"]
}
`.trim(),
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  }
 
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
 
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini audio error ${response.status}: ${err}`)
  }
 
  const data = await response.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const cleaned = cleanJSON(raw)
 
  try {
    const parsed = JSON.parse(cleaned)
    return {
      transcript: parsed.transcript ?? '',
      score:      Number(parsed.score) || 0,
      feedback:   parsed.feedback ?? '',
      tips:       Array.isArray(parsed.tips) ? parsed.tips : [],
    }
  } catch {
    const match = cleaned.match(/\{[\s\S]+\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return {
        transcript: parsed.transcript ?? '',
        score:      Number(parsed.score) || 0,
        feedback:   parsed.feedback ?? '',
        tips:       Array.isArray(parsed.tips) ? parsed.tips : [],
      }
    }
    // If audio parsing fails, fall back to text-only evaluation
    return evaluateAnswer(question, '[Audio could not be transcribed — no spoken content detected]')
  }
}
 
// ─── CV Analyzer ─────────────────────────────────────────────────────────────
 
export const analyzeCV = async (cvText: string): Promise<CVFeedback> => {
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
 
  const raw = await ask(prompt)
  const cleaned = cleanJSON(raw)
 
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]+\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse CV feedback response')
  }
}
