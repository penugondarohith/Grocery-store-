import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { UnauthorizedError } from '../utils/errors';
import { AuthRequest } from '../types';
import prisma from '../config/database';

/**
 * Protect routes — verifies Bearer JWT and attaches user to req.user
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, isActive: true, deletedAt: null },
      select: { id: true, email: true, role: true, fullName: true },
    });

    if (!user) throw new UnauthorizedError('User not found or deactivated');

    req.user = user;
    next();
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.name === 'TokenExpiredError'
        ? 'Token expired'
        : err instanceof Error && err.name === 'JsonWebTokenError'
        ? 'Invalid token'
        : err instanceof UnauthorizedError
        ? err.message
        : 'Authentication failed';

    next(new UnauthorizedError(message));
  }
};

/**
 * Optional authentication — attaches user if token present, continues if not
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  return authenticate(req, _res, next);
};
