import {
	pgTable,
	timestamp,
	boolean,
	integer,
	serial,
	text,
	primaryKey,
	index,
	foreignKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { timestampConfig } from 'src/shared/infrastructure/database/schema.utils'
import { users } from 'src/shared/infrastructure/database/schema'
import { feedbacks } from './feedback.schema'

// 1. Tabela de Comentários
export const feedbackComments = pgTable(
	'feedback_comments',
	{
		id: serial('id').primaryKey(),

		content: text('content').notNull(),

		feedbackId: integer('feedback_id')
			.notNull()
			.references(() => feedbacks.id, { onDelete: 'cascade' }),

		authorId: integer('author_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		parentId: integer('parent_id'),

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
			parentFk: foreignKey({
				columns: [table.parentId],
				foreignColumns: [table.id],
				name: 'feedback_comments_parent_id_fk',
			}).onDelete('cascade'),

			feedbackIdx: index('comment_feedback_idx').on(table.feedbackId),
			parentIdx: index('comment_parent_idx').on(table.parentId),
		}
	},
)

// 2. Tabela de Upvotes dos Comentários
export const commentUpvotes = pgTable(
	'comment_upvotes',
	{
		commentId: integer('comment_id')
			.notNull()
			.references(() => feedbackComments.id, { onDelete: 'cascade' }),

		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
	},
	(table) => [
		{
			pk: primaryKey({
				columns: [table.commentId, table.userId],
			}),
		},
	],
)

// --- Relations ---
export const feedbackCommentsRelations = relations(
	feedbackComments,
	({ one, many }) => ({
		feedback: one(feedbacks, {
			fields: [feedbackComments.feedbackId],
			references: [feedbacks.id],
		}),
		author: one(users, {
			fields: [feedbackComments.authorId],
			references: [users.id],
		}),
		// Relação para pegar o comentário pai
		parent: one(feedbackComments, {
			fields: [feedbackComments.parentId],
			references: [feedbackComments.id],
			relationName: 'parent_child_comments',
		}),
		replies: many(feedbackComments, { relationName: 'parent_child_comments' }),
		upvotes: many(commentUpvotes),
	}),
)

export const commentUpvotesRelations = relations(commentUpvotes, ({ one }) => ({
	comment: one(feedbackComments, {
		fields: [commentUpvotes.commentId],
		references: [feedbackComments.id],
	}),
	user: one(users, {
		fields: [commentUpvotes.userId],
		references: [users.id],
	}),
}))
