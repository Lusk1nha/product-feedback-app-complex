import { useQuery } from '@tanstack/react-query'
import { RoadmapApi } from '../api/roadmap.api'

export function useRoadmapStats() {
	return useQuery({
		queryKey: ['roadmap-stats'],
		queryFn: RoadmapApi.getRoadmapStats,

		// Cache de 5 minutos, pois contagem não muda a cada milissegundo
		staleTime: 1000 * 60 * 5,
	})
}
