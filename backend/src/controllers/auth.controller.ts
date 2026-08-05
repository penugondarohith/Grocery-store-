import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response.utils';

export class AuthController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Register a new customer
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [fullName, email, password]
   *             properties:
   *               fullName: { type: string, example: "Rohith Penugonda" }
   *               email: { type: string, format: email }
   *               phone: { type: string, example: "+919876543210" }
   *               password: { type: string, minLength: 8 }
   *     responses:
   *       201: { description: User registered }
   *       409: { description: Email already registered }
   *       422: { description: Validation error }
   */
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result, 'Registration successful');
    } catch (err) { next(err); }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Login with email and password
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email: { type: string, format: email }
   *               password: { type: string }
   *     responses:
   *       200: { description: Login successful }
   *       401: { description: Invalid credentials }
   */
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (err) { next(err); }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) { next(err); }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tokens = await authService.refresh(req.body.refreshToken);
      sendSuccess(res, tokens, 'Tokens refreshed');
    } catch (err) { next(err); }
  }

  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const token = await authService.forgotPassword(req.body.email);
      // In production: email the link. Return token for demo.
      sendSuccess(res, { token }, 'Password reset link sent (check your email)');
    } catch (err) { next(err); }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (err) { next(err); }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, req.user, 'Profile fetched');
    } catch (err) { next(err); }
  }
}

export const authController = new AuthController();
