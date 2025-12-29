import * as schema from 'src/shared/infrastructure/database/schema'

import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_PROVIDER } from 'src/shared/infrastructure/database/database.module'
import { IMetadataRepository } from '../../domain/repositories/metadata.repository.interface'
import { FeedbackCategory } from '../../domain/value-objects/feedback-category.vo'
import { FeedbackStatus } from '../../domain/value-objects/feedback-status.vo'
import { eq } from 'drizzle-orm'

@Injectable()
export class MetadataDrizzleRepository implements IMetadataRepository {
	constructor(
		@Inject(DRIZZLE_PROVIDER)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async findAllCategories(): Promise<FeedbackCategory[]> {
		const rows = await this.db
			.select()
			.from(schema.feedbackCategories)
			.orderBy(schema.feedbackCategories.order)
			.where(eq(schema.feedbackCategories.enabled, true))

		return rows.map((row) =>
			FeedbackCategory.create({
				slug: row.slug,
				label: row.label,
				order: row.order,
				enabled: row.enabled,
				createdAt: new Date(row.createdAt),
				updatedAt: new Date(row.updatedAt),
			}),
		)
	}

	async findAllStatuses(): Promise<FeedbackStatus[]> {
		const rows = await this.db
			.select()
			.from(schema.feedbackStatuses)
			.orderBy(schema.feedbackStatuses.order)
			.where(eq(schema.feedbackStatuses.enabled, true))

		return rows.map((row) =>
			FeedbackStatus.create({
				slug: row.slug,
				label: row.label,
				hexColor: row.hexColor,
				order: row.order,
				includeInRoadmap: row.includeInRoadmap,
				enabled: row.enabled,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			}),
		)
	}
}
