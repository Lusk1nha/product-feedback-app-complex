import { DomainError } from 'src/shared/domain/base.error'

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`The email "${email}" is invalid.`)
  }
}
