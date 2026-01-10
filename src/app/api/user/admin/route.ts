// src/app/api/user/admin/route.ts
// Admin endpoint untuk user dengan pagination dan filter
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/libs/database';

// GET /api/user/admin - Get all users with pagination and filters (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const emailVerified = searchParams.get('emailVerified') || 'all';

    const offset = (page - 1) * pageSize;

    // Build WHERE clause for filters
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (emailVerified === 'verified') {
      conditions.push('email_verified = 1');
    } else if (emailVerified === 'unverified') {
      conditions.push('email_verified = 0');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Get paginated data
    const dataQuery = `
      SELECT
        id,
        email,
        name,
        avatar_url,
        email_verified,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const allParams = [...params, pageSize, offset];
    const users = await executeQuery(dataQuery, allParams);

    return NextResponse.json({
      success: true,
      data: {
        users,
        total,
        page,
        pageSize,
        totalPages
      }
    });
  } catch (error: any) {
    console.error('Error fetching users admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
