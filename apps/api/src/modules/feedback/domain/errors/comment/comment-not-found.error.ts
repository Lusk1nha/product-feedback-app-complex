import { DomainError } from '@/shared/domain/errors/domain.error'

export class CommentNotFoundError extends DomainError {
	constructor() {
		super('CommentNotFoundError', 'Comment not found.')
	}
}
