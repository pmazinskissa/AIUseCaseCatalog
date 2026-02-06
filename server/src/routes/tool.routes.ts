import { Router } from 'express';
import { toolController } from '../controllers/tool.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createToolSchema,
  updateToolSchema,
  toolQuerySchema,
} from '../validators/tool.validator';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/tools - List all tools (any authenticated user)
router.get(
  '/',
  validate(toolQuerySchema, 'query'),
  (req, res) => toolController.findAll(req, res)
);

// POST /api/tools - Create tool (admin only)
router.post(
  '/',
  requireAdmin,
  validate(createToolSchema),
  (req, res) => toolController.create(req, res)
);

// GET /api/tools/:id - Get tool by ID
router.get(
  '/:id',
  (req, res) => toolController.findById(req, res)
);

// PATCH /api/tools/:id - Update tool (admin only)
router.patch(
  '/:id',
  requireAdmin,
  validate(updateToolSchema),
  (req, res) => toolController.update(req, res)
);

// DELETE /api/tools/:id - Delete tool (admin only)
router.delete(
  '/:id',
  requireAdmin,
  (req, res) => toolController.delete(req, res)
);

export default router;
