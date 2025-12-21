import { RefreshToken } from '../entities/refresh-token.entity'

export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY')

export interface IRefreshTokenRepository {
  create(data: RefreshToken): Promise<RefreshToken>

  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>

  deleteByTokenHash(tokenHash: string): Promise<void>

  deleteAllByUserId(userId: number): Promise<void>
}
