import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware'
import {
  listPosts,
  getPost,
  newPost,
  likePost,
  commentOnPost,
  removePost,
  reportPostHandler,
} from './community.controller'

const router = Router()

router.get('/', listPosts)
router.get('/:id', getPost)
router.post('/', protect, newPost)
router.post('/:id/like', protect, likePost)
router.post('/:id/comment', protect, commentOnPost)
router.post('/:id/report', protect, reportPostHandler)
router.delete('/:id', protect, removePost)

export default router
