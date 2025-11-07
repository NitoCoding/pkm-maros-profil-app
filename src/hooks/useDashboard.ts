// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import { IDashboard, IDashboardUpdate } from '@/types/dashboard';

// Hook untuk mengambil data dashboard
export function useDashboard() {
  const [dashboard, setDashboard] = useState<IDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        // Jika respons tidak OK, coba ambil pesan error dari body
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch dashboard data (status: ${response.status})`);
      }

      // Jika respons OK, langsung ambil datanya
      const result = await response.json();
      setDashboard(result); // Langsung set hasilnya

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    dashboard,
    loading,
    error,
    refresh: fetchDashboard,
  };
}

// Hook untuk mutasi data dashboard
export function useDashboardMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDashboard = async (updateData: IDashboardUpdate): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update dashboard (status: ${response.status})`);
      }

      // API kita mengembalikan { success: true, message: '...' }
      const result = await response.json();
      console.log(result.message); // Bisa digunakan untuk notifikasi
      
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating dashboard:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardSection = async (
    section: keyof IDashboardUpdate,
    data: any
  ): Promise<boolean> => {
    const updateData: IDashboardUpdate = {
      [section]: data,
    };
    return await updateDashboard(updateData);
  };

  return {
    updateDashboard,
    updateDashboardSection,
    loading,
    error,
  };
}

// --- Hook khusus untuk setiap section (TIDAK PERLU DIUBAH) ---
// Semua hook di bawah ini akan bekerja dengan benar setelah useDashboard diperbaiki

export function useHero() {
  const { dashboard, loading, error, refresh } = useDashboard();
  
  return {
    hero: dashboard?.hero || {
      image: '',
      title: 'Selamat Datang di Desa Benteng Gajah',
      subtitle: 'Melayani Masyarakat dengan Sepenuh Hati'
    },
    loading,
    error,
    refresh,
  };
}

export function useLurah() {
  const { dashboard, loading, error, refresh } = useDashboard();
  
  return {
    lurah: dashboard?.lurah || {
      name: 'Nama Lurah',
      photo: '',
      position: 'Lurah Desa Benteng Gajah'
    },
    loading,
    error,
    refresh,
  };
}

export function useWorkingHours() {
  const { dashboard, loading, error, refresh } = useDashboard();
  
  return {
    workingHours: dashboard?.workingHours || {
      days: 'Senin - Jumat',
      hours: '08:00 - 16:00',
      note: 'Sabtu: 08:00 - 12:00 (Pelayanan Terbatas)'
    },
    loading,
    error,
    refresh,
  };
}

export function useContact() {
  const { dashboard, loading, error, refresh } = useDashboard();
  
  return {
    contact: dashboard?.contact || {
      phone: '+62 123 456 789',
      email: 'kelurahan.bilokka@example.com',
      address: 'Jl. Contoh No. 123, Bilokka, Kota Contoh',
      whatsapp: '+62 123 456 789'
    },
    loading,
    error,
    refresh,
  };
}