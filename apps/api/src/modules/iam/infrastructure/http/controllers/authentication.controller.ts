import { CookieOptions, Response } from 'express'

import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { LoginDto } from '../dtos/login.dto'
import { RegisterUserDto } from '../dtos/register-user.dto'
import { Cookies } from 'src/shared/infrastructure/http/decorators/cookies.decorator'
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.usecase'
import { UnauthorizedException } from '@nestjs/common'
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase'
import { RegisterUseCase } from '../../../application/use-cases/auth/register.usecase'
import { Environment } from 'src/shared/infrastructure/environment/env.schema'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { LogoutUseCase } from '../../../application/use-cases/auth/logout.usecase'

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @ApiOperation({ summary: 'Register', description: 'Registers a new user and returns access and refresh tokens' })
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

  @ApiOperation({ summary: 'Login', description: 'Logs in the user and returns access and refresh tokens' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.loginUseCase.execute(loginDto)
    this.setCookies(response, accessToken, refreshToken)

    return { message: 'Logged in successfully' }
  }

  @ApiOperation({ summary: 'Refresh Tokens', description: 'Refreshes the access and refresh tokens' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Cookies('refreshToken') refreshToken: string, @Res({ passthrough: true }) response: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found')
    }

    const tokens = await this.refreshTokenUseCase.execute({ refreshToken })

    this.setCookies(response, tokens.accessToken, tokens.refreshToken)

    return { message: 'Tokens refreshed successfully' }
  }

  @ApiOperation({ summary: 'Logout', description: 'Clears the cookies and logs out the user' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Cookies('refreshToken') refreshToken: string, @Res({ passthrough: true }) response: Response) {
    await this.logoutUseCase.execute({ refreshToken })

    const cookieOptions = this.getCookieOptions()
    response.clearCookie('accessToken', cookieOptions)
    response.clearCookie('refreshToken', cookieOptions)

    return { message: 'Logged out successfully' }
  }

  // --- Helper Privado para Configuração de Cookies ---
  private getCookieOptions(): CookieOptions {
    const isProduction = process.env.NODE_ENV === Environment.Production

    return {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/', // Crítico: se o path for diferente, o logout falha silenciosamente
    }
  }

  private setCookies(response: Response, accessToken: string, refreshToken: string) {
    const options = this.getCookieOptions()

    response.cookie('accessToken', accessToken, {
      ...options,
      maxAge: 15 * 60 * 1000, // 15 min
    })

    response.cookie('refreshToken', refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    })
  }
}
