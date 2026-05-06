import { Request, Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import {
  getQuestions,
  createQuestion,
  bookmarkQuestion,
  getBookmarkedQuestions
} from './interview.service'

export const listQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await getQuestions(req.query)
    res.json(questions)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const addQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const question = await createQuestion(req.body)
    res.status(201).json(question)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const toggleBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const questionId = String(req.params.id)
    const result = await bookmarkQuestion(req.userId!, questionId)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const questions = await getBookmarkedQuestions(req.userId!)
    res.json(questions)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}