// src/libs/auth/database.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { hashPassword, comparePassword } from './password';
import { DBUser } from '@/types/database';

// Create new user
export async function createUser(userData: {
  email: string;
  password?: string;
  name?: string;
  google_id?: string;
  avatar_url?: string;
}): Promise<{ id: number; email: string; name?: string }> {
  const { email, password, name, google_id, avatar_url } = userData;
  
  let password_hash = null;
  if (password) {
    password_hash = await hashPassword(password);
  }
  
  const result = await executeSingleQuery<DBUser>(
    `INSERT INTO users (email, password_hash, name, google_id, avatar_url, email_verified)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING id, email, name`,
    [email, password_hash, name || null, google_id || null, avatar_url || null, !!google_id]
  );
  
  if (!result) {
    throw new Error('Failed to create user');
  }
  
  return {
    id: result.id,
    email: result.email,
    name: result.name,
  };
}

// Find user by email
export async function findUserByEmail(email: string): Promise<DBUser | null> {
  return await executeSingleQuery<DBUser>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
}

// Find user by Google ID
export async function findUserByGoogleId(googleId: string): Promise<DBUser | null> {
  return await executeSingleQuery<DBUser>(
    'SELECT * FROM users WHERE google_id = ?',
    [googleId]
  );
}

// Find user by ID
export async function findUserById(id: number): Promise<DBUser | null> {
  return await executeSingleQuery<DBUser>(
    'SELECT id, email, name, avatar_url, email_verified,created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
}

// Update user
export async function updateUser(
  id: number,
  userData: {
    name?: string;
    avatar_url?: string;
    email_verified?: boolean;
    google_id?: string;
  }
): Promise<void> {
  const { name, avatar_url, email_verified } = userData;
  
  await executeQuery(
    'UPDATE users SET name = ?, avatar_url = ?, email_verified = ? WHERE id = ?',
    [name, avatar_url, email_verified, id]
  );
}

// Update password
export async function updatePassword(id: number, password: string): Promise<void> {
  const password_hash = await hashPassword(password);
  await executeQuery(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [password_hash, id]
  );
}

// Validate user credentials
export async function validateUserCredentials(
  email: string,
  password: string
): Promise<DBUser | null> {
  const user = await findUserByEmail(email);
  
  if (!user || !user.password_hash) {
    return null;
  }
  
  const isValid = await comparePassword(password, user.password_hash);
  
  if (!isValid) {
    return null;
  }
  
  return user;
}

// Check if user exists
export async function userExists(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return !!user;
}
