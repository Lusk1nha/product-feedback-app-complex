import { DomainError } from 'src/shared/domain/errors/domain.error'

export class UserUsernameTooShortError extends DomainError {
  constructor() {
    super('Username must be at least 3 characters long')
  }
}
