import { Inject, Injectable } from '@nestjs/common'
import { IUserRepository, USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { AuthTokens, ITokenProvider, TOKEN_PROVIDER } from '../../ports/token.provider.interface'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'

export interface RefreshTokenCommand {
  refreshToken: string
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthTokens> {
    // 1. Validação do Token (Delega para o Provider)
    // Se for inválido, o provider já lança InvalidRefreshTokenError
    const payload = await this.tokenProvider.verifyRefreshToken(command.refreshToken)

    // 2. Validação do Usuário (Regra de Negócio)
    const user = await this.userRepository.findById(payload.sub)

    if (!user) {
      throw new UserNotFoundError()
    }

    // 3. Geração de Novos Tokens
    return this.tokenProvider.generateAuthTokens(user)
  }
}
