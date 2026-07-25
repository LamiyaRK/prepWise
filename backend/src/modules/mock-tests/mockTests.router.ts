import { Router } from 'express'
import { protect, requireRole } from '../../middleware/auth.middleware'
import { listTests, getTest, addTest, submitTestAnswers, myResults } from './mockTests.controller'

const router = Router()

router.get('/', listTests)
router.get('/results/me', protect, myResults)
router.get('/:id', getTest)
router.post('/', protect, requireRole('ADMIN'), addTest)
router.post('/:id/submit', protect, submitTestAnswers)

export default router
