import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from '@/modules/feedback/domain/repositories/feedback.repository.interface'
import { User } from '@/modules/iam/domain/entities/user.entity'
import { IUseCase } from '@/shared/application/interfaces/use-case.interface'
import { Inject, Injectable } from '@nestjs/common'

interface CountFeedbacksCommand {
	currentUser: User
	status: string
}

@Injectable()
export class CountFeedbacksUseCase implements IUseCase<
	CountFeedbacksCommand,
	number
> {
	constructor(
		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,
	) {}

	async execute(command: CountFeedbacksCommand): Promise<number> {
		console.log(command)

		return await this.feedbackRepository.countByStatus(command.status)
	}
}
