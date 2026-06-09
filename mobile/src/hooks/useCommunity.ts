import { useState, useEffect, useCallback } from 'react'
import { communityService, CommunityPost, CreatePostPayload } from '../services/community.service'

export const useCommunity = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await communityService.getAll()
      setPosts(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = async (payload: CreatePostPayload) => {
    const res = await communityService.create(payload)
    setPosts(prev => [res.data, ...prev])
    return res.data
  }

  const like = async (id: string) => {
    const res = await communityService.like(id)
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p
      return { ...p, likes: res.data.liked
        ? [...p.likes, 'me']
        : p.likes.slice(0, -1)
      }
    }))
  }

  const remove = async (id: string) => {
    await communityService.remove(id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  useEffect(() => { fetch() }, [fetch])

  return { posts, loading, error, refetch: fetch, create, like, remove }
}