import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class RegisterUserDto {
	@ApiProperty({ example: 'johndoe' })
	@IsString()
	@MinLength(3)
	username: string

	@ApiProperty({ example: 'john@example.com' })
	@IsEmail()
	@Transform(({ value }) => value?.toLowerCase()) // Sanitização
	email: string

	@ApiProperty({ example: 'John Doe' })
	@IsString()
	@IsNotEmpty()
	fullName: string

	@ApiProperty({ example: 'StrongP@ssword123' })
	@IsString()
	@MinLength(6, { message: 'Password must be at least 6 characters long' })
	password: string
}
