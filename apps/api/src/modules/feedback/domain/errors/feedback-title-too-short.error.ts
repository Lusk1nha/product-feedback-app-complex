import { DomainError } from 'src/shared/domain/errors/domain.error'

export class FeedbackTitleTooShortError extends DomainError {
	constructor(minLength: number) {
		super(
			`Feedback title must be at least ${minLength} characters long`,
			'FEEDBACK_TITLE_TOO_SHORT',
		)
	}
}
