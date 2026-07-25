import { Router, Response } from 'express'
import { protect, AuthRequest } from '../../middleware/auth.middleware'
import { getStreak } from '../../shared/streak.service'

const router = Router()

router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const streak = await getStreak(req.userId!)
    res.json(streak)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
