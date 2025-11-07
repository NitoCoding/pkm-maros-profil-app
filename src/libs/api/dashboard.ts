// src/libs/dashboard.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IDashboard, IDashboardUpdate } from '@/types/dashboard';

// Fungsi untuk mengambil data dashboard (diasumsikan hanya ada satu dengan label 'main')
export async function getDashboard(): Promise<IDashboard | null> {
  const result = await executeSingleQuery<any>(`
    SELECT 
      id, label, created_at, updated_at,
      hero_image as 'hero.image',
      hero_title as 'hero.title',
      hero_subtitle as 'hero.subtitle',
      lurah_name as 'lurah.name',
      lurah_photo as 'lurah.photo',
      lurah_position as 'lurah.position',
      working_hours_days as 'workingHours.days',
      working_hours_hours as 'workingHours.hours',
      working_hours_note as 'workingHours.note',
      contact_phone as 'contact.phone',
      contact_email as 'contact.email',
      contact_address as 'contact.address',
      contact_whatsapp as 'contact.whatsapp'
    FROM dashboard 
    WHERE label = 'main'
  `);

  if (!result) {
    return null;
  }
  console.log('Raw dashboard data from DB:', result);
  console.log('Formatted dashboard data:', {
    id: result.id,
    label: result.label,
    hero: {
      image: result['hero.image'],
      title: result['hero.title'],
      subtitle: result['hero.subtitle'],
    },
    lurah: {
      name: result['lurah.name'],
      photo: result['lurah.photo'],
      position: result['lurah.position'],
    },
    workingHours: {
      days: result['workingHours.days'],
      hours: result['workingHours.hours'],
      note: result['workingHours.note'],
    },
    contact: {
      phone: result['contact.phone'],
      email: result['contact.email'],
      address: result['contact.address'],
      whatsapp: result['contact.whatsapp'],
    },
    createdAt: result.created_at ? result.created_at.toISOString() : null,
    updatedAt: result.updated_at ? result.updated_at.toISOString() : null,
  });

  // Mengubah hasil flat menjadi objek bersarang
  return {
    id: result.id,
    label: result.label,
    hero: {
      image: result['hero.image'],
      title: result['hero.title'],
      subtitle: result['hero.subtitle'],
    },
    lurah: {
      name: result['lurah.name'],
      photo: result['lurah.photo'],
      position: result['lurah.position'],
    },
    workingHours: {
      days: result['workingHours.days'],
      hours: result['workingHours.hours'],
      note: result['workingHours.note'],
    },
    contact: {
      phone: result['contact.phone'],
      email: result['contact.email'],
      address: result['contact.address'],
      whatsapp: result['contact.whatsapp'],
    },
    createdAt: result.created_at ? result.created_at.toISOString() : null,
    updatedAt: result.updated_at ? result.updated_at.toISOString() : null,
  };
}

// Fungsi untuk memperbarui seluruh data dashboard
export async function updateDashboard(data: IDashboardUpdate): Promise<boolean> {
  const { hero, lurah, workingHours, contact } = data;

  // Membuat query dinamis
  const fields: string[] = [];
  const values: any[] = [];

  if (hero) {
    if (hero.image !== undefined) { fields.push('hero_image = ?'); values.push(hero.image); }
    if (hero.title !== undefined) { fields.push('hero_title = ?'); values.push(hero.title); }
    if (hero.subtitle !== undefined) { fields.push('hero_subtitle = ?'); values.push(hero.subtitle); }
  }
  if (lurah) {
    if (lurah.name !== undefined) { fields.push('lurah_name = ?'); values.push(lurah.name); }
    if (lurah.photo !== undefined) { fields.push('lurah_photo = ?'); values.push(lurah.photo); }
    if (lurah.position !== undefined) { fields.push('lurah_position = ?'); values.push(lurah.position); }
  }
  if (workingHours) {
    if (workingHours.days !== undefined) { fields.push('working_hours_days = ?'); values.push(workingHours.days); }
    if (workingHours.hours !== undefined) { fields.push('working_hours_hours = ?'); values.push(workingHours.hours); }
    if (workingHours.note !== undefined) { fields.push('working_hours_note = ?'); values.push(workingHours.note); }
  }
  if (contact) {
    if (contact.phone !== undefined) { fields.push('contact_phone = ?'); values.push(contact.phone); }
    if (contact.email !== undefined) { fields.push('contact_email = ?'); values.push(contact.email); }
    if (contact.address !== undefined) { fields.push('contact_address = ?'); values.push(contact.address); }
    if (contact.whatsapp !== undefined) { fields.push('contact_whatsapp = ?'); values.push(contact.whatsapp); }
  }

  if (fields.length === 0) {
    return true; // Tidak ada yang diupdate
  }

  const query = `UPDATE dashboard SET ${fields.join(', ')} WHERE label = 'main'`;
  
  const result = await executeQuery(query, values);
  
  return (result as any).affectedRows > 0;
}