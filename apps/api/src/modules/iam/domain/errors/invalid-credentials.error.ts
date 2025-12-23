import { DomainError } from 'src/shared/domain/errors/domain.error'

export class InvalidCredentialsError extends DomainError {
	constructor() {
		super('Invalid credentials', 'INVALID_CREDENTIALS')
	}
}
