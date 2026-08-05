import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import {
  registerSchema, loginSchema, refreshTokenSchema,
  forgotPasswordSchema, resetPasswordSchema,
} from '../schemas';

const router = Router();

// POST /auth/register
router.post('/register', authLimiter, validate(registerSchema), authController.register.bind(authController));

// POST /auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login.bind(authController));

// POST /auth/logout
router.post('/logout', validate(refreshTokenSchema), authController.logout.bind(authController));

// POST /auth/refresh
router.post('/refresh', validate(refreshTokenSchema), authController.refresh.bind(authController));

// POST /auth/forgot-password
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));

// POST /auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));

// GET /auth/me (protected)
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
