import {
	FEEDBACK_REPOSITORY,
	IFeedbackRepository,
} from '@/modules/feedback/domain/repositories/feedback.repository.interface'
import {
	IMetadataRepository,
	METADATA_REPOSITORY,
} from '@/modules/feedback/domain/repositories/metadata.repository.interface'
import { RoadmapColumnRaw } from '@/modules/feedback/infrastructure/http/presenters/roadmap.presenter'
import { User } from '@/modules/iam/domain/entities/user.entity'
import { IUseCase } from '@/shared/application/interfaces/use-case.interface'
import { Inject, Injectable } from '@nestjs/common'

interface GetRoadmapDataCommand {
	currentUser: User
}

@Injectable()
export class GetRoadmapDataUseCase implements IUseCase<
	GetRoadmapDataCommand,
	RoadmapColumnRaw[]
> {
	constructor(
		@Inject(METADATA_REPOSITORY)
		private readonly metadataRepository: IMetadataRepository,

		@Inject(FEEDBACK_REPOSITORY)
		private readonly feedbackRepository: IFeedbackRepository,
	) {}

	async execute(_command: GetRoadmapDataCommand): Promise<RoadmapColumnRaw[]> {
		const statusesIncludedInRoadmap =
			await this.metadataRepository.findStatusesIncludedInRoadmap()

		const sortedStatusesByOrder = statusesIncludedInRoadmap.sort(
			(status1, status2) => status1.order - status2.order,
		)

		const columns = await Promise.all(
			sortedStatusesByOrder?.map(async (status) => {
				const feedbacks = await this.feedbackRepository.findAllByStatusSlug(
					status.slug,
				)

				return {
					status,
					feedbacks,
				}
			}),
		)

		return columns
	}
}
