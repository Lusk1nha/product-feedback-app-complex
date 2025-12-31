import { Inject, Injectable } from '@nestjs/common'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from '../../../domain/repositories/feedback.repository.interface'
import { Feedback } from '../../../domain/entities/feedback.entity'
import {
	IPermissionService,
	PERMISSION_SERVICE,
} from 'src/modules/iam/application/ports/permission.service.interface'
import { Action } from 'src/modules/iam/infrastructure/types/permission.types'

interface UpdateFeedbackCommand {
	targetFeedbackId: number
	currentUser: User

	params: {
		title?: string
		description?: string
		categorySlug?: string
		statusSlug?: string
	}
}

@Injectable()
export class UpdateFeedbackUseCase implements IUseCase<
	UpdateFeedbackCommand,
	Feedback
> {
	constructor(
		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,

		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,
	) {}

	async execute(command: UpdateFeedbackCommand): Promise<Feedback> {
		const feedbackToUpdate = await this.feedbackRepository.findByIdOrThrow(
			command.targetFeedbackId,
		)

		this.permissionService.ensureCan(
			command.currentUser,
			Action.Update,
			feedbackToUpdate,
		)

		feedbackToUpdate.update(command.params)
		return await this.feedbackRepository.update(feedbackToUpdate)
	}
}
