import { z } from 'zod'

const envSchema = z.object({
	VITE_API_URL: z.string(),
	VITE_API_TARGET: z.url(),
	VITE_ENABLE_LOGS: z
		.string()
		.optional()
		.transform((val) => val === 'true'),

	MODE: z.enum(['development', 'production', 'test']).default('development'),
	DEV: z.boolean(),
	PROD: z.boolean(),
})

const _env = envSchema.safeParse(import.meta.env)

if (!_env.success) {
	console.error('❌ Invalid environment variables:', z.treeifyError(_env.error))
	throw new Error('Invalid environment variables. Check your .env file.')
}

export const env = _env.data
