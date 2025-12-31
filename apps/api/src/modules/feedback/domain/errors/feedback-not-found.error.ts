import { DomainError } from 'src/shared/domain/errors/domain.error'

export class FeedbackNotFoundError extends DomainError {
	constructor() {
		super(`Feedback not found`, 'FEEDBACK_NOT_FOUND')
	}
}
