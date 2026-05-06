import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware'
import {
  listPosts,
  getPost,
  newPost,
  likePost,
  commentOnPost,
  removePost
} from './community.controller'

const router = Router()

router.get('/', listPosts)
router.get('/:id', getPost)
router.post('/', protect, newPost)
router.post('/:id/like', protect, likePost)
router.post('/:id/comment', protect, commentOnPost)
router.delete('/:id', protect, removePost)

export default router