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
import {
	IMetadataRepository,
	METADATA_REPOSITORY,
} from '@/modules/feedback/domain/repositories/metadata.repository.interface'
import { FeedbackStatusInvalidError } from '@/modules/feedback/domain/errors/feedback-status-invalid.error'
import { FeedbackCategoryInvalidError } from '@/modules/feedback/domain/errors/feedback-category-invalid.error'

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
	private readonly DEFAULT_INITIAL_STATUS = 'suggestion'

	constructor(
		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,

		@Inject(METADATA_REPOSITORY)
		private readonly metadataRepository: IMetadataRepository,

		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,
	) {}

	async execute(command: CreateFeedbackCommand): Promise<Feedback> {
		this.permissionService.ensureCan(
			command.currentUser,
			Action.Create,
			'Feedback',
		)

		// 1. Busca as referências
		const [initialStatus, category] = await Promise.all([
			this.metadataRepository.findStatusBySlug(this.DEFAULT_INITIAL_STATUS),
			this.metadataRepository.findCategoryBySlug(command.params.categorySlug),
		])

		// 2. Garante existência (Fail Fast)
		if (!initialStatus) throw new FeedbackStatusInvalidError()
		if (!category) throw new FeedbackCategoryInvalidError()

		// 3. Criação passando Objetos Ricos
		const newFeedback = Feedback.create({
			title: command.params.title,
			description: command.params.description,
			authorId: command.currentUser.id,
			category: category,
			initialStatus: initialStatus,
		})

		return await this.feedbackRepository.create(newFeedback)
	}
}
