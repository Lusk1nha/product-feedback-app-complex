import z from 'zod'

export const feedbackCategorySchema = z.object({
	slug: z.string(),
	label: z.string(),

	enabled: z.boolean().optional(),

	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})

export const feedbackStatusSchema = z.object({
	slug: z.string(),
	label: z.string(),
	hexColor: z.string(),
	order: z.coerce.number(), // Coerce é vida!
	includeInRoadmap: z.boolean(),

	enabled: z.boolean().optional(),

	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})

export const metadataResponseSchema = z.object({
	feedback: z.object({
		categories: z.array(feedbackCategorySchema),
		statuses: z.array(feedbackStatusSchema),
	}),
})

export type MetadataResponse = z.infer<typeof metadataResponseSchema>
export type FeedbackCategory = z.infer<typeof feedbackCategorySchema>
export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>
