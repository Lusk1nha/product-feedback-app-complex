import { Inject, Injectable } from '@nestjs/common'
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/modules/iam/domain/repositories/user.repository.interface'
import { HashingService } from 'src/shared/application/services/hash.service'
import {
  ITokenProvider,
  TOKEN_PROVIDER,
  AuthTokens,
} from '../../ports/token.provider.interface'
import { InvalidCredentialsError } from 'src/modules/iam/domain/errors/invalid-credentials.error'
import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from 'src/modules/iam/domain/repositories/refresh-token.repository.interface'
import { RefreshToken } from 'src/modules/iam/domain/entities/refresh-token.entity'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'

export interface LoginCommand {
  email: string
  password: string
}

@Injectable()
export class LoginUseCase implements IUseCase<LoginCommand, AuthTokens> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
    private readonly hashingService: HashingService,
  ) {}

  private readonly EXPIRES_IN = 7 * 24 * 60 * 60 * 1000

  async execute(command: LoginCommand): Promise<AuthTokens> {
    const accountData = await this.userRepository.findByEmailWithAccount(
      command.email,
    )

    if (!accountData || !accountData.account.password) {
      throw new InvalidCredentialsError()
    }

    const { user, account } = accountData

    if (!account.password) {
      throw new InvalidCredentialsError()
    }

    const isPasswordValid = await this.hashingService.compare(
      command.password,
      account.password,
    )

    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }

    const tokens = await this.tokenProvider.generateAuthTokens(user)

    const refreshTokenHash = await this.hashingService.hashToken(
      tokens.refreshToken,
    )

    const refreshTokenEntity = RefreshToken.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + this.EXPIRES_IN),
    })

    await this.refreshTokenRepository.create(refreshTokenEntity)

    return tokens
  }
}
