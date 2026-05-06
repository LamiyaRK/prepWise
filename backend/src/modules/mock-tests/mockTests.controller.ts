import { Request, Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import { getTests, getTestById, createTest, submitTest, getUserResults } from './mockTests.service'

export const listTests = async (req: Request, res: Response) => {
  try {
    const tests = await getTests()
    res.json(tests)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getTest = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const test = await getTestById(id)
    if (!test) return res.status(404).json({ error: 'Test not found' })
    res.json(test)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const addTest = async (req: AuthRequest, res: Response) => {
  try {
    const test = await createTest(req.body)
    res.status(201).json(test)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const submitTestAnswers = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const { answers } = req.body
    const result = await submitTest(req.userId!, id, answers)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const myResults = async (req: AuthRequest, res: Response) => {
  try {
    const results = await getUserResults(req.userId!)
    res.json(results)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}