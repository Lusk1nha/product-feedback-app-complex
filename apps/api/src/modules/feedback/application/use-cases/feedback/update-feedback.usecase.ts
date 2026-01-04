import {
	Inject,
	Injectable,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { Action } from 'src/modules/iam/infrastructure/types/permission.types'

// Interfaces e Portas
import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from '../../../domain/repositories/feedback.repository.interface'
import {
	METADATA_REPOSITORY,
	IMetadataRepository,
} from '../../../domain/repositories/metadata.repository.interface'
import {
	PERMISSION_SERVICE,
	IPermissionService,
} from 'src/modules/iam/application/ports/permission.service.interface'

// Entidades
import { Feedback } from '../../../domain/entities/feedback.entity'
import { FeedbackStatus } from '../../../domain/entities/reference/feedback-status.entity'
import { FeedbackCategory } from '../../../domain/entities/reference/feedback-category.entity'
import { FeedbackCategoryInvalidError } from '@/modules/feedback/domain/errors/feedback-category-invalid.error'
import { FeedbackStatusInvalidError } from '@/modules/feedback/domain/errors/feedback-status-invalid.error'

export interface UpdateFeedbackCommand {
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

		@Inject(METADATA_REPOSITORY)
		private readonly metadataRepository: IMetadataRepository,

		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,
	) {}

	async execute(command: UpdateFeedbackCommand): Promise<Feedback> {
		const { targetFeedbackId, currentUser, params } = command

		// 1. Recuperação da Entidade Principal
		const feedback =
			await this.feedbackRepository.findByIdOrThrow(targetFeedbackId)

		// 2. Verificação de Segurança (Policy)
		this.permissionService.ensureCan(currentUser, Action.Update, feedback)

		const [newCategory, newStatus] = await Promise.all([
			this.resolveCategory(params.categorySlug),
			this.resolveStatus(params.statusSlug),
		])

		feedback.update({
			title: params.title,
			description: params.description,
			newCategory,
			newStatus,
		})

		return await this.feedbackRepository.update(feedback)
	}

	/**
	 * Busca a categoria apenas se o slug for fornecido.
	 * Lança exceção HTTP 400 se o slug não existir.
	 */
	private async resolveCategory(
		slug?: string,
	): Promise<FeedbackCategory | undefined> {
		if (!slug) return undefined

		const category = await this.metadataRepository.findCategoryBySlug(slug)
		if (!category) {
			throw new FeedbackCategoryInvalidError()
		}

		return category
	}

	/**
	 * Busca o status apenas se o slug for fornecido.
	 * Lança exceção HTTP 400 se o slug não existir.
	 */
	private async resolveStatus(
		slug?: string,
	): Promise<FeedbackStatus | undefined> {
		if (!slug) return undefined

		const status = await this.metadataRepository.findStatusBySlug(slug)
		if (!status) {
			throw new FeedbackStatusInvalidError()
		}

		return status
	}
}
