import z from 'zod'
import { feedbackCategorySchema, feedbackStatusSchema } from './feedback.schema'

export const metadataResponseSchema = z.object({
	feedback: z.object({
		categories: z.array(feedbackCategorySchema),
		statuses: z.array(feedbackStatusSchema),
	}),
})

export type MetadataResponse = z.infer<typeof metadataResponseSchema>
