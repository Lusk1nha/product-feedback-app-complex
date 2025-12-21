import { CookieOptions, Response } from 'express'

import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { AuthenticationService } from '../../application/services/authentication.service'
import { LoginDto } from '../dtos/login.dto'
import { RegisterUserDto } from '../dtos/register-user.dto'
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.usecase'

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    await this.createUserUseCase.execute({
      username: dto.username,
      email: dto.email,
      fullName: dto.fullName,
      password: dto.password,
    })

    return { message: 'User created successfully' }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto)

    const isProduction = process.env.NODE_ENV === 'production'

    const cookieOptions: CookieOptions = {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? 'strict' : ('lax' as const),
      domain: undefined,
    }

    response.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })

    response.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return { message: 'Logged in successfully' }
  }
}
