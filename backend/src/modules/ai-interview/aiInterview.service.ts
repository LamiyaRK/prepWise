import prisma from '../../config/prisma'
import { callGemini, parseJSONSafe, GeminiContent } from '../../shared/gemini.client'
import { recordActivity } from '../../shared/streak.service'

const MAX_EXCHANGES = 5 // number of question/answer rounds before the AI concludes

type AiTurn =
  | { type: 'question'; question: string }
  | { type: 'final'; overallScore: number; feedback: string; strengths: string[]; improvements: string[] }

const buildSystemPrompt = (role: string, category: string) => `
You are an expert, encouraging but rigorous technical interviewer conducting a live mock interview.

Candidate role: "${role}"
Focus area: "${category}"

Rules:
- Ask exactly ONE question at a time.
- After the candidate answers, ask a natural FOLLOW-UP question that digs deeper into what they just said — reference specifics from their answer, the way a real interviewer would. Don't just move to an unrelated topic every time.
- Keep questions concise (1-2 sentences).
- After ${MAX_EXCHANGES} total question/answer exchanges, STOP asking questions and instead conclude the interview with an honest, constructive overall evaluation.

Respond with ONLY valid JSON, no markdown, no code fences, no explanation. Use exactly one of these two shapes:

While continuing:
{"type": "question", "question": "<your next question>"}

When concluding (only after ${MAX_EXCHANGES} exchanges have happened):
{"type": "final", "overallScore": <integer 0-100>, "feedback": "<3-4 sentence overall assessment of communication, depth, and structure>", "strengths": ["<strength 1>", "<strength 2>"], "improvements": ["<improvement 1>", "<improvement 2>"]}
`.trim()

const askGemini = async (contents: GeminiContent[]): Promise<AiTurn> => {
  const raw = await callGemini(contents)
  return parseJSONSafe<AiTurn>(raw)
}

export const startInterview = async (userId: string, role: string, category: string) => {
  if (!role?.trim() || !category?.trim()) {
    throw new Error('role and category are required')
  }

  const session = await prisma.aiInterviewSession.create({
    data: { userId, role, category },
  })

  const systemPrompt = buildSystemPrompt(role, category)
  const contents: GeminiContent[] = [
    { role: 'user', parts: [{ text: `${systemPrompt}\n\nBegin now. Ask your first question. (Exchange 1 of ${MAX_EXCHANGES}.)` }] },
  ]

  const turn = await askGemini(contents)
  if (turn.type !== 'question') {
    throw new Error('Unexpected response starting interview')
  }

  await prisma.aiInterviewMessage.create({
    data: { sessionId: session.id, sender: 'AI', content: turn.question },
  })

  return { sessionId: session.id, question: turn.question, exchange: 1, maxExchanges: MAX_EXCHANGES }
}

export const respondToInterview = async (userId: string, sessionId: string, answer: string) => {
  if (!answer?.trim()) throw new Error('Answer cannot be empty')

  const session = await prisma.aiInterviewSession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  if (!session || session.userId !== userId) throw new Error('Interview session not found')
  if (session.status === 'COMPLETED') throw new Error('This interview has already ended')

  await prisma.aiInterviewMessage.create({
    data: { sessionId, sender: 'USER', content: answer },
  })

  const questionCount = session.messages.filter(m => m.sender === 'AI').length
  const isLastExchange = questionCount >= MAX_EXCHANGES

  // Rebuild the full conversation for Gemini from stored messages.
  const systemPrompt = buildSystemPrompt(session.role, session.category)
  const contents: GeminiContent[] = [{ role: 'user', parts: [{ text: systemPrompt }] }]

  for (const msg of session.messages) {
    if (msg.sender === 'AI') {
      contents.push({ role: 'model', parts: [{ text: JSON.stringify({ type: 'question', question: msg.content }) }] })
    } else {
      contents.push({ role: 'user', parts: [{ text: msg.content }] })
    }
  }

  contents.push({
    role: 'user',
    parts: [{
      text: `${answer}\n\n(This was exchange ${questionCount} of ${MAX_EXCHANGES}. ${
        isLastExchange
          ? 'That was the final exchange — conclude now with the "final" JSON shape.'
          : 'Continue with your next follow-up question as the "question" JSON shape.'
      })`,
    }],
  })

  const turn = await askGemini(contents)

  if (turn.type === 'final') {
    await prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        finalScore: turn.overallScore,
        finalFeedback: turn.feedback,
        strengths: turn.strengths ?? [],
        improvements: turn.improvements ?? [],
        completedAt: new Date(),
      },
    })
    await recordActivity(userId)
    return { done: true, overallScore: turn.overallScore, feedback: turn.feedback, strengths: turn.strengths, improvements: turn.improvements }
  }

  await prisma.aiInterviewMessage.create({
    data: { sessionId, sender: 'AI', content: turn.question },
  })

  return { done: false, question: turn.question, exchange: questionCount + 1, maxExchanges: MAX_EXCHANGES }
}

export const getHistory = async (userId: string) => {
  return prisma.aiInterviewSession.findMany({
    where: { userId },
    select: {
      id: true, role: true, category: true, status: true,
      finalScore: true, createdAt: true, completedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const getSession = async (userId: string, sessionId: string) => {
  const session = await prisma.aiInterviewSession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  if (!session || session.userId !== userId) throw new Error('Interview session not found')
  return session
}
