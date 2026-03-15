import { Inject, Injectable } from '@nestjs/common'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { Comment } from '../../../domain/entities/comment.entity'
import {
	COMMENT_REPOSITORY,
	ICommentRepository,
} from '@/modules/feedback/domain/repositories/comment.repository.interface'
import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from '@/modules/feedback/domain/repositories/feedback.repository.interface'
import { FeedbackNotFoundError } from '../../../domain/errors/feedback/feedback-not-found.error'

export interface ListFeedbackCommentsCommand {
	feedbackId: number
	currentUser?: User
}

@Injectable()
export class ListFeedbackCommentsUseCase implements IUseCase<
	ListFeedbackCommentsCommand,
	Comment[]
> {
	constructor(
		@Inject(COMMENT_REPOSITORY)
		private readonly commentRepository: ICommentRepository,

		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,
	) {}

	async execute(command: ListFeedbackCommentsCommand): Promise<Comment[]> {
		const feedback = await this.feedbackRepository.findById(command.feedbackId)

		if (!feedback) {
			throw new FeedbackNotFoundError()
		}

		return await this.commentRepository.findTreeByFeedbackId(
			command.feedbackId,
			command.currentUser?.id,
		)
	}
}
