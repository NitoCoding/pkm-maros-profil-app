// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDashboard, updateDashboard } from '@/libs/api/dashboard';
import { IDashboardUpdate } from '@/types/dashboard';

// GET: Mengambil data dashboard
export async function GET() {
  try {
    const dashboard = await getDashboard();
    
    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('API Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT/PATCH: Memperbarui data dashboard
export async function PUT(request: NextRequest) {
  try {
    const body: IDashboardUpdate = await request.json();
    
    // Validasi sederhana
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'No data provided for update' },
        { status: 400 }
      );
    }

    const success = await updateDashboard(body);

    if (success) {
      return NextResponse.json({ success: true, message: 'Dashboard updated successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to update dashboard or no changes made' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API Error updating dashboard:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}