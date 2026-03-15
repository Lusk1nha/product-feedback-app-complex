import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateCommentDto {
	@ApiProperty({ example: 'Add dark mode', minLength: 3 })
	@IsString()
	@MinLength(3)
	@IsNotEmpty()
	content: string

	@ApiProperty({ example: 'ui' })
	@IsNumber()
	@IsOptional()
	parentId?: number
}
