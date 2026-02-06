import { z } from 'zod';
import { Status, ApprovalStatus } from '@prisma/client';

export const createUseCaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().min(1, 'Description is required'),
  problemStatement: z.string().optional(),
  clientProject: z.string().max(200, 'Client/Project name is too long').optional(),
  toolIds: z.array(z.string().uuid()).optional(),
});

export const updateUseCaseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  problemStatement: z.string().optional(),
  clientProject: z.string().max(200).optional(),
  status: z.nativeEnum(Status).optional(),
  notes: z.string().optional(),
  toolIds: z.array(z.string().uuid()).optional(),
});

export const scoreUseCaseSchema = z.object({
  businessImpact: z.number().int().min(1).max(5).optional(),
  feasibility: z.number().int().min(1).max(5).optional(),
  strategicAlignment: z.number().int().min(1).max(5).optional(),
  approvalStatus: z.nativeEnum(ApprovalStatus).optional(),
  ownerId: z.string().uuid().nullable().optional(),
  notes: z.string().optional(),
});

export const useCaseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
  approvalStatus: z.nativeEnum(ApprovalStatus).optional(),
  submitterId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  sortBy: z.enum(['dateSubmitted', 'compositeScore', 'name', 'createdAt']).optional().default('dateSubmitted'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateUseCaseInput = z.infer<typeof createUseCaseSchema>;
export type UpdateUseCaseInput = z.infer<typeof updateUseCaseSchema>;
export type ScoreUseCaseInput = z.infer<typeof scoreUseCaseSchema>;
export type UseCaseQueryInput = z.infer<typeof useCaseQuerySchema>;
