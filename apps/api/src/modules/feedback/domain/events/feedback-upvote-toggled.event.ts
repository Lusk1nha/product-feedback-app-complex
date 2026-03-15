import { Feedback } from '../entities/feedback.entity'

export class FeedbackUpvoteToggledEvent {
	static readonly EVENT_NAME = 'feedback.toggled.upvote'

	constructor(
		public readonly props: {
			userId: number
			feedback: Feedback
			hasUpvoted: boolean
			upvotesCount: number
		},
	) {}
}
