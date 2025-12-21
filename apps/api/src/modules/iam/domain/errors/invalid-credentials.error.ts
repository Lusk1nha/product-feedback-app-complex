import { DomainError } from 'src/shared/domain/base.error'

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid credentials')
  }
}
