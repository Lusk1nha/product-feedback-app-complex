import { httpClient } from '@/lib/api-client'
import {
	feedbackSchema,
	type CreateFeedbackPayload,
	type Feedback,
	type ListFeedbacksPayload,
	type UpdateFeedbackPayload,
} from '../types/feedback.schema'
import type { PaginatedResult } from '@/types/api.types'

export const FeedbackApi = {
	getFeedbackById: async (id: number): Promise<Feedback> => {
		const response = await httpClient.get<Feedback>(`/feedbacks/${id}`)
		return feedbackSchema.parse(response)
	},

	listFeedbacks: async (
		payload: ListFeedbacksPayload,
		signal?: AbortSignal,
	): Promise<PaginatedResult<Feedback[]>> => {
		// 1. Chama o método que preserva o meta
		const response = await httpClient.getPaginated<Feedback[]>('/feedbacks', {
			params: payload,
			signal,
		})

		// 2. Valida apenas os DADOS com o Zod
		const parsedData = feedbackSchema.array().parse(response.data)

		// 3. Retorna a estrutura completa
		return {
			data: parsedData,
			meta: response.meta,
		}
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
