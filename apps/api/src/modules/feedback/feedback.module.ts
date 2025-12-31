import { Module } from '@nestjs/common'
import { GetAppMetadataUseCase } from './application/use-cases/metadata/get-app-metadata.usecase'
import { MetadataDrizzleRepository } from './infrastructure/repositories/metadata.drizzle.repository'
import { MetadataController } from './infrastructure/http/controllers/metadata.controller'

import { METADATA_REPOSITORY } from './domain/repositories/metadata.repository.interface'
import { FeedbackController } from './infrastructure/http/controllers/feedback.controller'
import { GetRoadmapStatsUseCase } from './application/use-cases/feedback/get-roadmap-stats.usecase'
import { FeedbackDrizzleRepository } from './infrastructure/repositories/feedback.drizzle.repository'
import { FEEDBACK_REPOSITORY } from './domain/repositories/feedback.repository.interface'
import { CaslPermissionService } from '../iam/infrastructure/services/casl-permission.service'
import { PERMISSION_SERVICE } from '../iam/application/ports/permission.service.interface'
import { CreateFeedbackUseCase } from './application/use-cases/feedback/create-feedback.usecase'
import { DeleteFeedbackUseCase } from './application/use-cases/feedback/delete-feedback.usecase'
import { GetFeedbackByIdUseCase } from './application/use-cases/feedback/get-feedback-by-id.usecase'
import { UpdateFeedbackUseCase } from './application/use-cases/feedback/update-feedback.usecase'

@Module({
	imports: [],
	controllers: [FeedbackController, MetadataController],
	providers: [
		// 1. Repositories (Binding Interface -> Implementation)
		{
			provide: METADATA_REPOSITORY,
			useClass: MetadataDrizzleRepository,
		},

		{
			provide: FEEDBACK_REPOSITORY,
			useClass: FeedbackDrizzleRepository,
		},

		{ provide: PERMISSION_SERVICE, useClass: CaslPermissionService },

		// 2. Use Cases
		GetAppMetadataUseCase,
		GetRoadmapStatsUseCase,
		GetFeedbackByIdUseCase,
		CreateFeedbackUseCase,
		UpdateFeedbackUseCase,
		DeleteFeedbackUseCase,
	],
	exports: [METADATA_REPOSITORY, FEEDBACK_REPOSITORY],
})
export class FeedbackModule {}
