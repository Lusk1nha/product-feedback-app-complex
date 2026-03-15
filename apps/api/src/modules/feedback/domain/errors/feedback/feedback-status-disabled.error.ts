import { DomainError } from '@/shared/domain/errors/domain.error'

export class FeedbackStatusDisabledError extends DomainError {
	constructor() {
		super('FeedbackStatusDisabledError', 'Cannot switch to a disabled status.')
	}
}
