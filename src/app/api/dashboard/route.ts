import { NextRequest, NextResponse } from 'next/server';
import { getDashboard, updateDashboard, initializeDashboard } from '@/libs/api/dashboard';

export async function GET() {
  try {
    const dashboard = await getDashboard();
    
    if (!dashboard) {
      // Initialize with default data if not exists
      await initializeDashboard();
      const newDashboard = await getDashboard();
      
      return NextResponse.json({
        success: true,
        data: newDashboard,
        message: 'Dashboard initialized with default data'
      });
    }

    console.log(dashboard);

    return NextResponse.json({
      success: true,
      data: dashboard,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error: any) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get dashboard data' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'initialize') {
      const success = await initializeDashboard();
      return NextResponse.json({
        success,
        message: 'Dashboard initialized successfully'
      });
    }

    if (action === 'update' && data) {
      const success = await updateDashboard(data);
      return NextResponse.json({
        success,
        message: 'Dashboard updated successfully'
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid action or missing data' 
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('POST /api/dashboard error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process dashboard request' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const success = await updateDashboard(body);
    
    return NextResponse.json({
      success,
      message: 'Dashboard updated successfully'
    });
  } catch (error: any) {
    console.error('PUT /api/dashboard error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update dashboard' 
      },
      { status: 500 }
    );
  }
} 