import { User } from '../../domain/entities/user.entity'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface TokenPayload {
  sub: number
  email: string
}

export const TOKEN_PROVIDER = Symbol('TOKEN_PROVIDER')

export interface ITokenProvider {
  generateAuthTokens(user: User): Promise<AuthTokens>

  verifyRefreshToken(token: string): Promise<TokenPayload>
}
