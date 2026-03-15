import { DomainError } from '@/shared/domain/errors/domain.error'

export class FeedbackStatusInvalidError extends DomainError {
	constructor() {
		super('Feedback status is invalid', 'FEEDBACK_STATUS_INVALID')
	}
}
