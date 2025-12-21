import { CookieOptions, Response } from 'express'

import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { LoginDto } from '../dtos/login.dto'
import { RegisterUserDto } from '../dtos/register-user.dto'
import { Cookies } from 'src/shared/infrastructure/http/decorators/cookies.decorator'
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.usecase'
import { UnauthorizedException } from '@nestjs/common'
import { LoginUseCase } from '../../application/use-cases/auth/login.usecase'
import { RegisterUseCase } from '../../application/use-cases/auth/register.usecase'

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto, @Res({ passthrough: true }) response: Response) {
    await this.registerUseCase.execute({
      username: dto.username,
      email: dto.email,
      fullName: dto.fullName,
      password: dto.password,
    })

    const tokens = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    })

    this.setCookies(response, tokens.accessToken, tokens.refreshToken)

    return { message: 'User created successfully' }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.loginUseCase.execute(loginDto)
    this.setCookies(response, accessToken, refreshToken)

    return { message: 'Logged in successfully' }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Cookies('refreshToken') refreshToken: string, @Res({ passthrough: true }) response: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found')
    }

    // Chamada limpa ao Use Case
    const tokens = await this.refreshTokenUseCase.execute({ refreshToken })

    this.setCookies(response, tokens.accessToken, tokens.refreshToken)

    return { message: 'Tokens refreshed successfully' }
  }

  // --- Helper Privado para Configuração de Cookies ---
  private setCookies(response: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production'

    const cookieOptions: CookieOptions = {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? 'strict' : ('lax' as const),
      domain: undefined, // Ajuste se usar subdomínios
      path: '/', // Importante para garantir que o cookie valha para todo o app
    }

    response.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutos
    })

    response.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    })
  }
}
