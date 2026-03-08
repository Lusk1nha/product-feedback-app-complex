export class FeedbackDeletedEvent {
	static readonly EVENT_NAME = 'feedback.deleted'

	constructor(
		public readonly props: {
			editorId: number
			feedbackId: number
		},
	) {}
}
