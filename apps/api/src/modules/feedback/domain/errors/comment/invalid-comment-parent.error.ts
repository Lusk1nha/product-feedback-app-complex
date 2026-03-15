import { DomainError } from '@/shared/domain/errors/domain.error'

export class InvalidCommentParentError extends DomainError {
	constructor() {
		super('InvalidCommentParentError', 'Invalid comment parent.')
	}
}
