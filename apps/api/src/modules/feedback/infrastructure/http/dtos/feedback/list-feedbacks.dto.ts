import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/shared/infrastructure/http/dtos/pagination.dto'
import { FeedbackSort } from 'src/modules/feedback/domain/enums/feedback-sort.enum'

export class ListFeedbacksDto extends PaginationDto {
	@ApiPropertyOptional({ description: 'Filter by category slug' })
	@IsOptional()
	@IsString()
	category?: string

	@ApiPropertyOptional({ enum: FeedbackSort })
	@IsOptional()
	@IsEnum(FeedbackSort)
	sort?: FeedbackSort
}
