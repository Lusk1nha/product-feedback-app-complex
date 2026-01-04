import { useQuery } from '@tanstack/react-query'
import { RoadmapApi } from '../api/roadmap.api'

export function useRoadmapData() {
	return useQuery({
		queryKey: ['roadmap'],
		queryFn: RoadmapApi.getRoadmapData,
		staleTime: 1000 * 60 * 5,
	})
}
