import { useQuery } from '@tanstack/react-query'
import { FeedbackApi } from '../api/feedback.api'

export function useRoadmapStats() {
	return useQuery({
		queryKey: ['roadmap-stats'],
		queryFn: FeedbackApi.getRoadmapStats,

		// Cache de 5 minutos, pois contagem não muda a cada milissegundo
		staleTime: 1000 * 60 * 5,
	})
}
