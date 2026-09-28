import { createHash, randomBytes, pbkdf2Sync } from 'crypto';

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha256';

/**
 * Hash a password with PBKDF2
 * @param {string} password - Plain text password
 * @param {string} [existingSalt] - Existing salt (hex string) for verification
 * @returns {{ hash: string, salt: string }} - Hex-encoded hash and salt
 */
export function hashPassword(password, existingSalt) {
  const salt = existingSalt
    ? Buffer.from(existingSalt, 'hex')
    : randomBytes(16);

  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);

  return {
    hash: hash.toString('hex'),
    salt: salt.toString('hex')
  };
}

/**
 * Verify a password against a stored hash
 * @param {string} password - Plain text password to verify
 * @param {string} storedHash - Hex-encoded stored hash
 * @param {string} storedSalt - Hex-encoded stored salt
 * @returns {boolean}
 */
export function verifyPassword(password, storedHash, storedSalt) {
  const { hash } = hashPassword(password, storedSalt);
  // Timing-safe comparison
  if (hash.length !== storedHash.length) return false;
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
