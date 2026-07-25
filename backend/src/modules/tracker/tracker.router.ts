import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware'
import { getEntries, createEntry, updateEntry, deleteEntry, getFunnel } from './tracker.controller'

const router = Router()

router.use(protect)

router.get('/', getEntries)
router.get('/funnel', getFunnel)
router.post('/', createEntry)
router.patch('/:id', updateEntry)
router.delete('/:id', deleteEntry)

export default router
