import { Router } from 'express'
import { protect } from '../../middleware/auth.middleware'
import { generateQuestions, evaluateTextAnswer, evaluateVoiceAnswer, analyzeResume, improveTextHandler } from './aiTools.controller'

const router = Router()

router.use(protect)

router.post('/generate-questions', generateQuestions)
router.post('/evaluate-answer', evaluateTextAnswer)
router.post('/evaluate-voice', evaluateVoiceAnswer)
router.post('/analyze-cv', analyzeResume)
router.post('/improve-text', improveTextHandler)

export default router