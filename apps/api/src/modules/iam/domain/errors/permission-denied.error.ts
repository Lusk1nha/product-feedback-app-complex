import { DomainError } from 'src/shared/domain/errors/domain.error'

export class PermissionDeniedError extends DomainError {
  constructor(action: string, subject?: any) {
    const subjectName = subject?.constructor?.name ?? 'Resource'

    const message = action
      ? `Permission Denied: You cannot ${action} ${subjectName}.`
      : 'Permission Denied.'

    super(message)
    this.name = 'PermissionDeniedError'
  }
}
