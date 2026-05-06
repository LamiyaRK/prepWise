import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware'
import { listJobs, getJob, postJob, removeJob, editJob } from './jobs.controller'

const router = Router()

router.get('/', listJobs)
router.get('/:id', getJob)
router.post('/', protect, postJob)
router.patch('/:id', protect, editJob)
router.delete('/:id', protect, removeJob)

export default router