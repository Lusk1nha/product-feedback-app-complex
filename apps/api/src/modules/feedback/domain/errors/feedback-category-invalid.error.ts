import { DomainError } from '@/shared/domain/errors/domain.error'

export class FeedbackCategoryInvalidError extends DomainError {
	constructor() {
		super('Feedback category is invalid', 'FEEDBACK_CATEGORY_INVALID')
	}
}
