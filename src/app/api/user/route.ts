// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {

  createUser,
  getUserById,
  updateUser,
  deleteUser,
  changeUserPassword,
  resetUserPassword,
  getUserByEmail,
  getAllUsersPaginated,
} from '@/libs/api/user';
import { IUserCreate, IUserUpdate, IPasswordChange, IPasswordReset } from '@/types/user';

// GET /api/user - Get all users or specific user by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const cursor = searchParams.get('cursor');

    // Get specific user by ID
    if (id) {
      const user = await getUserById(parseInt(id));
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: user });
    }

    // Get paginated users
    // const { data, hasMore, nextCursor } = await getAllUsersPaginated(pageSize, cursor);
    // return NextResponse.json({
    //   success: true,
    //   data: {
    //     data,
    //     hasMore,
    //     nextCursor,
    //   },
    // });
    const result = await getAllUsersPaginated(pageSize, cursor);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in GET /api/user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user - Create new user
export async function POST(request: NextRequest) {
  try {
    const userData: IUserCreate = await request.json();

    // Validate required fields
    if (!userData.email || !userData.password || !userData.name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await createUser(userData);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error: any) {
    console.error('Error in POST /api/user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user - Update user or change password
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isPasswordChange = searchParams.get('password') === 'true';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    if (isPasswordChange) {
      // Change password
      const passwordData: IPasswordChange = await request.json();

      if (!passwordData.current_password || !passwordData.new_password) {
        return NextResponse.json(
          { success: false, error: 'Current password and new password are required' },
          { status: 400 }
        );
      }

      const success = await changeUserPassword(userId, passwordData.current_password, passwordData.new_password);

      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to change password. Please check your current password.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      });
    } else {
      // Update user
      const userData: IUserUpdate = await request.json();

      const success = await updateUser(userId, userData);

      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to update user' },
          { status: 400 }
        );
      }

      // Get updated user
      const updatedUser = await getUserById(userId);

      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    }
  } catch (error: any) {
    console.error('Error in PUT /api/user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteUser(parseInt(id));

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
