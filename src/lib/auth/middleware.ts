import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fatma-dev-secret';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    return verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function requireAdmin(request: NextRequest): AuthUser {
  const user = getAuthUser(request);
  if (!user || !['admin', 'manager', 'owner'].includes(user.role)) {
    throw new Error('Unauthorized');
  }
  return user;
}

export function requireRole(request: NextRequest, roles: string[]): AuthUser {
  const user = getAuthUser(request);
  if (!user || !roles.includes(user.role)) {
    throw new Error('Unauthorized');
  }
  return user;
}
