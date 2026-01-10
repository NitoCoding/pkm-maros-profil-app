// src/libs/auth/token.ts
// Note: JWT functions are imported dynamically to prevent client-side import issues

// Lazy import JWT functions (server-side only)
async function getJWTFunctions() {
  if (typeof window !== 'undefined') {
    throw new Error('JWT functions can only be used on the server side');
  }
  const jwt = await import('./jwt');
  return {
    verifyToken: jwt.verifyToken,
    refreshToken: jwt.refreshToken,
  };
}

// CLIENT-SIDE FUNCTIONS
// Store token in cookie (client-side)
export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `token=${token}; path=/; max-age=${24 * 60 * 60}; secure=${process.env.NODE_ENV === 'production'}; samesite=strict`;
  }
}

// Get token from cookie (client-side)
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    // Tambahkan log untuk melihat semua cookie yang ada
    // console.log('Client: All cookies:', document.cookie);
    
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('token=')) {
        const tokenValue = cookie.substring('token='.length, cookie.length);
        // console.log('Client: Found token:', tokenValue.substring(0, 20) + '...');
        return tokenValue;
      }
    }
  }
  // console.log('Client: Token not found in cookies');
  return null;
}

// Remove token from cookie (client-side)
export function removeToken() {
  if (typeof window !== 'undefined') {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}

// Get fresh token with automatic refresh (client-side)
export async function getValidToken(): Promise<string | null> {
  try {
    const token = getToken();

    if (!token) {
      return null;
    }

    // Try to verify the token via API
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      return token;
    }

    // Token is invalid, try to refresh
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      return getToken(); // New token already set as cookie
    }

    // Refresh failed
    removeToken();
    return null;

  } catch (error) {
    return null;
  }
}

// Check if user is authenticated (client-side)
export async function isAuthenticated(): Promise<boolean> {
  const token = getToken();

  if (!token) {
    return false;
  }

  // Verify token via API (server-side)
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

// Setup auth listener for client-side
export function setupAuthListener() {
  // Check token validity every 5 minutes
  const interval = setInterval(async () => {
    const token = getToken();
    if (token) {
      try {
        // Verify via API
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          // Token is expired, try to refresh
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });

          if (!refreshResponse.ok) {
            // Refresh failed, redirect to login
            removeToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
      } catch (error) {
        // Network error, ignore
        console.warn('Auth check failed:', error);
      }
    }
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(interval);
}

// Get current user from token (client-side)
export async function getCurrentUser(): Promise<any> {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    // Get user from API
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;

  } catch (error) {
    return null;
  }
}

export async function logout() {
  try {
    // Panggil API logout untuk menghapus cookie di server
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Jika API gagal, tetap coba hapus token di client sebagai fallback
      console.error('Logout API failed:', data.message);
      removeToken(); // Fallback client-side
    }

    // Arahkan pengguna ke halaman login
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }

    return { success: true };

  } catch (error) {
    console.error('Network error during logout:', error);
    // Fallback jika ada error jaringan
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return { success: false, error: 'Network error' };
  }
}

// SERVER-SIDE FUNCTIONS
// These functions should only be used in Server Components or API routes
export async function setAuthToken(token: string) {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const token = (await cookies()).get('token');
    return token?.value || null;
  }
  return null;
}

export async function removeAuthToken() {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    (await cookies()).delete('token');
  }
}

export async function getValidAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    try {
      const jwtFunctions = await getJWTFunctions();
      const token = await getAuthToken();

      if (!token) {
        return null;
      }

      // Try to verify the token
      jwtFunctions.verifyToken(token);

      return token;

    } catch (error) {
      // Token is invalid, try to refresh it
      try {
        const currentToken = await getAuthToken();
        if (currentToken) {
          const jwtFunctions = await getJWTFunctions();
          const freshToken = await jwtFunctions.refreshToken(currentToken);
          await setAuthToken(freshToken);
          return freshToken;
        }
      } catch (refreshError) {
        // Refresh failed, remove token
        await removeAuthToken();
      }

      return null;
    }
  }
  return null;
}

export async function isServerAuthenticated(): Promise<boolean> {
  return await getValidAuthToken() !== null;
}

export async function getServerCurrentUser(): Promise<any> {
  if (typeof window === 'undefined') {
    try {
      const jwtFunctions = await getJWTFunctions();
      const token = await getValidAuthToken();
      if (!token) {
        return null;
      }

      const decoded = jwtFunctions.verifyToken(token);
      return decoded;

    } catch (error) {
      return null;
    }
  }
  return null;
}