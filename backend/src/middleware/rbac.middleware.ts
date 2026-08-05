import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Role-Based Access Control middleware.
 * Usage: authorize('admin') or authorize('admin', 'super_admin')
 */
export const authorize =
  (...roles: UserRole[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role: ${roles.join(' or ')}`
        )
      );
    }
    next();
  };

// Convenience helpers
export const adminOnly = authorize('admin', 'super_admin');
export const superAdminOnly = authorize('super_admin');
export const customerOnly = authorize('customer');
