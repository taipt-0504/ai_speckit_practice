import { z } from 'zod';

// User schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Transaction schemas
export const TransactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  amount: z.number().int('Amount must be an integer').positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  date: z.coerce
    .date()
    .refine((value) => value.getTime() <= Date.now(), 'Transaction date cannot be in the future'),
  categoryId: z.string().min(1, 'Category is required'),
  notes: z.string().optional().nullable(),
});

export const TransactionUpdateSchema = TransactionSchema.partial();

// Category schemas
export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
});

// SpendingLimit schemas
export const SpendingLimitSchema = z.object({
  limitType: z.enum(['monthly_total', 'category']),
  amount: z.number().int('Amount must be an integer').positive('Amount must be positive'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  categoryId: z.string().optional().nullable(),
});

export const SpendingLimitUpdateSchema = SpendingLimitSchema.partial();

// Export types
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type TransactionInput = z.infer<typeof TransactionSchema>;
export type TransactionUpdateInput = z.infer<typeof TransactionUpdateSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type SpendingLimitInput = z.infer<typeof SpendingLimitSchema>;
export type SpendingLimitUpdateInput = z.infer<typeof SpendingLimitUpdateSchema>;

export function canAccessCategory(
  isDefault: boolean,
  ownerId: string | null,
  userId: string,
  role: string
): boolean {
  if (isDefault) {
    return true;
  }

  if (role === 'admin') {
    return true;
  }

  return ownerId === userId;
}
