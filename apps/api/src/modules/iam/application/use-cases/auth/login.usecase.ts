import { Inject, Injectable } from '@nestjs/common'
import { IUserRepository, USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { HashingService } from 'src/shared/application/services/hash.service'
import { ITokenProvider, TOKEN_PROVIDER, AuthTokens } from '../../ports/token.provider.interface'
import { InvalidCredentialsError } from 'src/modules/iam/domain/errors/invalid-credentials.error'

export interface LoginCommand {
  email: string
  password: string
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
    private readonly hashingService: HashingService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthTokens> {
    // 1. Busca Usuário e Conta (Tudo em uma query para performance)
    const accountData = await this.userRepository.findByEmailWithAccount(command.email)

    // 2. Fail Fast e Seguro:
    // Se não achou usuário OU não tem senha (conta Google), erro genérico.
    if (!accountData || !accountData.account.password) {
      throw new InvalidCredentialsError()
    }

    const { user, account } = accountData

    if (!account.password) {
      throw new InvalidCredentialsError()
    }

    // 3. Valida Senha
    const isPasswordValid = await this.hashingService.compare(command.password, account.password)

    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }

    // 4. Gera Tokens
    return this.tokenProvider.generateAuthTokens(user)
  }
}
