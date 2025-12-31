import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateFeedbackDto {
	@ApiProperty({ example: 'Add dark mode', minLength: 3 })
	@IsString()
	@MinLength(3)
	@IsNotEmpty()
	title: string

	@ApiProperty({
		example: 'It would help reducing eye strain...',
		minLength: 10,
	})
	@IsString()
	@MinLength(10)
	@IsNotEmpty()
	description: string

	@ApiProperty({ example: 'ui' })
	@IsString()
	@IsNotEmpty()
	categorySlug: string
}
