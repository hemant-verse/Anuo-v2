import { z } from 'zod';

const contactValue = (min, max) => z.string().trim().min(min).max(max).optional().or(z.literal(''));
const categories = ['Books', 'Electronics', 'Dorm', 'Fashion', 'Other'];
const conditions = ['New', 'Like New', 'Good', 'Fair'];
const availabilityStatuses = ['AVAILABLE', 'RESERVED', 'SOLD'];
const moderationStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

const contactsShape = z.object({
  whatsapp: contactValue(8, 20),
  telegram: contactValue(2, 50),
  instagram: contactValue(2, 50),
}).strict().refine((data) => Boolean(data.whatsapp || data.telegram || data.instagram), {
  message: 'At least one contact method must be provided.',
  path: ['contacts'],
});

export const createProductSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1000),
  price: z.coerce.number().finite().min(0),
  isNegotiable: z.preprocess((value) => value === true || value === 'true', z.boolean()).default(false),
  category: z.enum(categories),
  condition: z.enum(conditions),
  images: z.array(z.string().trim().min(1)).max(10).default([]),
  contacts: contactsShape,
}).strict();

export const updateProductSchema = z.object({
  title: z.string().trim().min(3).max(100).optional(),
  description: z.string().trim().min(10).max(1000).optional(),
  price: z.coerce.number().finite().min(0).optional(),
  isNegotiable: z.preprocess((value) => value === true || value === 'true', z.boolean()).optional(),
  category: z.enum(categories).optional(),
  condition: z.enum(conditions).optional(),
  images: z.array(z.string().trim().min(1)).max(10).optional(),
  contacts: contactsShape.optional(),
  availabilityStatus: z.enum(availabilityStatuses).optional(),
}).strict();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.enum(['ALL', ...categories]).default('ALL'),
  search: z.string().trim().max(100).optional().default(''),
  mine: z.preprocess((value) => value === true || value === 'true', z.boolean()).default(false),
}).strict();

export const moderateProductSchema = z.object({
  moderationStatus: z.enum(moderationStatuses),
}).strict();

