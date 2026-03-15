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
import { ListFeedbacksUseCase } from './application/use-cases/feedback/list-feedback.usecase'
import { CacheModule } from '@nestjs/cache-manager'
import { GetRoadmapDataUseCase } from './application/use-cases/feedback/get-roadmap-data.usecase'
import { RoadmapController } from './infrastructure/http/controllers/roadmap.controller'
import { CountFeedbacksUseCase } from './application/use-cases/feedback/count-feedbacks.usecase'
import { FeedbackRedisListener } from './infrastructure/listeners/feedback-redis.listener'
import { ToggleFeedbackUpvoteUseCase } from './application/use-cases/feedback/toggle-feedback-upvote.usecase'
import { COMMENT_REPOSITORY } from './domain/repositories/comment.repository.interface'
import { CommentDrizzleRepository } from './infrastructure/repositories/comment.drizzle.repository'
import { CreateCommentUseCase } from './application/use-cases/comment/create-comment.usecase'
import { ListFeedbackCommentsUseCase } from './application/use-cases/comment/list-feedback-comments.usecase'
import { ToggleCommentUpvoteUseCase } from './application/use-cases/comment/toggle-comment-upvote.usecase'
import { CommentController } from './infrastructure/http/controllers/comment.controller'

@Module({
	imports: [CacheModule.register({ ttl: 60000 })],
	controllers: [FeedbackController, CommentController, MetadataController, RoadmapController],
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

		{
			provide: COMMENT_REPOSITORY, // <-- Repositório de Comentários
			useClass: CommentDrizzleRepository,
		},

		{ provide: PERMISSION_SERVICE, useClass: CaslPermissionService },

		// Feedback Use Cases
		CreateFeedbackUseCase,
		GetFeedbackByIdUseCase,
		UpdateFeedbackUseCase,
		DeleteFeedbackUseCase,
		ListFeedbacksUseCase,
		CountFeedbacksUseCase,
		ToggleFeedbackUpvoteUseCase,
		GetRoadmapDataUseCase,
		GetRoadmapStatsUseCase,

		// Comment Use Cases <-- Registrados aqui!
		CreateCommentUseCase,
		ListFeedbackCommentsUseCase,
		ToggleCommentUpvoteUseCase,

		// Metadata Use Cases
		GetAppMetadataUseCase,

		// Listeners
		FeedbackRedisListener,
	],
	exports: [METADATA_REPOSITORY, FEEDBACK_REPOSITORY, COMMENT_REPOSITORY],
})
export class FeedbackModule {}
