import { Inject, Injectable } from '@nestjs/common'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import {
	COMMENT_REPOSITORY,
	ICommentRepository,
} from '../../../domain/repositories/comment.repository.interface'
import { CommentNotFoundError } from '@/modules/feedback/domain/errors/comment/comment-not-found.error'
import { InvalidCommentParentError } from '@/modules/feedback/domain/errors/comment/invalid-comment-parent.error'

export interface ToggleCommentUpvoteCommand {
	feedbackId: number
	commentId: number
	currentUser: User
}

export interface ToggleCommentUpvoteResult {
	hasUpvoted: boolean
	upvotesCount: number
}

@Injectable()
export class ToggleCommentUpvoteUseCase implements IUseCase<
	ToggleCommentUpvoteCommand,
	ToggleCommentUpvoteResult
> {
	constructor(
		@Inject(COMMENT_REPOSITORY)
		private readonly commentRepository: ICommentRepository,
	) {}

	async execute(
		command: ToggleCommentUpvoteCommand,
	): Promise<ToggleCommentUpvoteResult> {
		const { feedbackId, commentId, currentUser } = command

		const comment = await this.commentRepository.findById(commentId)

		if (!comment) {
			throw new CommentNotFoundError()
		}

		if (comment.feedbackId !== feedbackId) {
			throw new InvalidCommentParentError()
		}

		const result = await this.commentRepository.toggleUpvote(
			commentId,
			currentUser.id,
		)

		return result
	}
}
