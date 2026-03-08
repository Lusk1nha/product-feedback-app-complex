import { Feedback } from '../entities/feedback.entity'

export class FeedbackUpdatedEvent {
	static readonly EVENT_NAME = 'feedback.updated'

	constructor(
		public readonly props: {
			editorId: number
			feedbackId: number
			feedback: Feedback
		},
	) {}
}
