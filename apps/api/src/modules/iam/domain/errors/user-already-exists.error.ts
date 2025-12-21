import { DomainError } from 'src/shared/domain/base.error'

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email "${email}" already exists.`)
  }
}
