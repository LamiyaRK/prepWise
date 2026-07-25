import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware'
import { listJobs, listMyJobs, getJob, postJob, removeJob, editJob } from './jobs.controller'

const router = Router()

// Any authenticated user can post a job — it just won't appear in the public
// list until an admin approves it (see /api/admin/jobs/pending).
router.get('/', listJobs)
router.get('/mine', protect, listMyJobs)
router.get('/:id', getJob)
router.post('/', protect, postJob)
router.patch('/:id', protect, editJob)
router.delete('/:id', protect, removeJob)

export default router
