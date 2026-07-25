import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './modules/auth/auth.router'
import trackerRouter from './modules/tracker/tracker.router'
import jobsRouter from './modules/jobs/jobs.router'
import interviewRouter from './modules/interview/interview.router'
import mockTestsRouter from './modules/mock-tests/mockTests.router'
import communityRouter from './modules/community/community.router'
import adminRouter from './modules/admin/admin.router'
import aiInterviewRouter from './modules/ai-interview/aiInterview.router'
import aiToolsRouter from './modules/ai-tools/aiTools.router'
import companyInsightsRouter from './modules/company-insights/companyInsights.router'
import resumeRouter from './modules/resume/resume.router'
import streakRouter from './modules/streak/streak.router'

dotenv.config()

// Fail fast on missing required env vars instead of crashing deep inside
// jwt.verify with a confusing stack trace.
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`)
    process.exit(1)
  }
}

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
}))
app.use(express.json({ limit: '25mb' }))

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'PrepWise API is running ' })
})

app.use('/api/auth', authRouter)
app.use('/api/tracker', trackerRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/interview', interviewRouter)
app.use('/api/tests', mockTestsRouter)
app.use('/api/community', communityRouter)
app.use('/api/admin', adminRouter)
app.use('/api/ai-interview', aiInterviewRouter)
app.use('/api/ai-tools', aiToolsRouter)
app.use('/api/companies', companyInsightsRouter)
app.use('/api/resumes', resumeRouter)
app.use('/api/streak', streakRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
