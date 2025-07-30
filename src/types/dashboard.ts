export interface IDashboard {
  id: string;
  hero: {
    image: string;
    title: string;
    subtitle: string;
  };
  lurah: {
    name: string;
    photo: string;
    position: string;
  };
  workingHours: {
    days: string;
    hours: string;
    note: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IDashboardUpdate {
  hero?: {
    image?: string;
    title?: string;
    subtitle?: string;
  };
  lurah?: {
    name?: string;
    photo?: string;
    position?: string;
  };
  workingHours?: {
    days?: string;
    hours?: string;
    note?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
  };
} 