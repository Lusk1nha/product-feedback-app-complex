import {
	pgTable,
	varchar,
	timestamp,
	boolean,
	integer,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { timestampConfig } from 'src/shared/infrastructure/database/schema.utils'

export const feedbackCategories = pgTable('feedback_categories', {
	slug: varchar('slug', { length: 50 }).primaryKey(),
	label: varchar('label', { length: 50 }).notNull(),

	order: integer('order').default(0).notNull(),

	enabled: boolean('enabled').default(true).notNull(),

	createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', timestampConfig)
		.defaultNow()
		.notNull()
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
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
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})
