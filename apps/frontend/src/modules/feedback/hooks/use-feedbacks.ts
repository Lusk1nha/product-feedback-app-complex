import { useQuery } from '@tanstack/react-query'
import { FeedbackApi } from '@/modules/feedback/api/feedback.api'
import type { ListFeedbacksPayload } from '@/modules/feedback/types/feedback.schema'

export function useFeedbacks(filters: ListFeedbacksPayload) {
	return useQuery({
		queryKey: ['feedbacks', filters],
		queryFn: () => FeedbackApi.listFeedbacks(filters),
		placeholderData: (previousData) => previousData,
	})
}
