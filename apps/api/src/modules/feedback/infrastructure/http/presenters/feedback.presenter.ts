import { ApiProperty } from '@nestjs/swagger'
import { Feedback } from '../../../domain/entities/feedback.entity'

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

export class FeedbackResponse {
	@ApiProperty({ example: 1 })
	id: number // <--- Ajustado para number

	@ApiProperty({ example: 'Add Dark Mode' })
	title: string

	@ApiProperty({
		example: 'It would help reducing eye strain during night work.',
	})
	description: string

	@ApiProperty({ example: 'ui' })
	categorySlug: string

	@ApiProperty({ example: 'suggestion' })
	statusSlug: string

	@ApiProperty({ example: 10 })
	upvotesCount: number

	@ApiProperty({ example: false })
	isUpvoted: boolean // <--- Adicionado: Essencial para a UI

	@ApiProperty({ example: true })
	enabled: boolean

	@ApiProperty({ example: 1 })
	authorId: number // <--- Ajustado para number

	@ApiProperty({ example: '2025-12-30T10:00:00.000Z' })
	createdAt: Date

	@ApiProperty({ example: '2025-12-30T10:00:00.000Z' })
	updatedAt: Date
}

export class FeedbackPresenter {
	static toHTTP(feedback: Feedback): FeedbackResponse {
		return {
			id: Number(feedback.id),
			title: feedback.title,
			description: feedback.description,
			categorySlug: feedback.categorySlug,
			statusSlug: feedback.statusSlug,

			upvotesCount: feedback.upvotesCount,
			isUpvoted: feedback.isUpvoted ?? false,

			enabled: feedback.enabled,

			authorId: Number(feedback.authorId),
			createdAt: feedback.createdAt,
			updatedAt: feedback.updatedAt,
		}
	}
}
