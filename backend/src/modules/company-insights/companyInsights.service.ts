import prisma from '../../config/prisma'

const topN = (map: Map<string, number>, n: number) =>
  Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }))

// ── Company list (searchable, sorted by how much intel exists) ────────────

export const listCompanies = async (search?: string) => {
  const posts = await prisma.communityPost.findMany({
    where: {
      removed: false,
      ...(search?.trim() && { company: { contains: search.trim(), mode: 'insensitive' } }),
    },
    select: { company: true },
  })

  // Group case-insensitively (free-text "company" field means "Google" and
  // "google" should count as the same company), but keep the most common
  // casing as the display label.
  const grouped = new Map<string, { display: string; count: number }>()
  for (const p of posts) {
    const key = p.company.trim().toLowerCase()
    const existing = grouped.get(key)
    if (existing) {
      existing.count++
    } else {
      grouped.set(key, { display: p.company.trim(), count: 1 })
    }
  }

  return Array.from(grouped.values())
    .map(({ display, count }) => ({ company: display, postCount: count }))
    .sort((a, b) => b.postCount - a.postCount)
}

// ── Single company deep-dive ────────────────────────────────────────────────

export const getCompanyInsights = async (company: string) => {
  const posts = await prisma.communityPost.findMany({
    where: { removed: false, company: { equals: company, mode: 'insensitive' } },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      comments: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (posts.length === 0) throw new Error('No interview experiences found for this company yet')

  const roleCounts = new Map<string, number>()
  const tagCounts = new Map<string, number>()

  for (const p of posts) {
    roleCounts.set(p.role.trim(), (roleCounts.get(p.role.trim()) ?? 0) + 1)
    for (const tag of p.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }

  return {
    company: posts[0].company, // canonical casing from the most recent post
    totalPosts: posts.length,
    topRoles: topN(roleCounts, 6),
    topTags: topN(tagCounts, 8),
    posts: posts.map(p => ({
      id: p.id,
      role: p.role,
      content: p.content,
      tags: p.tags,
      likeCount: p.likes.length,
      commentCount: p.comments.length,
      createdAt: p.createdAt,
      user: p.user,
    })),
  }
}
