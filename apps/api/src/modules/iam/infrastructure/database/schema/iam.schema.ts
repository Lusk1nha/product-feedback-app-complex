import {
	pgTable,
	serial,
	varchar,
	integer,
	unique,
	text,
	timestamp,
	pgEnum,
	index,
	boolean,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// --- Helpers ---
// Padroniza timestamp para evitar erros de fuso horário
const timestampConfig = { withTimezone: true, mode: 'date' as const }

// --- Enums ---
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER'])

// --- Tabelas ---

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	enabled: boolean('enabled').notNull().default(true),

	username: varchar('username', { length: 50 }).notNull().unique(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	fullName: varchar('full_name', { length: 100 }).notNull(),
	avatarUrl: varchar('avatar_url', { length: 255 }),

	role: userRoleEnum('role').notNull().default('USER'),

	createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', timestampConfig)
		.defaultNow()
		.notNull()
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})

export const accounts = pgTable(
	'accounts',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		provider: varchar('provider', { length: 50 }).notNull(),
		providerAccountId: varchar('provider_account_id', {
			length: 255,
		}).notNull(),
		password: text('password'),

		createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', timestampConfig)
			.defaultNow()
			.notNull()
			.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
	},
	(t) => [
		// Constraints de Unicidade
		unique().on(t.provider, t.providerAccountId),

		// ÍNDICE DE PERFORMANCE: Buscas por userId (Join com usuário)
		index('accounts_user_id_idx').on(t.userId),
	],
)

export const refreshTokens = pgTable(
	'refresh_tokens',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		// UNIQUE cria um índice automático B-Tree, tornando a busca O(log n)
		tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),

		device: varchar('device', { length: 255 }),
		ip: varchar('ip', { length: 45 }),

		expiresAt: timestamp('expires_at', timestampConfig).notNull(),
		createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
	},
	(t) => [
		// ÍNDICE DE PERFORMANCE: Essencial para listar "meus dispositivos logados"
		index('refresh_tokens_user_id_idx').on(t.userId),
	],
)

// --- Relations (Mantido igual, estava correto) ---

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	refreshTokens: many(refreshTokens),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}))

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id],
	}),
}))
