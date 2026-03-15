import { Inject, Injectable } from '@nestjs/common'
import { Feedback } from 'src/modules/feedback/domain/entities/feedback.entity'
import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from 'src/modules/feedback/domain/repositories/feedback.repository.interface'
import {
	IPermissionService,
	PERMISSION_SERVICE,
} from 'src/modules/iam/application/ports/permission.service.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { Action } from 'src/modules/iam/infrastructure/types/permission.types'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'

interface GetFeedbackByIdCommand {
	id: number
	currentUser: User
}

@Injectable()
export class GetFeedbackByIdUseCase implements IUseCase<
	GetFeedbackByIdCommand,
	Feedback
> {
	constructor(
		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,

		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,
	) {}

	async execute(command: GetFeedbackByIdCommand): Promise<Feedback> {
		const { id, currentUser } = command

		this.permissionService.ensureCan(currentUser, Action.Read, 'Feedback')

		return await this.feedbackRepository.findByIdOrThrow(id, currentUser.id)
	}
}
