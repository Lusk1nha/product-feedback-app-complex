import { PgTimestampConfig } from 'drizzle-orm/pg-core'

// Padroniza timestamp para evitar erros de fuso horário
export const timestampConfig = {
	withTimezone: true,
	mode: 'date' as const,
} as PgTimestampConfig<'string' | 'date'>
