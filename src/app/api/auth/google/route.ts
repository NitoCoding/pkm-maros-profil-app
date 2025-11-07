// // src/app/api/auth/google/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { generateToken } from '@/libs/auth/jwt';
// import { findUserById, createUser, updateUser,findUserByEmail, findUserByGoogleId } from '@/libs/auth/database';
// import { setAuthToken } from '@/libs/auth/token';

// export async function POST(request: NextRequest) {
//   try {
//     const { googleId, email, name, picture } = await request.json();
    
//     if (!googleId || !email) {
//       return NextResponse.json(
//         { error: 'Google ID and email are required' },
//         { status: 400 }
//       );
//     }
    
//     // Check if user exists with Google ID
//     let user = await findUserByGoogleId(googleId);
    
//     if (!user) {
//       // Check if user exists with email
//       user = await findUserByEmail(email);
      
//       if (user) {
//         // Link Google account to existing user
//         await updateUser(user.id, {
//           google_id: googleId,
//           avatar_url: picture,
//         });
//       } else {
//         // Create new user
//         user = await createUser({
//           email,
//           name,
//           role',
//           google_id: googleId,
//           avatar_url: picture,
//         });
//       }
//     }
    
//     // Generate JWT token
//     const token = generateToken({
//       id: user.id,
//       email: user.email,
//       name: user.name,
//     });
    
//     // Set token in cookie
//     const response = NextResponse.json({
//       success: true,
//       message: 'Google login successful',
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         avatar_url: user.avatar_url,
//       },
//     });
    
//     response.cookies.set('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 24 * 60 * 60, // 24 hours
//       path: '/',
//     });
    
//     return response;
    
//   } catch (error) {
//     console.error('Google login error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
