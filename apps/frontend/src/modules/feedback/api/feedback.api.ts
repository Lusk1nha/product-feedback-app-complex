import { httpClient } from '@/lib/api-client'
import {
	feedbackSchema,
	roadmapStatsResponseSchema,
	type CreateFeedbackPayload,
	type Feedback,
	type RoadmapStatsResponse,
} from '../types/feedback.schema'

export const FeedbackApi = {
	getRoadmapStats: async (): Promise<RoadmapStatsResponse> => {
		const response =
			await httpClient.get<RoadmapStatsResponse>('/feedbacks/stats')
		return roadmapStatsResponseSchema.parse(response)
	},

	createFeedback: async (payload: CreateFeedbackPayload) => {
		const response = await httpClient.post<Feedback>('/feedbacks', payload)
		return feedbackSchema.parse(response)
	},
}
