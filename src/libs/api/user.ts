// src/libs/user.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IUser, IUserCreate, IUserUpdate } from '@/types/user';
import { comparePassword, generateRandomPassword, hashPassword } from '../auth/password';

export interface IUserPaginatedResponse {
  data: IUser[];
  hasMore: boolean;
  nextCursor: string | null;
}

// === PAGINATED USER FETCHING ===
export async function getAllUsersPaginated(
  pageSize: number,
  cursor: string | null = null
): Promise<IUserPaginatedResponse> {
  let query = `
    SELECT 
      id, email, name, avatar_url, google_id, email_verified, created_at, updated_at
    FROM users
  `;

  const params: any[] = [];

  if (cursor) {
    query += ` AND id < ?`;
    params.push(parseInt(cursor));
  }

  query += ` ORDER BY id DESC LIMIT ?`;
  params.push(pageSize + 1);

  const results = await executeQuery<any>(query, params);
  const data = results.map((row: any) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    avatar_url: row.avatar_url,
    google_id: row.google_id,
    email_verified: Boolean(row.email_verified),
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }));

  // Cek apakah masih ada data
  const hasMore = data.length > pageSize;
  if (hasMore) data.pop(); // Buang item tambahan

  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id.toString() : null;

  return { data, hasMore, nextCursor };
}

// === SINGLE USER BY ID ===
export async function getUserById(id: number): Promise<IUser | null> {
  const result = await executeSingleQuery<any>(
    `SELECT id, email, name, avatar_url, google_id, email_verified, created_at, updated_at FROM users WHERE id = ?`,
    [id]
  );

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

// === GET USER BY EMAIL ===
export async function getUserByEmail(email: string): Promise<IUser | null> {
  const result = await executeSingleQuery<any>(
    `SELECT id, email, password_hash, name, avatar_url, google_id, email_verified, created_at, updated_at FROM users WHERE email = ?`,
    [email]
  );

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

// === CREATE USER ===
export async function createUser(userData: IUserCreate): Promise<IUser> {
  const { email, password, name } = userData;
  const passwordHash = await hashPassword(password);

  const result = await executeQuery<any>(
    `INSERT INTO users (email, password_hash, name, email_verified) VALUES (?, ?, ?, ?)`,
    [email, passwordHash, name, 0]
  );

  const newId = (result as any).insertId;
  const newUser = await getUserById(newId);
  if (!newUser) throw new Error('Failed to retrieve created user');

  return newUser;
}

// === UPDATE USER ===
export async function updateUser(id: number, userData: IUserUpdate): Promise<boolean> {
  const { name } = userData;

  const result = await executeQuery<any>(
    `UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [name, id]
  );

  return (result as any).affectedRows > 0;
}

// === CHANGE PASSWORD ===
export async function changeUserPassword(
  id: number,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const user = await executeSingleQuery<any>(
    `SELECT password_hash FROM users WHERE id = ?`,
    [id]
  );

  if (!user) return false;

  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
  if (!isCurrentPasswordValid) return false;

  const newPasswordHash = await hashPassword(newPassword);

  const result = await executeQuery<any>(
    `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [newPasswordHash, id]
  );

  return (result as any).affectedRows > 0;
}

// === RESET PASSWORD ===
export async function resetUserPassword(email: string): Promise<string> {
  const newPassword = generateRandomPassword(12);
  const passwordHash = await hashPassword(newPassword);

  const result = await executeQuery<any>(
    `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?`,
    [passwordHash, email]
  );

  if ((result as any).affectedRows === 0) {
    throw new Error('User not found');
  }

  return newPassword;
}

// === DELETE USER ===
export async function deleteUser(id: number): Promise<boolean> {
  const result = await executeQuery<any>(
    `DELETE FROM users WHERE id = ?`,
    [id]
  );

  return (result as any).affectedRows > 0;
}