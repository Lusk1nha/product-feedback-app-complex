import { Injectable, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface'
import { User } from '../../domain/entities/user.entity'
import { HashingService } from 'src/shared/application/services/hash.service'
import { Env } from 'src/shared/infrastructure/environment/env.schema'
import { LoginDto } from '../../http/dtos/login.dto'
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error'

export interface TokenPayload {
  sub: number
  email: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  /**
   * Realiza o login do usuário verificando credenciais e retornando tokens.
   */
  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const accountData = await this.userRepo.findByEmailWithAccount(loginDto.email)

    // Fail Fast: Se não existe usuário ou não tem conta local (senha), rejeita imediatamente.
    if (!accountData || !accountData.account.password) {
      throw new InvalidCredentialsError()
    }

    const { user, account } = accountData

    if (!account.password) {
      throw new InvalidCredentialsError()
    }

    const isPasswordValid = await this.hashingService.compare(loginDto.password, account.password)

    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }

    return this.generateTokens(user)
  }

  /**
   * Gera o par de tokens (Access e Refresh) para um usuário autenticado.
   * Público para ser reutilizado no fluxo de Registro.
   */
  public async generateTokens(user: User): Promise<AuthTokens> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email.getValue(),
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(payload, 'JWT_ACCESS_SECRET', 'JWT_ACCESS_TTL'),
      this.signToken(payload, 'JWT_REFRESH_SECRET', 'JWT_REFRESH_TTL'),
    ])

    return { accessToken, refreshToken }
  }

  /**
   * Helper privado para assinar tokens, evitando repetição de código e
   * centralizando a busca de configurações.
   */
  private async signToken(payload: TokenPayload, secretKey: keyof Env, expirationKey: keyof Env): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get(secretKey, { infer: true }),
      expiresIn: this.configService.get(expirationKey, { infer: true }),
    })
  }
}
