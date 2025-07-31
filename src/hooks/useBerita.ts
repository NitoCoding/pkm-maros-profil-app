import { useState, useEffect } from 'react'
import { IBerita } from '@/types/berita'

interface UseBeritaResult {
  berita: IBerita[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

interface UseBeritaOptions {
  pageSize?: number
  initialLoad?: boolean
}

export function useBerita(options: UseBeritaOptions = {}): UseBeritaResult {
  const { pageSize = 10, initialLoad = true } = options
  
  const [berita, setBerita] = useState<IBerita[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  const fetchBerita = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
      })

      if (!reset && cursor) {
        params.append('cursor', cursor)
      }

      const response = await fetch(`/api/berita?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch berita')
      }

      if (result.success) {
        const newBerita = result.data.data || []
        
        if (reset) {
          setBerita(newBerita)
        } else {
          setBerita(prev => [...prev, ...newBerita])
        }

        setHasMore(result.data.hasMore || false)
        setCursor(result.data.lastDoc ? JSON.stringify(result.data.lastDoc) : null)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching berita:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBerita(false)
    }
  }

  const refresh = () => {
    setCursor(null)
    fetchBerita(true)
  }

  useEffect(() => {
    if (initialLoad) {
      fetchBerita(true)
    }
  }, [])

  return {
    berita,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  }
}

// Hook untuk single berita by slug
export function useBeritaBySlug(slug: string) {
  const [berita, setBerita] = useState<IBerita | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetchBerita = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/berita?slug=${encodeURIComponent(slug)}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Berita tidak ditemukan')
        }

        if (result.success) {
          setBerita(result.data)
        }
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching berita by slug:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBerita()
  }, [slug])

  return { berita, loading, error }
}

// Hook untuk berita terbaru (untuk homepage)
export function useLatestBerita(limit = 3) {
  const [berita, setBerita] = useState<IBerita[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestBerita = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/berita?pageSize=${limit}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch latest berita')
        }

        if (result.success) {
          setBerita(result.data.data || [])
        }
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching latest berita:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestBerita()
  }, [limit])

  return { berita, loading, error }
}

// Hook untuk admin - dapat mengakses semua berita (termasuk draft)
export function useBeritaAdmin(options: UseBeritaOptions = {}): UseBeritaResult {
  const { pageSize = 10, initialLoad = true } = options
  
  const [berita, setBerita] = useState<IBerita[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  const fetchBerita = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
        admin: 'true'
      })

      if (!reset && cursor) {
        params.append('cursor', cursor)
      }

      const response = await fetch(`/api/berita?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch berita')
      }

      if (result.success) {
        const newBerita = result.data.data || []
        
        if (reset) {
          setBerita(newBerita)
        } else {
          setBerita(prev => [...prev, ...newBerita])
        }

        setHasMore(result.data.hasMore || false)
        setCursor(result.data.lastDoc ? JSON.stringify(result.data.lastDoc) : null)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching berita:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBerita(false)
    }
  }

  const refresh = () => {
    setCursor(null)
    fetchBerita(true)
  }

  useEffect(() => {
    if (initialLoad) {
      fetchBerita(true)
    }
  }, [])

  return {
    berita,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  }
} 