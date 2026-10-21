// Auth type definitions for the FATMA platform
// Using custom JWT-based auth (not NextAuth runtime)

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'manager' | 'fulfillment' | 'product_manager' | 'support' | 'analyst';
}

export interface JWTPayload {
  sub: string;
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
