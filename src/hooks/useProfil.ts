import { useState, useEffect } from 'react'
import { IProfil } from '@/types/profil'

interface UseProfilResult {
  profil: IProfil[]
  loading: boolean
  error: string | null
  refresh: () => void
}

interface UseProfilByJenisResult {
  profil: IProfil | null
  loading: boolean
  error: string | null
  refresh: () => void
}

interface UseProfilMutationResult {
  loading: boolean
  error: string | null
  updateProfil: (data: IProfil[]) => Promise<boolean>
  updateProfilByJenis: (jenis: IProfil['jenis'], data: Partial<IProfil>) => Promise<boolean>
  deleteProfil: (jenis: IProfil['jenis']) => Promise<boolean>
}

// Hook untuk mengambil semua data profil
export function useProfil(): UseProfilResult {
  const [profil, setProfil] = useState<IProfil[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfil = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/profil')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profil')
      }

      if (result.success) {
        setProfil(result.data || [])
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching profil:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    fetchProfil()
  }

  useEffect(() => {
    fetchProfil()
  }, [])

  return {
    profil,
    loading,
    error,
    refresh
  }
}

// Hook untuk mengambil profil berdasarkan jenis
export function useProfilByJenis(jenis: IProfil['jenis']): UseProfilByJenisResult {
  const [profil, setProfil] = useState<IProfil | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfilByJenis = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/profil?jenis=${encodeURIComponent(jenis)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Profil tidak ditemukan')
      }

      if (result.success) {
        setProfil(result.data)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching profil by jenis:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    fetchProfilByJenis()
  }

  useEffect(() => {
    if (jenis) {
      fetchProfilByJenis()
    }
  }, [jenis])

  return {
    profil,
    loading,
    error,
    refresh
  }
}

// Hook untuk mutasi data profil (create, update, delete)
export function useProfilMutation(): UseProfilMutationResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfil = async (data: IProfil[]): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/profil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profil')
      }

      return result.success
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating profil:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateProfilByJenis = async (jenis: IProfil['jenis'], data: Partial<IProfil>): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/profil?jenis=${encodeURIComponent(jenis)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profil')
      }

      return result.success
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating profil by jenis:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteProfil = async (jenis: IProfil['jenis']): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/profil?jenis=${encodeURIComponent(jenis)}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete profil')
      }

      return result.success
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting profil:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    updateProfil,
    updateProfilByJenis,
    deleteProfil
  }
}

// Hook untuk mengambil profil spesifik (visi, misi, sejarah, dll)
export function useVisi() {
  return useProfilByJenis('visi')
}

export function useMisi() {
  return useProfilByJenis('misi')
}

export function useSejarah() {
  return useProfilByJenis('sejarah')
}

export function useStruktur() {
  return useProfilByJenis('struktur')
}

export function useSambutan() {
  return useProfilByJenis('sambutan')
}

export function useVideo() {
  return useProfilByJenis('video')
}
