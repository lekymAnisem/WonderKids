import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(2).max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number')
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(255)
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number')
});
