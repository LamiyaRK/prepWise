import { Request, Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import { getJobs, getJobById, createJob, updateJob, deleteJob } from './jobs.service'

export const listJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await getJobs(req.query)
    res.json(jobs)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getJob = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const job = await getJobById(id)
    if (!job) return res.status(404).json({ error: 'Job not found' })
    res.json(job)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const postJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await createJob(req.userId!, req.body)
    res.status(201).json(job)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const editJob = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const job = await updateJob(req.userId!, id, req.body)
    res.json(job)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const removeJob = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    await deleteJob(req.userId!, id)
    res.json({ message: 'Job deleted successfully' })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}