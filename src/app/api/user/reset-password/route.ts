// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    resetUserPassword,
} from '@/libs/api/user';
import { IPasswordReset } from '@/types/user';


// POST /api/user/reset-password - Reset password
export async function POST(request: NextRequest) {
    try {
        const resetData: IPasswordReset = await request.json();

        if (!resetData.email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const newPassword = await resetUserPassword(resetData.email);

        // In a real application, you would send an email with the new password
        // For now, we'll just return the new password

        return NextResponse.json({
            success: true,
            data: newPassword,
            message: 'Password reset successfully'
        });
    } catch (error: any) {
        console.error('Error in POST /api/user/reset-password:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}