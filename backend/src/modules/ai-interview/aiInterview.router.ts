import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware'
import { start, respond, history, session } from './aiInterview.controller'

const router = Router()

router.use(protect)

router.post('/start', start)
router.post('/:id/respond', respond)
router.get('/history', history)
router.get('/:id', session)

export default router
