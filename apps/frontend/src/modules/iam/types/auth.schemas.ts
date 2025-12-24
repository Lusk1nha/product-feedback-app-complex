import { z } from 'zod'

export const loginSchema = z.object({
	email: z.email('Invalid email'),
	password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export const registerSchema = z.object({
	fullName: z.string().min(3, 'Name must be at least 3 characters long'),
	username: z
		.string()
		.min(3, 'Username too short')
		.regex(
			/^[a-z0-9_]+$/,
			'Only lowercase letters, numbers, and underscores are allowed',
		),
	email: z.email('Invalid email'),
	password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export const loginResponseSchema = z.object({
	accessToken: z.string(),
})

// --- Tipos Inferidos (TypeScript Automático) ---
export type LoginDto = z.infer<typeof loginSchema>
export type RegisterDto = z.infer<typeof registerSchema>
export type AuthResponse = z.infer<typeof loginResponseSchema>
