import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z
    .string()
    .min(2, 'SKU must be at least 2 characters')
    .transform((val) => val.trim().toUpperCase()),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  unitPrice: z.coerce.number().positive('Unit price must be a positive number'),
  currentStock: z.coerce.number().int().nonnegative('Current stock cannot be negative').optional().default(0),
  minimumStock: z.coerce.number().int().nonnegative('Minimum stock threshold cannot be negative').optional().default(0),
  warehouseLocation: z.string().optional().or(z.literal('')),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  lowStock: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
});