import { ApplicationError } from 'src/shared/domain/errors/application.error'

export class RefreshTokenNotFoundError extends ApplicationError {
  constructor() {
    super('Refresh token not found')
  }
}
