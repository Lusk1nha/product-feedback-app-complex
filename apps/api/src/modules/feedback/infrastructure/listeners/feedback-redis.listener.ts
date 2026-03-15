import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { FeedbackCreatedEvent } from '../../domain/events/feedback-created.event'
import {
	IPubSubService,
	PUB_SUB_SERVICE,
} from 'src/shared/application/ports/pub-sub.service.interface'
import { PubSubChannel } from 'src/shared/application/ports/pub-sub.contract'
import { FeedbackPresenter } from '../http/presenters/feedback.presenter'
import { FeedbackUpdatedEvent } from '../../domain/events/feedback-updated.event'
import { FeedbackDeletedEvent } from '../../domain/events/feedback-deleted.event'
import { FeedbackUpvoteToggledEvent } from '../../domain/events/feedback-upvote-toggled.event'

@Injectable()
export class FeedbackRedisListener {
	constructor(
		@Inject(PUB_SUB_SERVICE)
		private readonly pubSubService: IPubSubService,
	) {}

	@OnEvent(FeedbackCreatedEvent.EVENT_NAME, { async: true })
	async handleFeedbackCreatedEvent(event: FeedbackCreatedEvent) {
		const dto = FeedbackPresenter.toHTTP(event.props.feedback)
		await this.pubSubService.publish(PubSubChannel.FEEDBACK_CREATED, {
			userId: event.props.userId,
			feedback: dto,
		})
	}

	@OnEvent(FeedbackUpdatedEvent.EVENT_NAME, { async: true })
	async handleFeedbackUpdatedEvent(event: FeedbackUpdatedEvent) {
		const dto = FeedbackPresenter.toHTTP(event.props.feedback)
		await this.pubSubService.publish(PubSubChannel.FEEDBACK_UPDATED, {
			editorId: event.props.editorId,
			feedbackId: event.props.feedbackId,
			feedback: dto,
		})
	}

	@OnEvent(FeedbackUpvoteToggledEvent.EVENT_NAME, { async: true })
	async handleFeedbackUpvoteToggledEvent(event: FeedbackUpvoteToggledEvent) {
		const dto = FeedbackPresenter.toHTTP(event.props.feedback)

		await this.pubSubService.publish(PubSubChannel.FEEDBACK_UPVOTE_TOGGLED, {
			userId: event.props.userId,
			feedback: dto,

			hasUpvoted: event.props.hasUpvoted,
			upvotesCount: event.props.upvotesCount,
		})
	}

	@OnEvent(FeedbackDeletedEvent.EVENT_NAME, { async: true })
	async handleFeedbackDeletedEvent(event: FeedbackDeletedEvent) {
		await this.pubSubService.publish(PubSubChannel.FEEDBACK_DELETED, {
			editorId: event.props.editorId,
			feedbackId: event.props.feedbackId,
		})
	}
}
