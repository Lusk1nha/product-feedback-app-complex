import { Inject, Injectable } from '@nestjs/common'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from '../../../domain/repositories/feedback.repository.interface'

import {
	IPermissionService,
	PERMISSION_SERVICE,
} from 'src/modules/iam/application/ports/permission.service.interface'
import { Action } from 'src/modules/iam/infrastructure/types/permission.types'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FeedbackDeletedEvent } from '@/modules/feedback/domain/events/feedback-deleted.event'

interface DeleteFeedbackCommand {
	currentUser: User
	feedbackId: number
}

@Injectable()
export class DeleteFeedbackUseCase implements IUseCase<
	DeleteFeedbackCommand,
	void
> {
	constructor(
		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,

		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,

		private readonly eventEmitter: EventEmitter2,
	) {}

	async execute(command: DeleteFeedbackCommand) {
		const feedbackToDelete = await this.feedbackRepository.findByIdOrThrow(
			command.feedbackId,
		)

		this.permissionService.ensureCan(
			command.currentUser,
			Action.Delete,
			feedbackToDelete,
		)

		await this.feedbackRepository.delete(feedbackToDelete)

		this.eventEmitter.emit(FeedbackDeletedEvent.EVENT_NAME, {
			props: {
				editorId: command.currentUser.id,
				feedbackId: feedbackToDelete.id,
			},
		})
	}
}
