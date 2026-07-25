import { Router } from 'express'
import { protect, requireRole } from '../../middleware/auth.middleware'
import {
  listQuestions,
  addQuestion,
  toggleBookmark,
  getBookmarks,
} from './interview.controller'

const router = Router()

router.get('/', listQuestions)
router.post('/', protect, requireRole('ADMIN'), addQuestion)
router.post('/bookmark/:id', protect, toggleBookmark)
router.get('/bookmarks', protect, getBookmarks)

export default router
