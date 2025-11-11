// src/hooks/useProfil.ts
import { useState, useEffect, useCallback } from 'react';
import { IProfil } from '@/types/profil';

interface UseProfilResult {
  profil: IProfil[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useProfil({ pageSize = 10 }: { pageSize?: number } = {}): UseProfilResult {
  const [profil, setProfil] = useState<IProfil[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfil = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all profile types
      const profileTypes: IProfil['jenis'][] = ['visi', 'misi', 'sejarah', 'struktur', 'sambutan', 'video'];
      const promises = profileTypes.map(type => 
        fetch(`/api/profil?jenis=${encodeURIComponent(type)}`)
          .then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      const profiles: IProfil[] = [];
      
      results.forEach(result => {
        if (result.success && result.data) {
          profiles.push(result.data);
        }
      });

      setProfil(profiles);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchProfil();
  };

  useEffect(() => {
    fetchProfil();
  }, []);

  return {
    profil,
    loading,
    error,
    refresh,
  };
}

// Hook untuk mengambil profil berdasarkan jenis
export function useProfilByJenis(jenis: IProfil['jenis']) {
  const [profil, setProfil] = useState<IProfil | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Bungkus dengan useCallback agar stabil
  const fetchProfilByJenis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/profil?jenis=${encodeURIComponent(jenis)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Profil tidak ditemukan');
      }

      if (result.success) {
        setProfil(result.data);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profil by jenis:', err);
    } finally {
      setLoading(false);
    }
  }, [jenis]); // ✅ hanya berubah jika "jenis" berubah

  useEffect(() => {
    if (jenis) {
      fetchProfilByJenis();
    }
  }, [jenis, fetchProfilByJenis]); // ✅ aman dan tidak infinite loop

  const refresh = () => {
    fetchProfilByJenis();
  };

  return {
    profil,
    loading,
    error,
    refresh,
  };
}

// Hook untuk mutasi data profil
export function useProfilMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfilByJenis = async (jenis: IProfil['jenis'], data: Partial<IProfil>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jenis, ...data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal memperbarui profil');
      }

      return result.success;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating profil:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfilByJenis,
    loading,
    error,
  };
}

// Buat hook lain untuk setiap jenis jika diperlukan
export function useVisi() {
  return useProfilByJenis('visi');
}

export function useMisi() {
  return useProfilByJenis('misi');
}

export function useSejarah() {
  return useProfilByJenis('sejarah');
}

export function useStruktur() {
  return useProfilByJenis('struktur');
}

export function useVideo() {
  return useProfilByJenis('video');
}

export function useSambutan() {
  return useProfilByJenis('sambutan');
}