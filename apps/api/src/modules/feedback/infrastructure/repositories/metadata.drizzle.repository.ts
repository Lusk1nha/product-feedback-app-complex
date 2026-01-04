import * as schema from 'src/shared/infrastructure/database/schema'

import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_PROVIDER } from 'src/shared/infrastructure/database/database.module'
import { IMetadataRepository } from '../../domain/repositories/metadata.repository.interface'
import { FeedbackCategory } from '../../domain/entities/reference/feedback-category.entity'
import { FeedbackStatus } from '../../domain/entities/reference/feedback-status.entity'
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
				description: row.description,
				hexColor: row.hexColor,
				order: row.order,
				includeInRoadmap: row.includeInRoadmap,
				enabled: row.enabled,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			}),
		)
	}

	async findStatusesIncludedInRoadmap(): Promise<FeedbackStatus[]> {
		const rows = await this.db
			.select()
			.from(schema.feedbackStatuses)
			.where(eq(schema.feedbackStatuses.includeInRoadmap, true))

		return rows?.map((row) =>
			FeedbackStatus.create({
				slug: row.slug,
				label: row.label,
				description: row.description,
				hexColor: row.hexColor,
				order: row.order,
				includeInRoadmap: row.includeInRoadmap,
				enabled: row.enabled,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
			}),
		)
	}

	async findStatusBySlug(slug: string): Promise<FeedbackStatus | null> {
		const rows = await this.db
			.select()
			.from(schema.feedbackStatuses)
			.where(eq(schema.feedbackStatuses.slug, slug))
			.limit(1)

		if (rows.length === 0) return null

		const row = rows[0]

		return FeedbackStatus.create({
			slug: row.slug,
			label: row.label,
			description: row.description,
			hexColor: row.hexColor,
			order: row.order,
			includeInRoadmap: row.includeInRoadmap,
			enabled: row.enabled,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		})
	}

	async findCategoryBySlug(slug: string): Promise<FeedbackCategory | null> {
		const rows = await this.db
			.select()
			.from(schema.feedbackCategories)
			.where(eq(schema.feedbackCategories.slug, slug))
			.limit(1)

		if (rows.length === 0) return null

		const row = rows[0]

		return FeedbackCategory.create({
			slug: row.slug,
			label: row.label,
			order: row.order,
			enabled: row.enabled,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		})
	}
}
