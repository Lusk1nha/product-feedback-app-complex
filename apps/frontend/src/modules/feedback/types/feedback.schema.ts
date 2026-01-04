import { paginationSchema } from '@/modules/shared/types/api.schemas'
import z from 'zod'
import { FeedbackSort } from './feedback.sort'

export const feedbackCategorySchema = z.object({
	slug: z.string(),
	label: z.string(),

	order: z.coerce.number(),
	enabled: z.boolean().optional(),

	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})

export const feedbackStatusSchema = z.object({
	slug: z.string(),
	label: z.string(),
	description: z.string().nullable(),

	hexColor: z.string(),
	order: z.coerce.number(), // Coerce é vida!
	includeInRoadmap: z.boolean(),

	enabled: z.boolean().optional(),

	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})

export const createFeedbackSchema = z.object({
	title: z
		.string({ error: 'Title is required' })
		.min(3, 'Title must be at least 3 characters')
		.max(255, 'Title is too long'),

	description: z
		.string({ error: 'Description is required' })
		.min(10, 'Description must be at least 10 characters'),

	categorySlug: z
		.string({ error: 'Category is required' })
		.min(1, 'Please select a category'),
})

export const updateFeedbackSchema = z.object({
	title: z
		.string({ error: 'Title is required' })
		.min(3, 'Title must be at least 3 characters')
		.max(255, 'Title is too long'),

	description: z
		.string({ error: 'Description is required' })
		.min(10, 'Description must be at least 10 characters'),

	categorySlug: z
		.string({ error: 'Category is required' })
		.min(1, 'Please select a category'),

	statusSlug: z
		.string({ error: 'Status is required' })
		.min(1, 'Please select a status'),
})

// 2. Schema da ENTIDADE Feedback (Resposta da API)
export const feedbackSchema = z.object({
	id: z.number(),

	title: z.string(),
	description: z.string(),

	categorySlug: z.string(),
	statusSlug: z.string(),

	upvotesCount: z.number(),
	isUpvoted: z.boolean().default(false),

	enabled: z.boolean().optional(),
	authorId: z.number(),

	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})

// 3. Schema do DTO de Listagem
export const listFeedbacksSchema = paginationSchema.extend({
	category: z.string().optional(),
	status: z.string().optional(),
	sort: z.enum(FeedbackSort).optional(),
})

export const countFeedbacksByStatusSchema = z.object({
	status: z.string(),
})

export type ListFeedbacksPayload = z.infer<typeof listFeedbacksSchema>
export type CountFeedbacksByStatusPayload = z.infer<
	typeof countFeedbacksByStatusSchema
>

export type FeedbackCategory = z.infer<typeof feedbackCategorySchema>
export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>

export type CreateFeedbackPayload = z.infer<typeof createFeedbackSchema>
export type UpdateFeedbackPayload = z.infer<typeof updateFeedbackSchema>

export type Feedback = z.infer<typeof feedbackSchema>
