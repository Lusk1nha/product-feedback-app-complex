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

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_TTL: z.string(),
  JWT_REFRESH_TTL: z.string(),
})

export type Env = z.infer<typeof envSchema>
