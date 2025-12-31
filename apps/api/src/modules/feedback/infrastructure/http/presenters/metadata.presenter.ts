import { ApiProperty } from '@nestjs/swagger'
import { AppMetadataOutput } from 'src/modules/feedback/application/use-cases/metadata/get-app-metadata.usecase'

export class CategoryResponse {
	@ApiProperty({ example: 'ui' })
	slug: string

	@ApiProperty({ example: 'UI' })
	label: string

	@ApiProperty({ example: 1 })
	order: number

	@ApiProperty({ example: '#F49F85' })
	createdAt: Date

	@ApiProperty({ example: '#F49F85' })
	updatedAt: Date
}

export class StatusResponse {
	@ApiProperty({ example: 'planned' })
	slug: string

	@ApiProperty({ example: 'Planned' })
	label: string

	@ApiProperty({ example: '#F49F85' })
	hexColor: string

	@ApiProperty({ example: 1 })
	order: number

	@ApiProperty({ example: true })
	includeInRoadmap: boolean

	@ApiProperty({ example: '#F49F85' })
	createdAt: Date

	@ApiProperty({ example: '#F49F85' })
	updatedAt: Date
}

class FeedbackResponse {
	@ApiProperty({
		name: 'categories',
		description: 'Feedback categories',
		type: [CategoryResponse],
	})
	categories: CategoryResponse[]

	@ApiProperty({
		name: 'statuses',
		description: 'Feedback statuses',
		type: [StatusResponse],
	})
	statuses: StatusResponse[]
}

export class AppMetadataResponse {
	@ApiProperty({
		name: 'feedback',
		description: 'Feedback metadata',
		type: FeedbackResponse,
	})
	feedback: FeedbackResponse
}

export class MetadataPresenter {
	static toHTTP(output: AppMetadataOutput): AppMetadataResponse {
		return {
			feedback: {
				categories: output.categories.map((category) => ({
					slug: category.slug,
					label: category.label,

					order: category.order,

					createdAt: category.createdAt,
					updatedAt: category.updatedAt,
				})),

				statuses: output.statuses.map((status) => ({
					slug: status.slug,
					label: status.label,
					hexColor: status.hexColor,
					includeInRoadmap: status.includeInRoadmap(),
					order: status.order,

					createdAt: status.createdAt,
					updatedAt: status.updatedAt,
				})),
			},
		}
	}
}
