import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

// POST /api/auth/register - Create user (Admin only)
router.post(
  '/register',
  authMiddleware,
  requireAdmin,
  validate(registerSchema),
  (req, res) => authController.register(req, res)
);

// POST /api/auth/login - Login and get JWT
router.post(
  '/login',
  validate(loginSchema),
  (req, res) => authController.login(req, res)
);

// GET /api/auth/me - Get current user
router.get(
  '/me',
  authMiddleware,
  (req, res) => authController.me(req, res)
);

export default router;
