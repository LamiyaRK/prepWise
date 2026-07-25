import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware'
import { list, getOne, create, update, remove, feedback } from './resume.controller'

const router = Router()

router.use(protect)

router.get('/', list)
router.get('/:id', getOne)
router.post('/', create)
router.patch('/:id', update)
router.delete('/:id', remove)
router.post('/:id/feedback', feedback)

export default router
