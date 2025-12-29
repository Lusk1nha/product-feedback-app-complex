import type { Config } from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL must be configured.')
}

export default {
	schema: [
		'./src/modules/**/infrastructure/database/schema/*.schema.ts',
		// './src/shared/infrastructure/database/schema.ts',
	],
	out: './migrations',
	dialect: 'postgresql',
	casing: 'snake_case',
	verbose: true,
	strict: true,
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
} satisfies Config
