import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware, requireAdmin, requireCommitteeOrAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateUserSchema, userQuerySchema } from '../validators/user.validator';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users/owner-candidates - Get users who can be assigned as owners (Committee/Admin)
router.get(
  '/owner-candidates',
  requireCommitteeOrAdmin,
  (req, res) => userController.getOwnerCandidates(req, res)
);

// GET /api/users - List all users (Admin only)
router.get(
  '/',
  requireAdmin,
  validate(userQuerySchema, 'query'),
  (req, res) => userController.findAll(req, res)
);

// GET /api/users/:id - Get single user (Admin only)
router.get(
  '/:id',
  requireAdmin,
  (req, res) => userController.findById(req, res)
);

// PATCH /api/users/:id - Update user (Admin only)
router.patch(
  '/:id',
  requireAdmin,
  validate(updateUserSchema),
  (req, res) => userController.update(req, res)
);

// DELETE /api/users/:id - Delete user (Admin only)
router.delete(
  '/:id',
  requireAdmin,
  (req, res) => userController.delete(req, res)
);

export default router;
