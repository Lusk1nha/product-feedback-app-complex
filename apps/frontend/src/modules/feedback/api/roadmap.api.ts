import { httpClient } from '@/lib/api-client'
import {
	roadmapColumnResponseSchema,
	roadmapStatsResponseSchema,
	type RoadmapColumnResponse,
	type RoadmapStatsResponse,
} from '../types/roadmap.schema'

export const RoadmapApi = {
	getRoadmapStats: async (): Promise<RoadmapStatsResponse> => {
		const response =
			await httpClient.get<RoadmapStatsResponse>('/roadmap/stats')
		return roadmapStatsResponseSchema.parse(response)
	},

	getRoadmapData: async (): Promise<RoadmapColumnResponse[]> => {
		const response =
			await httpClient.get<RoadmapColumnResponse[]>('/roadmap/data')

		return roadmapColumnResponseSchema.array().parse(response)
	},
}
