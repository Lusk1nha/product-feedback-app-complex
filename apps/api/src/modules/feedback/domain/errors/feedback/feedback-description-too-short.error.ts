import { DomainError } from 'src/shared/domain/errors/domain.error'

export class FeedbackDescriptionTooShortError extends DomainError {
	constructor(minLength: number) {
		super(
			`Feedback description must be at least ${minLength} characters long`,
			'FEEDBACK_DESCRIPTION_TOO_SHORT',
		)
	}
}
