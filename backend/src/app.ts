import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './modules/auth/auth.router'
import trackerRouter from './modules/tracker/tracker.router'
import jobsRouter from './modules/jobs/jobs.router'
import interviewRouter from './modules/interview/interview.router'
import mockTestsRouter from './modules/mock-tests/mockTests.router'
import communityRouter from './modules/community/community.router'


dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

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

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app