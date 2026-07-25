import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import { startInterview, respondToInterview, getHistory, getSession } from './aiInterview.service'

export const start = async (req: AuthRequest, res: Response) => {
  try {
    const { role, category } = req.body
    const result = await startInterview(req.userId!, role, category)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const respond = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = String(req.params.id)
    const { answer } = req.body
    const result = await respondToInterview(req.userId!, sessionId, answer)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const history = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await getHistory(req.userId!)
    res.json(sessions)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const session = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const result = await getSession(req.userId!, id)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
