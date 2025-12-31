import { useQuery } from '@tanstack/react-query'
import { FeedbackApi } from '../api/feedback.api'

// 1. Hook para BUSCAR os dados (GET)
export function useFeedback(id: number) {
	return useQuery({
		queryKey: ['feedback', id],
		queryFn: () => FeedbackApi.getFeedbackById(id),
		enabled: !!id,

		refetchOnWindowFocus: false,
	})
}
