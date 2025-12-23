import { CookieOptions, Response } from 'express'
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoginDto } from '../dtos/auth/login.dto'
import { RegisterUserDto } from '../dtos/auth/register-user.dto'
import { Cookies } from 'src/shared/infrastructure/http/decorators/cookies.decorator'
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.usecase'
import { UnauthorizedException } from '@nestjs/common'
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase'
import { RegisterUseCase } from '../../../application/use-cases/auth/register.usecase'
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { LogoutUseCase } from '../../../application/use-cases/auth/logout.usecase'
import { Throttle } from '@nestjs/throttler'
import { Env } from 'src/shared/infrastructure/environment/env.schema' // Import do seu Schema
import { RefreshTokenNotFoundError } from '../errors/refresh-token-not-found.error'

class AuthResponse {
  @ApiProperty()
  message: string
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,

    private readonly configService: ConfigService<Env, true>,
  ) {}

  @ApiOperation({
    summary: 'Register',
    description: 'Registers a new user and returns access and refresh tokens',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiResponse({ status: 201, type: AuthResponse })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
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

  @ApiOperation({
    summary: 'Login',
    description: 'Logs in the user and returns access and refresh tokens',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiResponse({ status: 200, type: AuthResponse })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.loginUseCase.execute(loginDto)
    this.setCookies(response, accessToken, refreshToken)

    return { message: 'Logged in successfully' }
  }

  @ApiOperation({
    summary: 'Refresh Tokens',
    description: 'Refreshes the access and refresh tokens',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 4. Refresh precisa ser mais permissivo (múltiplas abas)
  @ApiResponse({ status: 200, type: AuthResponse })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!refreshToken) {
      throw new RefreshTokenNotFoundError()
    }

    const tokens = await this.refreshTokenUseCase.execute({ refreshToken })

    this.setCookies(response, tokens.accessToken, tokens.refreshToken)

    return { message: 'Tokens refreshed successfully' }
  }

  @ApiOperation({
    summary: 'Logout',
    description: 'Clears the cookies and logs out the user',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      if (refreshToken) {
        await this.logoutUseCase.execute({ refreshToken })
      }
    } catch (error) {
      // Logar o erro silenciosamente, mas não impedir o clearCookie
      // logger.error('Logout failed inside usecase', error)
    } finally {
      const cookieOptions = this.getCookieOptions()
      response.clearCookie('accessToken', cookieOptions)
      response.clearCookie('refreshToken', cookieOptions)
    }

    return { message: 'Logged out successfully' }
  }

  // --- Helpers Privados Refatorados ---

  private getCookieOptions(): CookieOptions {
    const isProduction =
      this.configService.get('NODE_ENV', { infer: true }) === 'production'

    return {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? 'lax' : 'lax',
      path: '/',
    }
  }

  private setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const options = this.getCookieOptions()

    response.cookie('accessToken', accessToken, {
      ...options,
      maxAge:
        this.configService.get('JWT_ACCESS_EXPIRES_IN_MS', { infer: true }) ||
        15 * 60 * 1000,
    })

    response.cookie('refreshToken', refreshToken, {
      ...options,
      maxAge:
        this.configService.get('JWT_REFRESH_EXPIRES_IN_MS', { infer: true }) ||
        7 * 24 * 60 * 60 * 1000,
    })
  }
}
