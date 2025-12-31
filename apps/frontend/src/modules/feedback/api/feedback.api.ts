import { httpClient } from '@/lib/api-client'
import {
	feedbackSchema,
	roadmapStatsResponseSchema,
	type CreateFeedbackPayload,
	type Feedback,
	type RoadmapStatsResponse,
	type UpdateFeedbackPayload,
} from '../types/feedback.schema'

export const FeedbackApi = {
	getRoadmapStats: async (): Promise<RoadmapStatsResponse> => {
		const response =
			await httpClient.get<RoadmapStatsResponse>('/feedbacks/stats')
		return roadmapStatsResponseSchema.parse(response)
	},

	getFeedbackById: async (id: number): Promise<Feedback> => {
		const response = await httpClient.get<Feedback>(`/feedbacks/${id}`)
		return feedbackSchema.parse(response)
	},

	createFeedback: async (payload: CreateFeedbackPayload) => {
		const response = await httpClient.post<Feedback>('/feedbacks', payload)
		return feedbackSchema.parse(response)
	},

	updateFeedback: async (id: number, payload: UpdateFeedbackPayload) => {
		const response = await httpClient.put<Feedback>(`/feedbacks/${id}`, payload)
		return feedbackSchema.parse(response)
	},

	deleteFeedback: async (id: number) => {
		await httpClient.delete(`/feedbacks/${id}`)
	},
}
