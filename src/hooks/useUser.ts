// src/hooks/useUser.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { IUser, IUserCreate, IUserUpdate, IPasswordReset, IPasswordChange } from '@/types/user';
import { UserAdminFilters } from '@/libs/constant/userFilter';

interface UseUsersResult {
    users: IUser[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
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

interface UseUsersOptions {
    pageSize?: number;
    initialLoad?: boolean;
}

// ============================================================================
// NEW: Hook untuk admin user dengan page-based pagination dan filter
// ============================================================================
interface UseUsersAdminPaginatedOptions {
  pageSize?: number;
  filters?: UserAdminFilters;
}

interface UseUsersAdminPaginatedResult {
  users: IUser[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

export function useUsersAdminPaginated({
  pageSize = 10,
  filters: externalFilters = { search: '', emailVerified: 'all' }
}: UseUsersAdminPaginatedOptions = {}): UseUsersAdminPaginatedResult {
  const [users, setUsers] = useState<IUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      // Add filters
      if (externalFilters.search) {
        params.append('search', externalFilters.search);
      }
      if (externalFilters.emailVerified !== 'all') {
        params.append('emailVerified', externalFilters.emailVerified);
      }

      const response = await fetch(`/api/user/admin?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      if (result.success) {
        setUsers(result.data?.users || []);
        setTotal(result.data?.total || 0);
        setTotalPages(result.data?.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, externalFilters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    total,
    page,
    totalPages,
    setPage,
    refresh: fetchUsers,
  };
}


// Hook untuk mengambil semua user dengan pagination
export function useUsers(options: UseUsersOptions = {}): UseUsersResult {
    const { pageSize = 10, initialLoad = true } = options;
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState<string | null>(null);

    // Gunakan ref untuk menyimpan nilai terbaru dari cursor
    const cursorRef = useRef<string | null>(null);
    useEffect(() => {
        cursorRef.current = cursor;
    }, [cursor]);

    const fetchUsers = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                pageSize: pageSize.toString(),
            });

            const currentCursor = reset ? null : cursorRef.current;
            if (currentCursor) {
                params.append('cursor', currentCursor);
            }

            const response = await fetch(`/api/user?${params.toString()}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch users');
            }

            if (result.success) {
                const newUsers = result.data?.data || [];

                if (reset) {
                    setUsers(newUsers);
                } else {
                    setUsers(prev => [...prev, ...newUsers]);
                }
                
                setHasMore(result.data?.hasMore || false);
                setCursor(result.data?.nextCursor || null);
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchUsers(false);
        }
    }, [loading, hasMore, fetchUsers]);

    const refresh = useCallback(() => {
        setCursor(null);
        setUsers([]);
        setHasMore(true);
        fetchUsers(true);
    }, [fetchUsers]);

    // Efek awal untuk memuat data pertama kali
    useEffect(() => {
        if (initialLoad) {
            fetchUsers(true);
        }
    }, [initialLoad, fetchUsers]);

    return {
        users,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
    };
}

// Hook untuk mengambil user berdasarkan ID (tidak perlu loadMore)
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
    }, [id]);

    useEffect(() => {
        if (id) fetchUser();
    }, [id, fetchUser]);

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