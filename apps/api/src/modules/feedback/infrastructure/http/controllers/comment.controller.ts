import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Auth } from 'src/shared/infrastructure/http/decorators/auth.decorator'
import { CurrentUser } from 'src/modules/iam/infrastructure/http/decorators/current-user.decorator'
import { User } from 'src/modules/iam/domain/entities/user.entity'

import { ListFeedbackCommentsUseCase } from '@/modules/feedback/application/use-cases/comment/list-feedback-comments.usecase'
import { CreateCommentUseCase } from '@/modules/feedback/application/use-cases/comment/create-comment.usecase'
import { ToggleCommentUpvoteUseCase } from '@/modules/feedback/application/use-cases/comment/toggle-comment-upvote.usecase'

import {
	CommentPresenter,
	CommentResponse,
} from '../presenters/comment.presenter'
import { CreateCommentDto } from '../dtos/comment/create-comment.dto'

@ApiTags('Comments')
@Controller('feedbacks/:feedbackId/comments')
export class CommentController {
	constructor(
		private readonly createCommentUseCase: CreateCommentUseCase,
		private readonly listFeedbackCommentsUseCase: ListFeedbackCommentsUseCase,
		private readonly toggleCommentUpvoteUseCase: ToggleCommentUpvoteUseCase,
	) {}

	@ApiOperation({ summary: 'List all comments for a feedback as a tree' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The tree of comments and replies',
		type: [CommentResponse], // Documentação rica para o Swagger!
	})
	@Get()
	@HttpCode(HttpStatus.OK)
	async listTree(
		@Param('feedbackId', ParseIntPipe) feedbackId: number,
		@CurrentUser() currentUser?: User, // Se o usuário não estiver logado, será undefined e o hasUpvoted virá false
	) {
		const comments = await this.listFeedbackCommentsUseCase.execute({
			feedbackId,
			currentUser,
		})

		return comments.map(CommentPresenter.toHTTP)
	}

	@ApiOperation({ summary: 'Add a comment or reply to a feedback' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The created comment',
		type: CommentResponse,
	})
	@Auth() // Protege apenas a criação
	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(
		@Param('feedbackId', ParseIntPipe) feedbackId: number,
		@Body() dto: CreateCommentDto,
		@CurrentUser() currentUser: User,
	) {
		const comment = await this.createCommentUseCase.execute({
			feedbackId,
			content: dto.content,
			parentId: dto.parentId,
			currentUser,
		})

		return CommentPresenter.toHTTP(comment)
	}

	@ApiOperation({ summary: 'Toggle upvote on a comment' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The updated upvote state and count',
	})
	@Auth() // Protege a ação de curtir
	@Post(':commentId/upvote')
	@HttpCode(HttpStatus.OK)
	async toggleUpvote(
		@Param('feedbackId', ParseIntPipe) feedbackId: number,
		@Param('commentId', ParseIntPipe) commentId: number,
		@CurrentUser() currentUser: User,
	) {
		return await this.toggleCommentUpvoteUseCase.execute({
			feedbackId,
			commentId,
			currentUser,
		})
	}
}
