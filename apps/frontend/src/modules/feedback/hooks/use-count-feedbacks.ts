import { useQuery } from '@tanstack/react-query'
import type { CountFeedbacksByStatusPayload } from '../types/feedback.schema'
import { FeedbackApi } from '../api/feedback.api'

export function useCountFeedbacks(filters: CountFeedbacksByStatusPayload) {
	return useQuery({
		queryKey: ['count-feedbacks', filters],
		queryFn: () => FeedbackApi.countFeedbacksByStatus(filters),
	})
}
