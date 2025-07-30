import { auth } from '@/libs/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

// Store token in localStorage
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    // Store timestamp when token was created
    localStorage.setItem('auth_token_timestamp', Date.now().toString());
  }
};

// Get token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Get fresh token from Firebase Auth
export const getFreshAuthToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No current user found');
      return null;
    }

    // Force refresh to get a new token
    const token = await user.getIdToken(true);
    setAuthToken(token);
    console.log('Fresh token obtained and stored');
    return token;
  } catch (error) {
    console.error('Error getting fresh token:', error);
    return null;
  }
};

// Get token with automatic refresh if needed
export const getValidAuthToken = async (): Promise<string | null> => {
  try {
    const currentToken = getAuthToken();
    const timestamp = localStorage.getItem('auth_token_timestamp');
    
    if (!currentToken || !timestamp) {
      console.log('No token or timestamp found, getting fresh token');
      return await getFreshAuthToken();
    }

    // Check if token is older than 50 minutes (Firebase tokens expire in 1 hour)
    const tokenAge = Date.now() - parseInt(timestamp);
    const fiftyMinutes = 50 * 60 * 1000;

    if (tokenAge > fiftyMinutes) {
      console.log('Token is old, refreshing...');
      return await getFreshAuthToken();
    }

    // Token is still valid
    return currentToken;
  } catch (error) {
    console.error('Error getting valid token:', error);
    return null;
  }
};

// Remove token from localStorage
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_timestamp');
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

// Setup auth state listener to automatically refresh tokens
export const setupAuthListener = () => {
  if (typeof window === 'undefined') return;

  onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      try {
        // Get fresh token when auth state changes
        const token = await user.getIdToken(true);
        setAuthToken(token);
        console.log('Auth state changed, token refreshed');
      } catch (error) {
        console.error('Error refreshing token on auth state change:', error);
        removeAuthToken();
      }
    } else {
      // User logged out
      removeAuthToken();
      console.log('User logged out, token removed');
    }
  });
};

// Utility to handle API calls with automatic token refresh
export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    // Get valid token (will refresh if needed)
    const token = await getValidAuthToken();
    
    if (!token) {
      throw new Error('NO_TOKEN');
    }

    // Make request with token
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // If token expired, try once more with fresh token
    if (response.status === 401) {
      console.log('Token expired, trying with fresh token...');
      const freshToken = await getFreshAuthToken();
      
      if (!freshToken) {
        throw new Error('TOKEN_REFRESH_FAILED');
      }

      // Retry request with fresh token
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${freshToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (retryResponse.status === 401) {
        throw new Error('TOKEN_STILL_INVALID');
      }

      return retryResponse;
    }

    return response;
  } catch (error: any) {
    if (error.message === 'NO_TOKEN' || 
        error.message === 'TOKEN_REFRESH_FAILED' || 
        error.message === 'TOKEN_STILL_INVALID') {
      // Redirect to login
      removeAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw error;
  }
}; 