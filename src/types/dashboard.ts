// src/types/dashboard.ts

export interface IDashboard {
  id: number;
  label: string;
  hero: {
    image: string | null;
    title: string;
    subtitle: string | null;
  };
  lurah: {
    name: string | null;
    photo: string | null;
    position: string | null;
  };
  workingHours: {
    days: string | null;
    hours: string | null;
    note: string | null;
  };
  contact: {
    phone: string | null;
    email: string | null;
    address: string | null;
    whatsapp: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// Tipe untuk data yang bisa di-update (semua field opsional)
export type IDashboardUpdate = Partial<Pick<IDashboard, 'hero' | 'lurah' | 'workingHours' | 'contact'>>;