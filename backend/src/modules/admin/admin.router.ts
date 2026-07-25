import { Router } from 'express'
import { protect, requireRole } from '../../middleware/auth.middleware'
import {
  pendingJobs,
  approveJob,
  denyJob,
  reportedPosts,
  removeReportedPost,
  clearReports,
  allUsers,
  updateUserRole,
  platformStats,
} from './admin.controller'

const router = Router()

// Every route in this module requires an authenticated ADMIN.
router.use(protect, requireRole('ADMIN'))

router.get('/stats', platformStats)

router.get('/jobs/pending', pendingJobs)
router.post('/jobs/:id/approve', approveJob)
router.post('/jobs/:id/reject', denyJob)

router.get('/community/reported', reportedPosts)
router.post('/community/:id/remove', removeReportedPost)
router.post('/community/:id/dismiss-reports', clearReports)

router.get('/users', allUsers)
router.patch('/users/:id/role', updateUserRole)

export default router
