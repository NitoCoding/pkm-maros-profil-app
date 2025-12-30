// src/hooks/useCurrentUser.ts
import { useState, useEffect } from 'react';
import { IUser } from '@/types/user';

interface UseCurrentUserResult {
    user: IUser | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
    logout: () => void;
}

export function useCurrentUser(): UseCurrentUserResult {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // console.log('useCurrentUser hook invoked');
    const fetchCurrentUser = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/auth/me');
            const result = await response.json();

            // console.log('Fetched current user data:', result);

            if (!response.ok) {
                if (response.status === 401) {
                    // User tidak terautentikasi, ini bukan error
                    // console.log('User is not authenticated');
                    setUser(null);
                } else {
                    throw new Error(result.error || 'Failed to fetch user data');
                }
            } else {
                // // console.log('User data fetched successfully:', result);
                // // console.log('Result success status:', result.success);
                // // console.log('Result data:', result.data);
                if (result.user) {
                    // console.log('Setting current user:', result.user);
                    setUser(result.user);
                    // Simpan ke localStorage sebagai backup/cache
                    
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                } else {
                    setUser(null);
                }
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching current user:', err);
            // Coba ambil dari localStorage sebagai fallback
            const cachedUser = localStorage.getItem('currentUser');
            if (cachedUser) {
                try {
                    const parsedUser = JSON.parse(cachedUser);
                    setUser(parsedUser);
                } catch (parseError) {
                    console.error('Error parsing cached user:', parseError);
                    localStorage.removeItem('currentUser');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const refresh = () => {
        fetchCurrentUser();
    };

    const logout = () => {
        // Hapus dari state
        setUser(null);
        // Hapus dari localStorage
        localStorage.removeItem('currentUser');
        // Hapus cookie token (jika menggunakan httpOnly cookie, ini tidak akan berpengaruh)
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // Redirect ke halaman login
        window.location.href = '/login';
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    return {
        user,
        loading,
        error,
        refresh,
        logout,
    };
}