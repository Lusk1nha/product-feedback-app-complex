import { Inject, Injectable } from '@nestjs/common'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import {
	IMetadataRepository,
	METADATA_REPOSITORY,
} from '../../domain/repositories/metadata.repository.interface'
import { FeedbackCategory } from '../../domain/value-objects/feedback-category.vo'
import { FeedbackStatus } from '../../domain/value-objects/feedback-status.vo'

export interface AppMetadataOutput {
	categories: FeedbackCategory[]
	statuses: FeedbackStatus[]
}

@Injectable()
export class GetAppMetadataUseCase implements IUseCase<
	void,
	AppMetadataOutput
> {
	constructor(
		@Inject(METADATA_REPOSITORY)
		private readonly metadataRepository: IMetadataRepository,
	) {}

	async execute(): Promise<AppMetadataOutput> {
		const [categories, statuses] = await Promise.all([
			this.metadataRepository.findAllCategories(),
			this.metadataRepository.findAllStatuses(),
		])

		return { categories, statuses }
	}
}
