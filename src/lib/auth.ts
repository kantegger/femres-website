import type { User } from './db';
import { jsonResponse } from './api';

const AUTH_COOKIE_NAME = 'femres_auth';
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export function getJwtSecret(): string | null {
  return import.meta.env.JWT_SECRET || process.env.JWT_SECRET || null;
}

export function authConfigErrorResponse(): Response {
  return jsonResponse({ error: 'Authentication not configured' }, 503);
}

export function csrfErrorResponse(): Response {
  return jsonResponse({ error: 'Cross-site request rejected' }, 403);
}

function parseOrigin(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: Request): boolean {
  const requestOrigin = new URL(request.url).origin;
  const origin = parseOrigin(request.headers.get('Origin'));
  const refererOrigin = parseOrigin(request.headers.get('Referer'));
  const secFetchSite = request.headers.get('Sec-Fetch-Site');

  if (origin && origin !== requestOrigin) {
    return false;
  }

  if (!origin && refererOrigin && refererOrigin !== requestOrigin) {
    return false;
  }

  return secFetchSite !== 'cross-site';
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;
  for (let i = 0; i < a.length; i++) {
    difference |= a[i] ^ b[i];
  }

  return difference === 0;
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlEncodeString(value: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlDecodeToBytes(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');

  return new Uint8Array(
    atob(base64).split('').map((char) => char.charCodeAt(0))
  );
}

function base64UrlDecodeToString(value: string): string {
  return new TextDecoder().decode(base64UrlDecodeToBytes(value));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

// Use Web Crypto API instead of bcryptjs for Cloudflare Workers compatibility
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordBytes = encoder.encode(password);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Export key as raw bytes
  const keyBytes = await crypto.subtle.exportKey('raw', key);
  
  // Combine salt and key for storage
  const hashArray = new Uint8Array(salt.length + keyBytes.byteLength);
  hashArray.set(salt);
  hashArray.set(new Uint8Array(keyBytes), salt.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...hashArray));
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    
    // Decode hash from base64
    const hashBytes = new Uint8Array(
      atob(hash).split('').map(c => c.charCodeAt(0))
    );
    
    // Extract salt (first 16 bytes) and stored key (rest)
    const salt = hashBytes.slice(0, 16);
    const storedKey = hashBytes.slice(16);
    
    const passwordBytes = encoder.encode(password);
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBytes,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    // Derive key using same parameters
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Export key as raw bytes
    const derivedKeyBytes = await crypto.subtle.exportKey('raw', key);
    const derivedKey = new Uint8Array(derivedKeyBytes);
    
    return constantTimeEqual(derivedKey, storedKey);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export async function generateToken(user: User, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  };
  
  const encoder = new TextEncoder();
  
  // Encode header and payload using RFC 7515 base64url encoding.
  const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
  const encodedPayload = base64UrlEncodeString(JSON.stringify(payload));
  
  const message = `${encodedHeader}.${encodedPayload}`;
  
  // Create signature using HMAC-SHA256
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const encodedSignature = base64UrlEncodeBytes(new Uint8Array(signature));
  
  return `${message}.${encodedSignature}`;
}

export async function verifyToken(token: string, secret: string): Promise<TokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Verify signature
    const encoder = new TextEncoder();
    const message = `${encodedHeader}.${encodedPayload}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    // Decode signature
    const signature = base64UrlDecodeToBytes(encodedSignature);
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      toArrayBuffer(signature),
      encoder.encode(message)
    );
    
    if (!isValid) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(base64UrlDecodeToString(encodedPayload)) as TokenPayload;
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function shouldUseSecureCookie(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...valueParts] = part.split('=');
        const rawValue = valueParts.join('=');
        try {
          return [name, decodeURIComponent(rawValue)];
        } catch {
          return [name, rawValue];
        }
      })
  );
}

export function createAuthCookie(token: string): string {
  return [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${AUTH_COOKIE_MAX_AGE}`,
    shouldUseSecureCookie() ? 'Secure' : ''
  ].filter(Boolean).join('; ');
}

export function clearAuthCookie(): string {
  return [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    shouldUseSecureCookie() ? 'Secure' : ''
  ].filter(Boolean).join('; ');
}

export function extractAuthToken(request: Request): string | null {
  const bearerToken = extractBearerToken(request.headers.get('Authorization'));
  if (bearerToken) {
    return bearerToken;
  }

  const cookies = parseCookieHeader(request.headers.get('Cookie'));
  return cookies[AUTH_COOKIE_NAME] || null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  // Username should be 3-20 characters, alphanumeric plus underscore
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function validatePassword(password: string): boolean {
  // Password should be at least 6 characters
  return password.length >= 6;
}
