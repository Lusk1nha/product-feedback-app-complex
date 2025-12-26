import { CookieOptions, Response } from 'express'
import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Res,
	Logger, // <--- 1. Importar Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoginDto } from '../dtos/auth/login.dto'
import { RegisterUserDto } from '../dtos/auth/register-user.dto'
import { Cookies } from 'src/shared/infrastructure/http/decorators/cookies.decorator'
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.usecase'
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase'
import { RegisterUseCase } from '../../../application/use-cases/auth/register.usecase'
import {
	ApiOperation,
	ApiProperty,
	ApiResponse,
	ApiTags,
	ApiUnauthorizedResponse, // <--- 2. Documentar erros
	ApiConflictResponse,
} from '@nestjs/swagger'
import { LogoutUseCase } from '../../../application/use-cases/auth/logout.usecase'
import { Throttle } from '@nestjs/throttler'
import { Env } from 'src/shared/infrastructure/environment/env.schema'
import { RefreshTokenNotFoundError } from '../errors/refresh-token-not-found.error'
import { ResponseMessage } from 'src/shared/infrastructure/http/decorators/response.decorator'

class AuthResponse {
	@ApiProperty()
	message: string
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
	private readonly logger = new Logger(AuthenticationController.name)

	constructor(
		private readonly registerUseCase: RegisterUseCase,
		private readonly loginUseCase: LoginUseCase,
		private readonly refreshTokenUseCase: RefreshTokenUseCase,
		private readonly logoutUseCase: LogoutUseCase,
		private readonly configService: ConfigService<Env, true>,
	) {}

	@ApiOperation({ summary: 'Register' })
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@ApiResponse({ status: 201, type: AuthResponse })
	@ApiConflictResponse({ description: 'Email or Username already exists' })
	@Post('register')
	@ResponseMessage('User created successfully')
	@HttpCode(HttpStatus.CREATED)
	async register(@Body() dto: RegisterUserDto) {
		await this.registerUseCase.execute({
			username: dto.username,
			email: dto.email,
			fullName: dto.fullName,
			password: dto.password,
		})

		return
	}

	@ApiOperation({ summary: 'Login' })
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@ApiResponse({ status: 200, type: AuthResponse })
	@ApiUnauthorizedResponse({ description: 'Invalid credentials' })
	@Post('login')
	@ResponseMessage('Logged in successfully')
	@HttpCode(HttpStatus.OK)
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) response: Response,
	) {
		const { accessToken, refreshToken } =
			await this.loginUseCase.execute(loginDto)

		this.setCookies(response, accessToken, refreshToken)

		return {
			accessToken,
		}
	}

	@ApiOperation({ summary: 'Refresh Tokens' })
	@Throttle({ default: { limit: 10, ttl: 60000 } })
	@ApiResponse({ status: 200, type: AuthResponse })
	@ApiUnauthorizedResponse({ description: 'Invalid or missing refresh token' })
	@Post('refresh')
	@ResponseMessage('Tokens refreshed successfully')
	@HttpCode(HttpStatus.OK)
	async refresh(
		@Cookies('refreshToken') refreshToken: string,
		@Res({ passthrough: true }) response: Response,
	) {
		if (!refreshToken) {
			throw new RefreshTokenNotFoundError()
		}

		const tokens = await this.refreshTokenUseCase.execute({
			refreshToken,
		})

		this.setCookies(response, tokens.accessToken, tokens.refreshToken)

		return {
			accessToken: tokens.accessToken,
		}
	}

	@ApiOperation({ summary: 'Logout' })
	@Post('logout')
	@ResponseMessage('Logged out successfully')
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
			this.logger.warn(`Logout failed for token: ${error.message}`, error.stack)
		} finally {
			const cookieOptions = this.getCookieOptions()
			response.clearCookie('accessToken', cookieOptions)
			response.clearCookie('refreshToken', cookieOptions)
		}

		return
	}

	// --- Helpers Privados ---

	private getCookieOptions(): CookieOptions {
		const isProduction =
			this.configService.get('NODE_ENV', { infer: true }) === 'production'

		return {
			secure: isProduction,
			httpOnly: true,
			sameSite: isProduction ? 'lax' : 'lax', // Lax é seguro e compatível
			path: '/',
		}
	}

	private setCookies(
		response: Response,
		accessToken: string,
		refreshToken: string,
	) {
		const options = this.getCookieOptions()

		const accessTime =
			Number(
				this.configService.get('JWT_ACCESS_EXPIRES_IN_MS', { infer: true }),
			) || 15 * 60 * 1000
		const refreshTime =
			Number(
				this.configService.get('JWT_REFRESH_EXPIRES_IN_MS', { infer: true }),
			) || 7 * 24 * 60 * 60 * 1000

		response.cookie('accessToken', accessToken, {
			...options,
			maxAge: accessTime,
		})

		response.cookie('refreshToken', refreshToken, {
			...options,
			maxAge: refreshTime,
		})
	}
}
