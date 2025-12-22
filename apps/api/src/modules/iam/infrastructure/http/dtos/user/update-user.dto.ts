import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator'

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'lucas_dev', minLength: 3 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string

  @ApiPropertyOptional({ example: 'Lucas Pedro' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string

  @ApiPropertyOptional({ example: 'https://github.com/lucas.png' })
  @IsOptional()
  @IsUrl() // Valida se é uma URL válida
  avatarUrl?: string
}
