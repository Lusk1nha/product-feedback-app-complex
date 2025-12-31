import { Inject, Injectable } from '@nestjs/common'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from '../../../domain/repositories/feedback.repository.interface'

@Injectable()
export class GetRoadmapStatsUseCase implements IUseCase<
	void,
	Record<string, number>
> {
	constructor(
		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,
	) {}

	async execute(): Promise<Record<string, number>> {
		return await this.feedbackRepository.countByStatus()
	}
}
