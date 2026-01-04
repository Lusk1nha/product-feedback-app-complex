import z from 'zod'
import { feedbackSchema, feedbackStatusSchema } from './feedback.schema'

export const roadmapStatsResponseSchema = z.object({
	stats: z.record(z.string(), z.number()),
})

export const roadmapColumnResponseSchema = z.object({
	status: feedbackStatusSchema,
	feedbacks: z.array(feedbackSchema),
	count: z.number(),
})

export type RoadmapStatsResponse = z.infer<typeof roadmapStatsResponseSchema>
export type RoadmapColumnResponse = z.infer<typeof roadmapColumnResponseSchema>
