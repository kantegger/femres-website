import type { User } from './db';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
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
    
    // Compare keys
    return derivedKey.length === storedKey.length && 
           derivedKey.every((byte, i) => byte === storedKey[i]);
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
  
  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/[=]+$/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/[=]+$/g, '');
  
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
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/[=]+$/g, '');
  
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
    const signature = new Uint8Array(
      atob(encodedSignature).split('').map(c => c.charCodeAt(0))
    );
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(message)
    );
    
    if (!isValid) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(atob(encodedPayload)) as TokenPayload;
    
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