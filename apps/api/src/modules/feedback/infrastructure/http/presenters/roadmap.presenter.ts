import { ApiProperty } from '@nestjs/swagger'
import { Feedback } from '../../../domain/entities/feedback.entity'
import { FeedbackStatus } from '@/modules/feedback/domain/entities/reference/feedback-status.entity'
import {
	FeedbackStatusPresenter,
	FeedbackStatusResponse,
} from './metadata.presenter'
import { FeedbackPresenter, FeedbackResponse } from './feedback.presenter'

export class RoadmapStatsResponse {
	@ApiProperty({
		example: { planned: 5, 'in-progress': 2, live: 1 },
		description: 'Map of status slugs to their count',
	})
	stats: Record<string, number>
}

export class RoadmapStatsPresenter {
	static toHTTP(stats: Record<string, number>): RoadmapStatsResponse {
		return { stats }
	}
}

export class RoadmapColumnResponse {
	@ApiProperty({ type: FeedbackStatusResponse })
	status: FeedbackStatusResponse

	@ApiProperty({ type: [FeedbackResponse] })
	feedbacks: FeedbackResponse[]

	@ApiProperty({ example: 5, description: 'Total feedbacks in this status' })
	count: number
}

export interface RoadmapColumnRaw {
	status: FeedbackStatus
	feedbacks: Feedback[]
}

export class RoadmapDataPresenter {
	static toHTTP(columns: RoadmapColumnRaw[]): RoadmapColumnResponse[] {
		return columns.map((column) => ({
			status: FeedbackStatusPresenter.toHTTP(column.status),
			feedbacks: column.feedbacks.map(FeedbackPresenter.toHTTP),
			count: column.feedbacks.length,
		}))
	}
}
