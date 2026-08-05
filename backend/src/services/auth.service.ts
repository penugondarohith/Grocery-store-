import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateTokenPair, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt.utils';
import {
  ConflictError, UnauthorizedError, NotFoundError, BadRequestError,
} from '../utils/errors';
import { TokenPair } from '../types';
import { User } from '@prisma/client';

export class AuthService {
  /** Register a new customer */
  async register(data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ user: Omit<User, 'password'>; tokens: TokenPair }> {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])] },
    });
    if (existing) {
      throw new ConflictError(
        existing.email === data.email ? 'Email already registered' : 'Phone already registered'
      );
    }

    const hashed = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { ...data, password: hashed },
    });

    // Create empty cart for new user
    await prisma.cart.create({ data: { userId: user.id } });

    const tokens = generateTokenPair(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as Omit<User, 'password'>, tokens };
  }

  /** Login with email + password */
  async login(email: string, password: string): Promise<{ user: Omit<User, 'password'>; tokens: TokenPair }> {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedError('Account is deactivated');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const tokens = generateTokenPair(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as Omit<User, 'password'>, tokens };
  }

  /** Logout — delete refresh token from DB */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  /** Refresh token rotation */
  async refresh(refreshToken: string): Promise<TokenPair> {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored) throw new UnauthorizedError('Invalid refresh token');
    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw new UnauthorizedError('Refresh token expired');
    }

    // Verify signature
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, isActive: true, deletedAt: null },
    });
    if (!user) throw new UnauthorizedError('User not found');

    // Token rotation: delete old, issue new
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const tokens = generateTokenPair(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  /** Forgot password — returns token (real app would email this) */
  async forgotPassword(email: string): Promise<string> {
    const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (!user) throw new NotFoundError('User');
    // In production: generate a signed short-lived token and email the link
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    return token;
  }

  /** Reset password */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [userId, timestamp] = decoded.split(':');
      if (Date.now() - parseInt(timestamp) > 60 * 60 * 1000) {
        throw new BadRequestError('Reset token expired');
      }
      const hashed = await hashPassword(newPassword);
      await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
      // Invalidate all refresh tokens
      await prisma.refreshToken.deleteMany({ where: { userId } });
    } catch {
      throw new BadRequestError('Invalid or expired reset token');
    }
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    await prisma.refreshToken.create({
      data: { userId, token, expiresAt: getRefreshTokenExpiry() },
    });
  }
}

export const authService = new AuthService();
