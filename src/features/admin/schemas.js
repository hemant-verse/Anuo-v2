import { z } from 'zod';

export const rejectProductSchema = z.object({
  reason: z.string().trim().max(500).optional().default(''),
}).strict();

export const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  adminId: z.string().trim().optional().default(''),
  productId: z.string().trim().optional().default(''),
  action: z.enum(['APPROVE', 'REJECT', 'UPDATE', 'DELETE']).optional().default(''),
}).strict();
