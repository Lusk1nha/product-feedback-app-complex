import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Env } from 'src/shared/infrastructure/environment/env.schema'
import { User } from '../../domain/entities/user.entity'
import { AuthTokens, ITokenProvider, TokenPayload } from '../../application/ports/token.provider.interface'
import { InvalidRefreshTokenError } from '../../domain/errors/invalid-refresh-token.error'

@Injectable()
export class JwtTokenService implements ITokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async generateAuthTokens(user: User): Promise<AuthTokens> {
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

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      })
    } catch (error) {
      throw new InvalidRefreshTokenError()
    }
  }

  private async signToken(payload: TokenPayload, secretKey: keyof Env, expirationKey: keyof Env): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get(secretKey, { infer: true }),
      expiresIn: this.configService.get(expirationKey, { infer: true }),
    })
  }
}
