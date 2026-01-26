import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { FeedbackCreatedEvent } from '../../domain/events/feedback-created.event'
import {
	IPubSubService,
	PUB_SUB_SERVICE,
} from 'src/shared/application/ports/pub-sub.service.interface'
import { PubSubChannel } from 'src/shared/application/ports/pub-sub.contract'

@Injectable()
export class FeedbackRedisListener {
	constructor(
		@Inject(PUB_SUB_SERVICE)
		private readonly pubSubService: IPubSubService,
	) {}

	@OnEvent(FeedbackCreatedEvent.EVENT_NAME, { async: true })
	async handleFeedbackCreatedEvent(event: FeedbackCreatedEvent) {
		await this.pubSubService.publish(
			PubSubChannel.FEEDBACK_CREATED,
			event.props,
		)
	}
}
