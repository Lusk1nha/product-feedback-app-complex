import { DomainError } from 'src/shared/domain/errors/domain.error'

export class UserConflictError extends DomainError {
  constructor(field: string) {
    super(`The ${field} is already in use.`, 'USER_CONFLICT', { field })
  }
}
