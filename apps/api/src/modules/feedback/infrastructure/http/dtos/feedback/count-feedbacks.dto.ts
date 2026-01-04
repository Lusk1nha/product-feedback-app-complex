import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class CountFeedbacksDto {
  @ApiProperty({ example: 'suggestion | planned | in-progress | live' })
  @IsString()
  @IsNotEmpty()
  status: string
}