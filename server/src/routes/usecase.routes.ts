import { Router } from 'express';
import { useCaseController } from '../controllers/usecase.controller';
import { authMiddleware, requireAdmin, requireCommitteeOrAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createUseCaseSchema,
  updateUseCaseSchema,
  scoreUseCaseSchema,
  useCaseQuerySchema,
} from '../validators/usecase.validator';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/use-cases - List use cases with filtering
router.get(
  '/',
  validate(useCaseQuerySchema, 'query'),
  (req, res) => useCaseController.findAll(req, res)
);

// POST /api/use-cases - Create use case
router.post(
  '/',
  validate(createUseCaseSchema),
  (req, res) => useCaseController.create(req, res)
);

// GET /api/use-cases/:id - Get single use case
router.get(
  '/:id',
  (req, res) => useCaseController.findById(req, res)
);

// PATCH /api/use-cases/:id - Update use case
router.patch(
  '/:id',
  validate(updateUseCaseSchema),
  (req, res) => useCaseController.update(req, res)
);

// PATCH /api/use-cases/:id/score - Score use case (Committee/Admin only)
router.patch(
  '/:id/score',
  requireCommitteeOrAdmin,
  validate(scoreUseCaseSchema),
  (req, res) => useCaseController.score(req, res)
);

// DELETE /api/use-cases/:id - Delete use case (Admin only)
router.delete(
  '/:id',
  requireAdmin,
  (req, res) => useCaseController.delete(req, res)
);

export default router;
