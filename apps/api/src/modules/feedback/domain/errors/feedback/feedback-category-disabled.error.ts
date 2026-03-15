import { DomainError } from '@/shared/domain/errors/domain.error'

export class FeedbackCategoryDisabledError extends DomainError {
	constructor() {
		super('FeedbackCategoryDisabledError', 'Cannot switch to a disabled category.')
	}
}
