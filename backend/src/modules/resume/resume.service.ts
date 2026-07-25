import prisma from '../../config/prisma'
import { analyzeCV, CVFeedback } from '../ai-tools/aiTools.service'

// Matches the mobile app's flat ResumeData shape exactly (see
// mobile/src/services/resume.service.ts) — the `id` fields on array items
// are mobile-local (used as React list keys) and simply pass through
// untouched since `data` is stored as opaque JSON.
export interface ResumeExperience {
  id?: string
  company: string
  role: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface ResumeEducation {
  id?: string
  school: string
  degree: string
  startDate: string
  endDate: string
}

export interface ResumeProject {
  id?: string
  name: string
  description: string
  link?: string
}

export interface ResumeData {
  fullName: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  summary: string
  experience: ResumeExperience[]
  education: ResumeEducation[]
  skills: string[]
  projects: ResumeProject[]
}

export const listResumes = async (userId: string) => {
  return prisma.resume.findMany({
    where: { userId },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export const getResume = async (userId: string, id: string) => {
  const resume = await prisma.resume.findUnique({ where: { id } })
  if (!resume || resume.userId !== userId) throw new Error('Resume not found')
  return resume
}

export const createResume = async (userId: string, title: string | undefined, data: ResumeData) => {
  if (!data?.fullName?.trim()) throw new Error('Full name is required')

  return prisma.resume.create({
    data: {
      userId,
      title: title?.trim() || 'My Resume',
      data: data as any,
    },
  })
}

export const updateResume = async (userId: string, id: string, title: string | undefined, data: ResumeData | undefined) => {
  const resume = await prisma.resume.findUnique({ where: { id } })
  if (!resume || resume.userId !== userId) throw new Error('Resume not found')

  return prisma.resume.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(data !== undefined && { data: data as any }),
    },
  })
}

export const deleteResume = async (userId: string, id: string) => {
  const resume = await prisma.resume.findUnique({ where: { id } })
  if (!resume || resume.userId !== userId) throw new Error('Resume not found')

  return prisma.resume.delete({ where: { id } })
}

/** Flattens the structured resume into plain text and runs it through the same AI CV reviewer used for uploaded CVs. */
export const getResumeFeedback = async (userId: string, id: string): Promise<CVFeedback> => {
  const resume = await getResume(userId, id)
  const data = resume.data as unknown as ResumeData

  const lines: string[] = []
  lines.push(data.fullName)
  if (data.summary) lines.push(`Summary: ${data.summary}`)

  if (data.experience?.length) {
    lines.push('Experience:')
    for (const exp of data.experience) {
      lines.push(`- ${exp.role} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`)
      for (const bullet of exp.bullets ?? []) lines.push(`  - ${bullet}`)
    }
  }

  if (data.education?.length) {
    lines.push('Education:')
    for (const edu of data.education) {
      lines.push(`- ${edu.degree}, ${edu.school} (${edu.startDate} - ${edu.endDate})`)
    }
  }

  if (data.projects?.length) {
    lines.push('Projects:')
    for (const proj of data.projects) {
      lines.push(`- ${proj.name}: ${proj.description}`)
    }
  }

  if (data.skills?.length) lines.push(`Skills: ${data.skills.join(', ')}`)

  return analyzeCV(lines.join('\n'))
}
