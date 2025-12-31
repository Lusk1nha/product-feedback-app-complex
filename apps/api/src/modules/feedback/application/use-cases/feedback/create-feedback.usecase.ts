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

export interface CreateFeedbackCommand {
	currentUser: User
	params: {
		title: string
		description: string
		categorySlug: string
	}
}

@Injectable()
export class CreateFeedbackUseCase implements IUseCase<
	CreateFeedbackCommand,
	Feedback
> {
	constructor(
		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,

		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,
	) {}

	async execute(command: CreateFeedbackCommand): Promise<Feedback> {
		console.log(command.currentUser)
		console.log(command.params)
		console.log(Feedback.name)

		this.permissionService.ensureCan(
			command.currentUser,
			Action.Create,
			'Feedback',
		)

		const newFeedback = Feedback.create({
			title: command.params.title,
			description: command.params.description,
			categorySlug: command.params.categorySlug,
			authorId: command.currentUser.id,
		})

		const savedFeedback = await this.feedbackRepository.create(newFeedback)

		return savedFeedback
	}
}
