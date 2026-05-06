import { Request, Response } from 'express'
import { AuthRequest } from '../../middleware/auth.middleware'
import {
  getPosts,
  getPostById,
  createPost,
  toggleLike,
  addComment,
  deletePost
} from './community.service'

export const listPosts = async (req: Request, res: Response) => {
  try {
    const posts = await getPosts()
    res.json(posts)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getPost = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const post = await getPostById(id)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json(post)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const newPost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await createPost(req.userId!, req.body)
    res.status(201).json(post)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const result = await toggleLike(req.userId!, id)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const commentOnPost = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const { content } = req.body
    const comment = await addComment(req.userId!, id, content)
    res.status(201).json(comment)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const removePost = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    await deletePost(req.userId!, id)
    res.json({ message: 'Post deleted successfully' })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}