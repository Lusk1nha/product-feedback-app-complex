export class FeedbackCreatedEvent {
	static readonly EVENT_NAME = 'feedback.created'

	constructor(
		public readonly props: {
			id: number
			title: string
			categorySlug: string
			statusSlug: string
			createdAt: Date
		},
	) {}
}
