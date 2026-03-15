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
import {
	IPermissionService,
	PERMISSION_SERVICE,
} from 'src/modules/iam/application/ports/permission.service.interface'
import { Action } from 'src/modules/iam/infrastructure/types/permission.types'
import { EventEmitter2 } from '@nestjs/event-emitter'



import { CommentNotFoundError } from '@/modules/feedback/domain/errors/comment/comment-not-found.error'
import { InvalidCommentParentError } from '@/modules/feedback/domain/errors/comment/invalid-comment-parent.error'

export interface CreateCommentCommand {
	feedbackId: number
	content: string
	parentId?: number
	currentUser: User
}

@Injectable()
export class CreateCommentUseCase implements IUseCase<
	CreateCommentCommand,
	Comment
> {
	constructor(
		@Inject(COMMENT_REPOSITORY)
		private readonly commentRepository: ICommentRepository,

		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,

		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,

		private readonly eventEmitter: EventEmitter2,
	) {}

	async execute(command: CreateCommentCommand): Promise<Comment> {
		// 1. Controle de Acesso (RBAC/ABAC)
		this.permissionService.ensureCan(
			command.currentUser,
			Action.Create,
			'Comment',
		)

		// 2. Valida se o Feedback alvo existe
		const feedback = await this.feedbackRepository.findById(command.feedbackId)
		if (!feedback) {
			throw new FeedbackNotFoundError()
		}

		// 3. Validações de Integridade Relacional (Caso seja uma Resposta/Reply)
		if (command.parentId) {
			// Nota: adicione um findById no seu ICommentRepository e CommentDrizzleRepository
			const parentComment = await this.commentRepository.findById(
				command.parentId,
			)

			if (!parentComment) {
				throw new CommentNotFoundError()
			}

			// Previne que alguém "hackeie" a API injetando um parentId de outro feedback
			if (parentComment.feedbackId !== command.feedbackId) {
				throw new InvalidCommentParentError()
			}
		}

		// 4. Cria a Entidade de Domínio (aqui as validações de tamanho de texto são executadas)
		const commentCandidate = Comment.create({
			content: command.content,
			feedbackId: command.feedbackId,
			authorId: command.currentUser.id,
			parentId: command.parentId,
		})

		// 5. Persiste no Banco de Dados
		const createdComment = await this.commentRepository.create(commentCandidate)

		// 6. (Opcional) Dispara evento para o WebSocket/Redis ler depois
		// this.eventEmitter.emit('comment.created', {
		// 	userId: command.currentUser.id,
		// 	comment: createdComment,
		// })

		return createdComment
	}
}
