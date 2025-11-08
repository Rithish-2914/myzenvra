import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for authentication');
}

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'admin_token';

export interface AdminTokenPayload {
  adminId: string;
  adminEmail: string;
  adminName: string;
}

// Create JWT token for admin
export function createAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

// Set admin cookie
export function setAdminCookie(res: VercelResponse, token: string) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  res.setHeader('Set-Cookie', cookie);
}

// Clear admin cookie
export function clearAdminCookie(res: VercelResponse) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  res.setHeader('Set-Cookie', cookie);
}

// Get admin from request
export function getAdminFromRequest(req: VercelRequest): AdminTokenPayload | null {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  
  if (!token) return null;
  
  return verifyAdminToken(token);
}

// Middleware to require admin authentication
export function requireAdmin(
  handler: (req: VercelRequest, res: VercelResponse, admin: AdminTokenPayload) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const admin = getAdminFromRequest(req);
    
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized - Admin access required' });
    }
    
    return handler(req, res, admin);
  };
}
