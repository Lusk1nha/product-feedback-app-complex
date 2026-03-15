import { z } from 'zod'

// 1. Schema Base (sem as respostas)
const baseCommentSchema = z.object({
	id: z.number(),
	content: z.string(),
	feedbackId: z.number(),
	authorId: z.number(),
	parentId: z.number().nullable(),
	upvotesCount: z.number(),
	isUpvoted: z.boolean().default(false),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})

// 2. Tipo TS explícito para ajudar o Zod com a recursão
export type Comment = z.infer<typeof baseCommentSchema> & {
	replies: Comment[]
}

// 3. O Schema final exportado usando z.lazy() para a árvore
export const commentSchema: z.ZodType<Comment> = baseCommentSchema.extend({
	replies: z.lazy(() => commentSchema.array().default([])),
})

// --- Schemas de Request/Response ---

export const createCommentSchema = z.object({
	content: z
		.string({ error: 'Content is required' })
		.min(2, 'Comment must be at least 2 characters')
		.max(5000, 'Comment is too long'),
	parentId: z.number().positive().optional(),
})

export const commentUpvoteResponseSchema = z.object({
	hasUpvoted: z.boolean(),
	upvotesCount: z.number(),
})

// --- Tipos Inferidos ---
export type CreateCommentPayload = z.infer<typeof createCommentSchema>
export type CommentUpvoteResponse = z.infer<typeof commentUpvoteResponseSchema>
