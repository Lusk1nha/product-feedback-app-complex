import { DomainError } from 'src/shared/domain/errors/domain.error'

export class InvalidRefreshTokenError extends DomainError {
  constructor() {
    super('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN')
  }
}
