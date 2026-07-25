import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import {
  getTrackerEntries,
  createTrackerEntry,
  updateTrackerEntry,
  deleteTrackerEntry,
  getTrackerFunnel,
} from './tracker.service'

export const getEntries = async (req: AuthRequest, res: Response) => {
  try {
    const entries = await getTrackerEntries(req.userId!)
    res.json(entries)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const createEntry = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await createTrackerEntry(req.userId!, req.body)
    res.status(201).json(entry)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const updateEntry = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const entry = await updateTrackerEntry(req.userId!, id, req.body)
    res.json(entry)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const deleteEntry = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    await deleteTrackerEntry(req.userId!, id)
    res.json({ message: 'Deleted successfully' })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getFunnel = async (req: AuthRequest, res: Response) => {
  try {
    const funnel = await getTrackerFunnel(req.userId!)
    res.json(funnel)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
