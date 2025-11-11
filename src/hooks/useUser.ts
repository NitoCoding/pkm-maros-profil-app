// src/hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react';
import { IUser, IUserCreate, IUserUpdate, IPasswordReset, IPasswordChange } from '@/types/user';

interface UseUsersResult {
    users: IUser[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

interface UseUserResult {
    user: IUser | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

interface UseUserMutationResult {
    loading: boolean;
    error: string | null;
    createUser: (userData: IUserCreate) => Promise<boolean>;
    updateUser: (id: number, userData: IUserUpdate) => Promise<boolean>;
    deleteUser: (id: number) => Promise<boolean>;
    changePassword: (id: number, passwordData: IPasswordChange) => Promise<boolean>;
    resetPassword: (email: string) => Promise<string>;
}

// Hook untuk mengambil semua user
export function useUsers(): UseUsersResult {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/user');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch users');
            }

            if (result.success) {
                setUsers(result.data || []);
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const refresh = () => {
        fetchUsers();
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        error,
        refresh,
    };
}

// Hook untuk mengambil user berdasarkan ID
export function useUser(id: number): UseUserResult {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/user?id=${id}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch user');
            }

            if (result.success) {
                setUser(result.data);
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching user:', err);
        } finally {
            setLoading(false);
        }
    }, [id]); // ✅ hanya berubah jika id berubah

    useEffect(() => {
        if (id) fetchUser();
    }, [id, fetchUser]); // ✅ tidak akan looping terus

    const refresh = () => {
        fetchUser();
    };

    return { user, loading, error, refresh };
}

// Hook untuk mutasi data user
export function useUserMutation(): UseUserMutationResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createUser = async (userData: IUserCreate): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create user');
            }

            return result.success;
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating user:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id: number, userData: IUserUpdate): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/user?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update user');
            }

            return result.success;
        } catch (err: any) {
            setError(err.message);
            console.error('Error updating user:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: number): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/user?id=${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete user');
            }

            return result.success;
        } catch (err: any) {
            setError(err.message);
            console.error('Error deleting user:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (id: number, passwordData: IPasswordChange): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/user/password?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to change password');
            }

            return result.success;
        } catch (err: any) {
            setError(err.message);
            console.error('Error changing password:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string): Promise<string> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/user/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to reset password');
            }

            return result.data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error resetting password:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        changePassword,
        resetPassword,
    };
}