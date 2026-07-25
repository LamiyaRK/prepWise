import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import {
  listResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  getResumeFeedback,
} from './resume.service'

export const list = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await listResumes(req.userId!))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getOne = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await getResume(req.userId!, String(req.params.id)))
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
}

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { title, data } = req.body
    res.status(201).json(await createResume(req.userId!, title, data))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { title, data } = req.body
    res.json(await updateResume(req.userId!, String(req.params.id), title, data))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    await deleteResume(req.userId!, String(req.params.id))
    res.json({ message: 'Deleted' })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const feedback = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await getResumeFeedback(req.userId!, String(req.params.id)))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
