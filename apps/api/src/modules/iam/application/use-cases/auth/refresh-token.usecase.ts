import { Inject, Injectable } from '@nestjs/common'
import {
	IUserRepository,
	USER_REPOSITORY,
} from 'src/modules/iam/domain/repositories/user.repository.interface'
import {
	AuthTokens,
	ITokenProvider,
	TOKEN_PROVIDER,
} from '../../ports/token.provider.interface'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'
import { InvalidRefreshTokenError } from 'src/modules/iam/domain/errors/invalid-refresh-token.error'
import {
	IRefreshTokenRepository,
	REFRESH_TOKEN_REPOSITORY,
} from 'src/modules/iam/domain/repositories/refresh-token.repository.interface'
import { HashingService } from 'src/shared/application/services/hash.service'
import { RefreshToken } from 'src/modules/iam/domain/entities/refresh-token.entity'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'

export interface RefreshTokenCommand {
	refreshToken: string
}

@Injectable()
export class RefreshTokenUseCase implements IUseCase<
	RefreshTokenCommand,
	AuthTokens
> {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
		@Inject(REFRESH_TOKEN_REPOSITORY)
		private readonly refreshTokenRepository: IRefreshTokenRepository,
		@Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
		private readonly hashingService: HashingService,
	) {}

	private readonly EXPIRES_IN = 7 * 24 * 60 * 60 * 1000

	async execute(command: RefreshTokenCommand): Promise<AuthTokens> {
		const payload = await this.tokenProvider.verifyRefreshToken(
			command.refreshToken,
		)

		const tokenHash = await this.hashingService.hashToken(command.refreshToken)
		const session = await this.refreshTokenRepository.findByTokenHash(tokenHash)

		if (!session) {
			throw new InvalidRefreshTokenError()
		}

		const user = await this.userRepository.findById(payload.sub)
		if (!user) throw new UserNotFoundError()

		await this.refreshTokenRepository.deleteByTokenHash(tokenHash)

		const newTokens = await this.tokenProvider.generateAuthTokens(user)
		const newTokenHash = await this.hashingService.hashToken(
			newTokens.refreshToken,
		)

		const newSession = RefreshToken.create({
			userId: user.id,
			tokenHash: newTokenHash,
			expiresAt: new Date(Date.now() + this.EXPIRES_IN),
		})

		await this.refreshTokenRepository.create(newSession)

		return newTokens
	}
}
