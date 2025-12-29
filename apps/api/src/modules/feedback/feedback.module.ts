import { Module } from '@nestjs/common'
import { GetAppMetadataUseCase } from './application/use-cases/get-app-metadata.usecase'
import { MetadataDrizzleRepository } from './infrastructure/repositories/metadata.drizzle.repository'
import { MetadataController } from './infrastructure/http/controllers/metadata.controller'

import { METADATA_REPOSITORY } from './domain/repositories/metadata.repository.interface'

@Module({
	imports: [],
	controllers: [MetadataController],
	providers: [
		// 1. Repositories (Binding Interface -> Implementation)
		{
			provide: METADATA_REPOSITORY,
			useClass: MetadataDrizzleRepository,
		},

		// 2. Use Cases
		GetAppMetadataUseCase,
	],
	exports: [METADATA_REPOSITORY],
})
export class FeedbackModule {}
