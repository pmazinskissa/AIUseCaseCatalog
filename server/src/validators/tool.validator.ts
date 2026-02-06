import { z } from 'zod';

export const createToolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().optional(),
});

export const updateToolSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
});

export const toolQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  search: z.string().optional(),
});

export type CreateToolInput = z.infer<typeof createToolSchema>;
export type UpdateToolInput = z.infer<typeof updateToolSchema>;
export type ToolQueryInput = z.infer<typeof toolQuerySchema>;
