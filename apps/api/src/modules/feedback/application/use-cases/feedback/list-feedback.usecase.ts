import { Inject, Injectable } from '@nestjs/common'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from '../../../domain/repositories/feedback.repository.interface'
import { Feedback } from '../../../domain/entities/feedback.entity'
import { FeedbackSort } from '../../../domain/enums/feedback-sort.enum'

import {
	IPermissionService,
	PERMISSION_SERVICE,
} from 'src/modules/iam/application/ports/permission.service.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { Action } from 'src/modules/iam/infrastructure/types/permission.types'
import { PaginatedResult } from 'src/shared/application/interfaces/paginated-result.interface'

export interface ListFeedbacksCommand {
	currentUser: User

	category?: string
	sort?: FeedbackSort
	page?: number
	perPage?: number
}

@Injectable()
export class ListFeedbacksUseCase implements IUseCase<
	ListFeedbacksCommand,
	PaginatedResult<Feedback>
> {
	constructor(
		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,

		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,
	) {}

	async execute(
		command: ListFeedbacksCommand,
	): Promise<PaginatedResult<Feedback>> {
		const { currentUser } = command

		this.permissionService.ensureCan(currentUser, Action.Read, 'Feedback')

		return this.feedbackRepository.findAll({
			categorySlug: command.category,
			sort: command.sort,
			page: command.page || 1, // Default seguro
			perPage: command.perPage || 10, // Default seguro
		})
	}
}
