import { z } from 'zod';

export const createStockMovementSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  type: z.enum(['IN', 'OUT'], {
    errorMap: () => ({ message: 'Movement type must be IN or OUT' }),
  }),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

export const stockMovementQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  productId: z.string().optional(),
  type: z.enum(['IN', 'OUT']).optional(),
});