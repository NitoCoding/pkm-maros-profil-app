// src/app/api/public/dashboard/route.ts
// Public endpoint untuk dashboard data (tanpa autentikasi)
import { NextResponse } from 'next/server';
import { getDashboard } from '@/libs/api/dashboard';

// GET: Mengambil data dashboard untuk public (hero, lurah info, contact, working hours)
export async function GET() {
  try {
    const dashboard = await getDashboard();

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard data not found' },
        { status: 404 }
      );
    }

    // Return only public-safe data
    return NextResponse.json({
      success: true,
      data: {
        hero: dashboard.hero,
        lurah: dashboard.lurah,
        workingHours: dashboard.workingHours,
        contact: dashboard.contact,
      }
    });
  } catch (error) {
    console.error('API Error fetching public dashboard:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
