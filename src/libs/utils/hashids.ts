// pkm-maros-profil-app\src\libs\utils\hashids.ts
import Hashids from 'hashids';

/**
 * Hashids configuration for ID encryption/decryption
 *
 * This utility provides reversible encryption for database IDs to prevent:
 * - ID enumeration attacks
 * - Direct database structure exposure
 * - Easy guessing of sequential IDs
 *
 * Example:
 * - Database ID: 1, 2, 3, 4, 5
 * - Encrypted: "aB4xK9m", "qL2nP8r", "xJ7vZ3w", ...
 */

const hashids = new Hashids(
  process.env.NEXT_PUBLIC_HASHIDS_SECRET || 'pkm-maros-secret-key-change-in-production',
  8, // minimum length of encoded hash
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890' // charset (no ambiguous chars like 0O1l)
);

/**
 * Encode a numeric ID to hash string
 * @param id - The database ID to encode
 * @returns Encoded hash string
 */
export function encodeId(id: number | string): string {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numId)) {
    throw new Error(`Invalid ID for encoding: ${id}`);
  }
  return hashids.encode(numId);
}

/**
 * Decode a hash string back to numeric ID
 * @param hash - The encoded hash string
 * @returns The original database ID
 * @throws Error if hash is invalid or malformed
 */
export function decodeId(hash: string): number {
  if (!hash || typeof hash !== 'string') {
    throw new Error(`Invalid hash for decoding: ${hash}`);
  }

  const decoded = hashids.decode(hash);

  if (decoded.length === 0) {
    throw new Error(`Failed to decode hash: ${hash}`);
  }

  // hashids.decode returns an array of numbers
  return decoded[0] as number;
}

/**
 * Encode multiple IDs at once
 * @param ids - Array of database IDs
 * @returns Array of encoded hash strings
 */
export function encodeIds(ids: (number | string)[]): string[] {
  return ids.map(id => encodeId(id));
}

/**
 * Decode multiple hashes at once
 * @param hashes - Array of encoded hash strings
 * @returns Array of database IDs
 */
export function decodeIds(hashes: string[]): number[] {
  return hashes.map(hash => decodeId(hash));
}

/**
 * Helper to safely decode ID with fallback
 * @param hash - The encoded hash string
 * @param fallback - Fallback value if decoding fails
 * @returns The decoded ID or fallback value
 */
export function safeDecodeId(hash: string, fallback: number = 0): number {
  try {
    return decodeId(hash);
  } catch {
    return fallback;
  }
}
