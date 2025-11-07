// src/libs/user.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IUser, IUserCreate, IUserUpdate } from '@/types/user';
import bcrypt from 'bcryptjs';
import { comparePassword, generateRandomPassword, hashPassword } from '../auth/password';

// Mengambil semua user
export async function getAllUsers(): Promise<IUser[]> {
    const results = await executeQuery<any>(`
    SELECT id, email, name, avatar_url, google_id, email_verified, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `);

    return results.map((row: any) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        avatar_url: row.avatar_url,
        google_id: row.google_id,
        email_verified: Boolean(row.email_verified),
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString(),
    }));
}

// Mengambil user berdasarkan ID
export async function getUserById(id: number): Promise<IUser | null> {
    const result = await executeSingleQuery<any>(`
    SELECT id, email, name, avatar_url, google_id, email_verified, created_at, updated_at
    FROM users
    WHERE id = ?
  `, [id]);

    if (!result) return null;

    return {
        id: result.id,
        email: result.email,
        name: result.name,
        avatar_url: result.avatar_url,
        google_id: result.google_id,
        email_verified: Boolean(result.email_verified),
        created_at: result.created_at.toISOString(),
        updated_at: result.updated_at.toISOString(),
    };
}

// Mengambil user berdasarkan email
export async function getUserByEmail(email: string): Promise<IUser | null> {
    const result = await executeSingleQuery<any>(`
    SELECT id, email, password_hash, name, avatar_url, google_id, email_verified, created_at, updated_at
    FROM users
    WHERE email = ?
  `, [email]);

    if (!result) return null;

    return {
        id: result.id,
        email: result.email,
        // password_hash: result.password_hash,
        name: result.name,
        avatar_url: result.avatar_url,
        google_id: result.google_id,
        email_verified: Boolean(result.email_verified),
        created_at: result.created_at.toISOString(),
        updated_at: result.updated_at.toISOString(),
    };
}

// Membuat user baru
export async function createUser(userData: IUserCreate): Promise<IUser> {
    const { email, password, name } = userData;

    // Hash password
    const passwordHash = await hashPassword(password);

    const result = await executeQuery<any>(`
    INSERT INTO users (email, password_hash, name, email_verified)
    VALUES (?, ?, ?, ?)
  `, [email, passwordHash, name, 0]);

    // Ambil user yang baru dibuat
    const newId = (result as any).insertId;
    const newUser = await getUserById(newId);
    if (!newUser) {
        throw new Error('Failed to retrieve created user');
    }

    return newUser;
}

// Memperbarui user
export async function updateUser(id: number, userData: IUserUpdate): Promise<boolean> {
    const { name } = userData;

  const result = await executeQuery<any>(
    `
    UPDATE users
    SET name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [name, id]
  );

    return (result as any).affectedRows > 0;
}

// Mengubah password user
export async function changeUserPassword(id: number, currentPassword: string, newPassword: string): Promise<boolean> {
    // Ambil user untuk verifikasi password lama
    const user = await executeSingleQuery<any>(`
    SELECT password_hash FROM users WHERE id = ?
  `, [id]);

    if (!user) return false;

    // Verifikasi password lama
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) return false;

    // Hash password baru
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    const [result] = await executeQuery<any>(`
    UPDATE users
    SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [newPasswordHash, id]);

    return (result as any).affectedRows > 0;
}

// Reset password user
export async function resetUserPassword(email: string): Promise<string> {
    // Generate random password
    //   const newPassword = Math.random().toString(36).slice(-8);
    const newPassword = generateRandomPassword(12);

    // Hash password
    //   const passwordHash = await bcrypt.hash(newPassword, 10);

    const passwordHash = await hashPassword(newPassword);

    // Update password
    const result = await executeQuery<any>(`
    UPDATE users
    SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
    WHERE email = ?
  `, [passwordHash, email]);

    if ((result as any).affectedRows === 0) {
        throw new Error('User not found');
    }

    return newPassword;
}

// Menghapus user
export async function deleteUser(id: number): Promise<boolean> {
    const result = await executeQuery<any>(`
    DELETE FROM users WHERE id = ?
  `, [id]);

    return (result as any).affectedRows > 0;
}