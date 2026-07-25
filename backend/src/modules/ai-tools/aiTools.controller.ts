import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import {
  generateInterviewQuestions,
  evaluateAnswer,
  transcribeAndEvaluate,
  analyzeCV,
  analyzeCVFromFile,
  improveText,
} from './aiTools.service'

export const generateQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { role, category, count } = req.body
    const questions = await generateInterviewQuestions(role, category, count)
    res.json(questions)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const evaluateTextAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer } = req.body
    const result = await evaluateAnswer(question, answer)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const evaluateVoiceAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { question, audio, mimeType } = req.body
    const result = await transcribeAndEvaluate(question, audio, mimeType)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const improveTextHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { text, context } = req.body
    const improved = await improveText(text, context)
    res.json({ improved })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const analyzeResume = async (req: AuthRequest, res: Response) => {
  try {
    const { cvText, fileBase64, mimeType, fileName } = req.body
    const result = (cvText && cvText.trim().length > 100)
      ? await analyzeCV(cvText)
      : await analyzeCVFromFile(fileBase64, mimeType, fileName ?? 'resume')
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}