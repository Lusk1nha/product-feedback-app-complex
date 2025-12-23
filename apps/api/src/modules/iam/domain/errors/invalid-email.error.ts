import { DomainError } from 'src/shared/domain/errors/domain.error'

export class InvalidEmailError extends DomainError {
	constructor(email: string) {
		super(`The email "${email}" is invalid.`, 'INVALID_EMAIL', { email })
	}
}
