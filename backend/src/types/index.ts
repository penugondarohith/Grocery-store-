// ================================================================
// Centralised types for the entire backend
// ================================================================

import { Request } from 'express';
import { UserRole } from '@prisma/client';

// Authenticated request — user attached by auth middleware
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
  };
}

// Standard API response envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationMeta;
  errors?: ValidationError[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Query params for list endpoints
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface ProductFilterQuery extends PaginationQuery {
  categoryId?: string;
  subcategoryId?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  isFeatured?: string;
  isPopular?: string;
}

// JWT Payload
export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: UserRole;
  fullName: string;
  iat?: number;
  exp?: number;
}

// Token pair
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
