import { db } from "@/libs/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { IDashboard, IDashboardUpdate } from '@/types/dashboard';

const docRef = doc(db, "dashboard", "main");

export async function getDashboard(): Promise<IDashboard | null> {
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as IDashboard;
      return {
        ...data,
        id: docSnap.id,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw new Error('Failed to get dashboard data');
  }
}

export async function updateDashboard(data: IDashboardUpdate): Promise<boolean> {
  try {
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    throw new Error('Failed to update dashboard data');
  }
}

export async function updateDashboardSection(
  section: keyof IDashboardUpdate,
  data: any
): Promise<boolean> {
  try {
    const updateData: IDashboardUpdate = {
      [section]: data,
    };
    
    await setDoc(docRef, updateData, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error updating dashboard section ${section}:`, error);
    throw new Error(`Failed to update dashboard section ${section}`);
  }
}

export async function initializeDashboard(): Promise<boolean> {
  try {
    const defaultData: IDashboard = {
      id: 'main',
      hero: {
        image: '',
        title: 'Selamat Datang di Kelurahan Bilokka',
        subtitle: 'Melayani Masyarakat dengan Sepenuh Hati'
      },
      lurah: {
        name: 'Nama Lurah',
        photo: '',
        position: 'Lurah Kelurahan Bilokka'
      },
      workingHours: {
        days: 'Senin - Jumat',
        hours: '08:00 - 16:00',
        note: 'Sabtu: 08:00 - 12:00 (Pelayanan Terbatas)'
      },
      contact: {
        phone: '+62 123 456 789',
        email: 'kelurahan.bilokka@example.com',
        address: 'Jl. Contoh No. 123, Bilokka, Kota Contoh',
        whatsapp: '+62 123 456 789'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, defaultData);
    return true;
  } catch (error) {
    console.error('Error initializing dashboard data:', error);
    throw new Error('Failed to initialize dashboard data');
  }
} 