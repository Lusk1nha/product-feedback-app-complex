import { DomainError } from '@/shared/domain/errors/domain.error'

export class CommentContentTooShortError extends DomainError {
	constructor(minLength: number) {
		super(
			'CommentContentTooShortError',
			`The comment content must be at least ${minLength} characters long.`,
		)
	}
}
