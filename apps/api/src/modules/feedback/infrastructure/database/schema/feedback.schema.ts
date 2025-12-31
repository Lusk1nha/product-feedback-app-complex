import {
	pgTable,
	varchar,
	timestamp,
	boolean,
	integer,
	serial,
	text,
	primaryKey,
	index,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { timestampConfig } from 'src/shared/infrastructure/database/schema.utils'
import { users } from 'src/shared/infrastructure/database/schema'

// 1. Tabela de Categorias (Lookup Table)
export const feedbackCategories = pgTable('feedback_categories', {
	slug: varchar('slug', { length: 50 }).primaryKey(),
	label: varchar('label', { length: 50 }).notNull(),

	order: integer('order').default(0).notNull(),

	enabled: boolean('enabled').default(true).notNull(),

	createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', timestampConfig)
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
})

// 2. Tabela de Status (Lookup Table)
export const feedbackStatuses = pgTable('feedback_statuses', {
	slug: varchar('slug', { length: 50 }).primaryKey(),

	label: varchar('label', { length: 50 }).notNull(),
	hexColor: varchar('hex_color', { length: 7 }).notNull(),

	// Permite que o Backend diga: Planned é 1, In-Progress é 2, Live é 3.
	order: integer('order').default(0).notNull(),

	includeInRoadmap: boolean('include_in_roadmap').default(false).notNull(),

	enabled: boolean('enabled').default(true).notNull(),

	createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', timestampConfig)
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
})

// 3. Tabela de Feedbacks (Table)
export const feedbacks = pgTable(
	'feedbacks',
	{
		id: serial('id').primaryKey(),

		title: varchar('title', { length: 255 }).notNull(),
		description: text('description').notNull(),

		authorId: integer('author_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		categorySlug: varchar('category_slug', { length: 50 })
			.notNull()
			.references(() => feedbackCategories.slug),

		statusSlug: varchar('status_slug', { length: 50 })
			.notNull()
			.references(() => feedbackStatuses.slug),

		// DESNORMALIZAÇÃO:
		// Mantemos o contador aqui. O Elixir vai ler esse campo para fazer o broadcast inicial.
		// O NestJS será responsável por incrementar/decrementar isso atomicamente.
		upvotesCount: integer('upvotes_count').default(0).notNull(),

		enabled: boolean('enabled').default(true).notNull(),

		createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', timestampConfig)
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => {
		return {
			// 1. Índice para filtrar por categoria rapidamente
			categoryIdx: index('feedback_category_idx').on(table.categorySlug),

			// 2. Índice para ordenação (Upvotes é o mais usado)
			upvotesIdx: index('feedback_upvotes_idx').on(table.upvotesCount),

			// 3. Índice Composto (Opcional, mas muito rápido para "Filtrar Categoria + Ordenar Upvotes")
			categoryUpvotesIdx: index('feedback_category_upvotes_idx').on(
				table.categorySlug,
				table.upvotesCount,
			),
		}
	},
)

// 5. Tabela de Upvotes (Table)
export const upvotes = pgTable(
	'upvotes',
	{
		feedbackId: integer('feedback_id')
			.notNull()
			.references(() => feedbacks.id, { onDelete: 'cascade' }),

		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
	},
	(table) => [
		{
			pk: primaryKey({
				columns: [table.feedbackId, table.userId],
			}),
		},
	],
)

// --- Relations ---
export const feedbacksRelations = relations(feedbacks, ({ one, many }) => ({
	author: one(users, {
		fields: [feedbacks.authorId],
		references: [users.id],
	}),
	category: one(feedbackCategories, {
		fields: [feedbacks.categorySlug],
		references: [feedbackCategories.slug],
	}),
	status: one(feedbackStatuses, {
		fields: [feedbacks.statusSlug],
		references: [feedbackStatuses.slug],
	}),
	// Relação para saber quem votou neste feedback
	upvotes: many(upvotes),
}))

export const upvotesRelations = relations(upvotes, ({ one }) => ({
	feedback: one(feedbacks, {
		fields: [upvotes.feedbackId],
		references: [feedbacks.id],
	}),
	user: one(users, {
		fields: [upvotes.userId],
		references: [users.id],
	}),
}))
