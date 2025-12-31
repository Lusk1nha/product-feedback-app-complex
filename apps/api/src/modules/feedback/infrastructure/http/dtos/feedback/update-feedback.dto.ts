import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class UpdateFeedbackDto {
	@ApiProperty({ example: 'Add dark mode' })
	@IsString()
	title?: string

	@ApiProperty({ example: 'It would help reducing eye strain...' })
	@IsString()
	description?: string

	@ApiProperty({ example: 'ui' })
	@IsString()
	categorySlug?: string

	@ApiProperty({ example: 'planned' })
	@IsString()
	statusSlug?: string
}
