import { z } from 'zod'

export enum Environment {
	Development = 'development',
	Test = 'test',
	Production = 'production',
}

export const envSchema = z.object({
	NODE_ENV: z.enum(Environment).default(Environment.Development),

	PORT: z.coerce.number().optional().default(3000),
	DATABASE_URL: z.url(),

	// DICA: Se seu front roda na porta 3001, o default 3000 vai bloquear os cookies!
	FRONTEND_URL: z.url().default('http://localhost:3000'),

	THROTTLE_LIMIT: z.coerce.number().optional().default(100),

	JWT_ACCESS_SECRET: z.string(),
	JWT_REFRESH_SECRET: z.string(),
	JWT_ACCESS_TTL: z.string(),
	JWT_REFRESH_TTL: z.string(),

	JWT_ACCESS_EXPIRES_IN_MS: z.coerce.number().default(15 * 60 * 1000), // 15 min
	JWT_REFRESH_EXPIRES_IN_MS: z.coerce.number().default(7 * 24 * 60 * 60 * 1000), // 7 dias
})

export type Env = z.infer<typeof envSchema>
