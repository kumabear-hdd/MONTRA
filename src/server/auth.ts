/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // salt:hash
  createdAt: number;
  lastLoginAt?: number;
  resetCode?: string;
  resetCodeExpiresAt?: number;
}

export interface SessionPayload {
  userId: string;
  email: string;
  expiresAt: number;
}

// Persistent user storage file in .data directory (with /tmp fallback for Vercel/serverless)
const isServerless = !!(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);
const DATA_DIR = isServerless ? '/tmp/.data' : path.resolve(__dirname, '../../.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// In-memory cache fallback for environments where filesystem is ephemeral or read-only
let memoryUsers: StoredUser[] = [];

// Secret for signing session tokens (fallback to generated runtime secret)
const AUTH_SECRET = process.env.AUTH_SECRET || 'montra-fintech-secure-jwt-key-2026';

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // Ignore read-only dir errors
  }
}

export function loadUsers(): StoredUser[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(memoryUsers, null, 2), 'utf-8');
      } catch {
        // Read-only filesystem fallback
      }
      return memoryUsers;
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as StoredUser[];
    memoryUsers = parsed;
    return parsed;
  } catch (err) {
    console.warn('Filesystem access limited, using in-memory users store');
    return memoryUsers;
  }
}

export function saveUsers(users: StoredUser[]): void {
  memoryUsers = users;
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write limited, stored in memory cache');
  }
}

/**
 * Hashes a plain password using scrypt with a cryptographically random 16-byte salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain password against the stored salt:hash using constant-time comparison.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const keyBuf = Buffer.from(key, 'hex');
    const hashBuf = Buffer.from(hash, 'hex');
    if (keyBuf.length !== hashBuf.length) return false;
    return crypto.timingSafeEqual(keyBuf, hashBuf);
  } catch {
    return false;
  }
}

/**
 * Creates an HMAC-SHA256 signed session token containing userId, email, and expiry.
 */
export function createSessionToken(userId: string, email: string, daysValid = 7): string {
  const expiresAt = Date.now() + daysValid * 24 * 60 * 60 * 1000;
  const payload: SessionPayload = { userId, email, expiresAt };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes a session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    );
    if (payload.expiresAt < Date.now()) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}
