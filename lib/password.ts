/**
 * Password hashing utilities using Node.js built-in crypto.scrypt.
 * No external dependencies required.
 *
 * Hash format: <hex-salt>:<hex-derived-key>
 * Salt length: 16 bytes (32 hex chars)
 * Key length:  64 bytes (128 hex chars)
 */

import crypto from 'crypto';

const SALT_BYTES = 16;
const KEY_BYTES  = 64;

/**
 * Hash a plaintext password using scrypt with a random salt.
 * Returns a string in the format "salt:hash" (both hex-encoded).
 */
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
    crypto.scrypt(password, salt, KEY_BYTES, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify a plaintext password against a stored hash.
 * Returns true if the password matches, false otherwise.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, storedKey] = hash.split(':');
    if (!salt || !storedKey) {
      resolve(false);
      return;
    }
    const storedKeyBuf = Buffer.from(storedKey, 'hex');
    crypto.scrypt(password, salt, KEY_BYTES, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      // Timing-safe comparison prevents enumeration attacks
      try {
        resolve(crypto.timingSafeEqual(derivedKey, storedKeyBuf));
      } catch {
        resolve(false);
      }
    });
  });
}
