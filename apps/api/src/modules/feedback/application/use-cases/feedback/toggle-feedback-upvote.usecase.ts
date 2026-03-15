import { Inject, Injectable } from '@nestjs/common'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from '../../../domain/repositories/feedback.repository.interface'
import { FeedbackNotFoundError } from '../../../domain/errors/feedback/feedback-not-found.error'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FeedbackUpvoteToggledEvent } from '@/modules/feedback/domain/events/feedback-upvote-toggled.event'

export interface ToggleFeedbackUpvoteCommand {
	feedbackId: number
	currentUser: User
}

export interface ToggleFeedbackUpvoteResult {
	hasUpvoted: boolean
	upvotesCount: number
}

@Injectable()
export class ToggleFeedbackUpvoteUseCase implements IUseCase<
	ToggleFeedbackUpvoteCommand,
	ToggleFeedbackUpvoteResult
> {
	constructor(
		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async execute(
		command: ToggleFeedbackUpvoteCommand,
	): Promise<ToggleFeedbackUpvoteResult> {
		const feedback = await this.feedbackRepository.findById(command.feedbackId)

		if (!feedback) {
			throw new FeedbackNotFoundError()
		}

		const result = await this.feedbackRepository.toggleUpvote(
			command.feedbackId,
			command.currentUser.id,
		)

		this.eventEmitter.emit(
			FeedbackUpvoteToggledEvent.EVENT_NAME,
			new FeedbackUpvoteToggledEvent({
				feedback,
				userId: command.currentUser.id,

				hasUpvoted: result.hasUpvoted,
				upvotesCount: result.upvotesCount,
			}),
		)

		return result
	}
}
