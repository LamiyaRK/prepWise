import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware'
import { getEntries, createEntry, updateEntry, deleteEntry } from './tracker.controller'

const router = Router()

router.use(protect)

router.get('/', getEntries)
router.post('/', createEntry)
router.patch('/:id', updateEntry)
router.delete('/:id', deleteEntry)

export default router