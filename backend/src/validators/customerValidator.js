import { z } from 'zod';

const customerTypeEnum = z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'], {
  errorMap: () => ({ message: 'customerType must be RETAIL, WHOLESALE, or DISTRIBUTOR' }),
});

const customerStatusEnum = z.enum(['LEAD', 'ACTIVE', 'INACTIVE'], {
  errorMap: () => ({ message: 'status must be LEAD, ACTIVE, or INACTIVE' }),
});

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Contact person name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  gstNumber: z.string().optional().or(z.literal('')),
  customerType: customerTypeEnum,
  status: customerStatusEnum.optional().default('LEAD'),
  address: z.string().optional().or(z.literal('')),
  followUpDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullable(),
  notes: z.string().optional().or(z.literal('')),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  status: customerStatusEnum.optional(),
  customerType: customerTypeEnum.optional(),
});

export const createFollowUpSchema = z.object({
  note: z.string().min(3, 'Follow-up note must be at least 3 characters'),
  followUpDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).nullable(),
});