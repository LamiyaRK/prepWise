import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import {
  getPendingJobs,
  verifyJob,
  rejectJob,
  getReportedPosts,
  moderateRemovePost,
  dismissReports,
  listUsers,
  setUserRole,
  getPlatformStats,
} from './admin.service'

const handle = (fn: (req: AuthRequest) => Promise<any>) => async (req: AuthRequest, res: Response) => {
  try {
    const data = await fn(req)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const pendingJobs = handle(() => getPendingJobs())
export const approveJob = handle(req => verifyJob(String(req.params.id)))
export const denyJob = handle(req => rejectJob(String(req.params.id)))

export const reportedPosts = handle(() => getReportedPosts())
export const removeReportedPost = handle(req => moderateRemovePost(String(req.params.id)))
export const clearReports = handle(req => dismissReports(String(req.params.id)))

export const allUsers = handle(() => listUsers())
export const updateUserRole = handle(req => setUserRole(String(req.params.id), req.body.role))

export const platformStats = handle(() => getPlatformStats())
